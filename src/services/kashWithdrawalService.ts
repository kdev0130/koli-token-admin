import crypto from 'crypto';
import { FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firebaseAdminDb } from '@/lib/firebaseAdmin';
import { getTokenBalance, transferFromTreasury } from '@/services/tokenService';
import {
  getKashAccountForFirebaseUser,
  recordKashTransaction,
  toRawAmount,
  toTokenAmount,
} from '@/services/kashService';
import { prisma } from '@/utils/db';

const MONTHLY_PERIOD_DAYS = 30;

type DonationContractType =
  | 'monthly_12_no_principal'
  | 'lockin_6_compound'
  | 'lockin_12_compound';

type ContractPlanConfig = {
  durationMonths: number;
  compoundLockIn: boolean;
  periodicRate: number;
  withdrawalSlots: number;
};

type DonationContract = {
  id: string;
  userId: string;
  donationAmount: number;
  contractType?: DonationContractType;
  verifiedAmount?: number | null;
  discrepancyAmount?: number | null;
  hasDiscrepancy?: boolean;
  reviewOutcome?: string | null;
  donationStartDate: string | null;
  withdrawalsCount: number;
  totalWithdrawn?: number;
  contractEndDate: string | null;
  status: 'pending' | 'active' | 'approved' | 'completed' | 'expired' | 'rejected';
};

type MemberData = {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  preferredPayoutMethod?: string;
  gcashNumber?: string;
  balance?: number;
  hasPinSetup?: boolean;
  pinHash?: string;
  kycStatus?: string;
};

const CONTRACT_PLAN_CONFIG: Record<DonationContractType, ContractPlanConfig> = {
  monthly_12_no_principal: {
    durationMonths: 12,
    compoundLockIn: false,
    periodicRate: 0.3,
    withdrawalSlots: 12,
  },
  lockin_6_compound: {
    durationMonths: 6,
    compoundLockIn: true,
    periodicRate: 0.3,
    withdrawalSlots: 1,
  },
  lockin_12_compound: {
    durationMonths: 12,
    compoundLockIn: true,
    periodicRate: 0.3,
    withdrawalSlots: 1,
  },
};

function getContractType(contract: DonationContract): DonationContractType {
  const value = contract.contractType;
  if (value && value in CONTRACT_PLAN_CONFIG) {
    return value;
  }
  return 'monthly_12_no_principal';
}

function getContractPlanConfig(contract: DonationContract): ContractPlanConfig {
  return CONTRACT_PLAN_CONFIG[getContractType(contract)];
}

function calculateCompoundedContractValue(principal: number, months: number, monthlyRate = 0.3) {
  return Math.max(0, Number(principal) || 0) * Math.pow(1 + Math.max(0, Number(monthlyRate) || 0), Math.max(0, Math.floor(Number(months) || 0)));
}

function getContractPrincipal(contract: DonationContract): number {
  const originalAmount = Math.max(0, Number(contract.donationAmount) || 0);
  const verifiedRaw = contract.verifiedAmount;
  const hasVerifiedAmount = verifiedRaw !== undefined && verifiedRaw !== null && Number.isFinite(Number(verifiedRaw));
  const verifiedAmount = hasVerifiedAmount ? Math.max(0, Number(verifiedRaw) || 0) : originalAmount;
  const outcomeAdjusted = String(contract.reviewOutcome || '').toLowerCase() === 'approved_adjusted';
  const amountAdjusted = hasVerifiedAmount && verifiedAmount !== originalAmount;
  return outcomeAdjusted || Boolean(contract.hasDiscrepancy) || amountAdjusted ? verifiedAmount : originalAmount;
}

function getContractMaxTotalWithdrawal(contract: DonationContract): number {
  const principal = getContractPrincipal(contract);
  const plan = getContractPlanConfig(contract);

  if (plan.compoundLockIn) {
    return calculateCompoundedContractValue(principal, plan.durationMonths, plan.periodicRate);
  }

  return principal * plan.periodicRate * plan.withdrawalSlots;
}

function getContractWithdrawalSlots(contract: DonationContract): number {
  return getContractPlanConfig(contract).withdrawalSlots;
}

function canWithdraw(contract: DonationContract) {
  const now = new Date();

  if (contract.status === 'pending') {
    return { canWithdraw: false, availableAmount: 0, reason: 'Contract pending admin approval' };
  }

  if (!contract.donationStartDate || !contract.contractEndDate) {
    return { canWithdraw: false, availableAmount: 0, reason: 'Contract not yet approved' };
  }

  const startDate = new Date(contract.donationStartDate);
  const endDate = new Date(contract.contractEndDate);
  const plan = getContractPlanConfig(contract);

  if (plan.compoundLockIn) {
    const totalWithdrawn = Number(contract.totalWithdrawn || 0);
    if (now < endDate) {
      return { canWithdraw: false, availableAmount: 0, reason: 'Contract is still locked' };
    }

    const maturityAmount = getContractMaxTotalWithdrawal(contract);
    const availableAmount = Math.max(0, maturityAmount - totalWithdrawn);
    return {
      canWithdraw: availableAmount > 0,
      availableAmount,
      reason: availableAmount > 0 ? 'Withdrawable' : 'All matured funds withdrawn',
    };
  }

  if (now > endDate) {
    return { canWithdraw: false, availableAmount: 0, reason: 'Contract has expired' };
  }

  if (contract.status !== 'active' && contract.status !== 'approved') {
    return { canWithdraw: false, availableAmount: 0, reason: `Contract status is ${contract.status}` };
  }

  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const periodsElapsed = Math.floor(daysSinceStart / MONTHLY_PERIOD_DAYS);
  if (periodsElapsed < 1) {
    return { canWithdraw: false, availableAmount: 0, reason: 'Must wait 30 days after donation before first withdrawal' };
  }

  const amountPerPeriod = getContractPrincipal(contract) * plan.periodicRate;
  const maxTotalWithdrawal = getContractMaxTotalWithdrawal(contract);
  const totalWithdrawn = contract.totalWithdrawn ?? (contract.withdrawalsCount * amountPerPeriod);
  const accumulatedAmount = Math.min(periodsElapsed * amountPerPeriod, maxTotalWithdrawal);
  const availableAmount = Math.max(0, accumulatedAmount - totalWithdrawn);

  return {
    canWithdraw: availableAmount > 0,
    availableAmount,
    reason: availableAmount > 0 ? 'Withdrawable' : 'No funds currently available',
  };
}

function calculateTotalWithdrawable(contracts: DonationContract[], userBalance = 0) {
  const eligibleContracts: Array<{ contract: DonationContract; availableAmount: number }> = [];
  let contractWithdrawals = 0;

  for (const contract of contracts) {
    const withdrawalCheck = canWithdraw(contract);
    if (withdrawalCheck.canWithdraw && withdrawalCheck.availableAmount > 0) {
      eligibleContracts.push({
        contract,
        availableAmount: withdrawalCheck.availableAmount,
      });
      contractWithdrawals += withdrawalCheck.availableAmount;
    }
  }

  const manaBalance = Number(userBalance || 0);
  const totalAmount = contractWithdrawals + manaBalance;

  return {
    totalAmount,
    contractWithdrawals,
    manaBalance,
    eligibleContracts,
  };
}

function distributeWithdrawalAmount(
  requestedAmount: number,
  eligibleContracts: Array<{ contract: DonationContract; availableAmount: number }>
) {
  const totalAvailable = eligibleContracts.reduce(
    (sum: number, item: { availableAmount: number }) => sum + item.availableAmount,
    0
  );
  if (requestedAmount > totalAvailable) {
    throw new Error(`Requested amount ${requestedAmount.toFixed(2)} KOLI exceeds available ${totalAvailable.toFixed(2)} KOLI`);
  }

  const distribution: Array<{ contractId: string; amount: number; contract: DonationContract }> = [];
  let remainingAmount = requestedAmount;

  for (const { contract, availableAmount } of eligibleContracts) {
    if (remainingAmount <= 0) break;
    const amountFromThisContract = Math.min(remainingAmount, availableAmount);
    if (amountFromThisContract > 0) {
      distribution.push({
        contractId: contract.id,
        amount: amountFromThisContract,
        contract,
      });
      remainingAmount -= amountFromThisContract;
    }
  }

  if (remainingAmount > 0 && distribution.length > 0) {
    distribution[0].amount += remainingAmount;
  }

  return distribution;
}

function canUserWithdraw(member: MemberData) {
  const kycStatus = String(member.kycStatus || 'NOT_SUBMITTED').toUpperCase();
  const allowed = kycStatus === 'VERIFIED' || kycStatus === 'APPROVED';
  return {
    allowed,
    reason: allowed ? undefined : 'KYC verification required before withdrawal.',
  };
}

function validatePinFormat(pin: string) {
  return /^\d{6}$/.test(pin);
}

function simpleHash(pin: string) {
  let hash = 0;
  for (let index = 0; index < pin.length; index += 1) {
    const char = pin.charCodeAt(index);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const mixed = Math.abs(hash * 31 + pin.length * 17);
  return mixed.toString(16).padStart(8, '0');
}

function verifyPinHash(pin: string, storedHash: string) {
  const sha256 = crypto.createHash('sha256').update(pin).digest('hex');
  return storedHash === sha256 || storedHash === simpleHash(pin);
}

async function getWithdrawalContext(firebaseUid: string) {
  const [memberSnapshot, contractSnapshots] = await Promise.all([
    firebaseAdminDb.collection('members').doc(firebaseUid).get(),
    firebaseAdminDb.collection('donationContracts').where('userId', '==', firebaseUid).get(),
  ]);

  if (!memberSnapshot.exists) {
    throw new Error('Member account not found');
  }

  const memberData = (memberSnapshot.data() || {}) as MemberData;
  const contracts = contractSnapshots.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...(doc.data() as Omit<DonationContract, 'id'>),
  }));

  const withdrawable = calculateTotalWithdrawable(contracts, memberData.balance || 0);

  return {
    memberRef: memberSnapshot.ref,
    memberData,
    contracts,
    withdrawable,
  };
}

export async function getWithdrawableSummary(firebaseUid: string) {
  const { withdrawable } = await getWithdrawalContext(firebaseUid);
  return withdrawable;
}

export async function withdrawToKash(params: {
  firebaseUid: string;
  amount: number;
  pin: string;
}) {
  const { firebaseUid, amount, pin } = params;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  if (!validatePinFormat(pin)) {
    throw new Error('PIN must be exactly 6 digits');
  }

  const { memberRef, memberData, contracts, withdrawable } = await getWithdrawalContext(firebaseUid);
  const kyc = canUserWithdraw(memberData);
  if (!kyc.allowed) {
    throw new Error(kyc.reason);
  }

  if (!memberData.hasPinSetup || !memberData.pinHash) {
    throw new Error('PIN is not configured for this account');
  }

  if (!verifyPinHash(pin, memberData.pinHash)) {
    throw new Error('Incorrect PIN');
  }

  if (amount > withdrawable.totalAmount) {
    throw new Error(`Requested amount ${amount.toFixed(2)} KOLI exceeds available ${withdrawable.totalAmount.toFixed(2)} KOLI`);
  }

  const kashAccount = await getKashAccountForFirebaseUser(firebaseUid);
  if (!kashAccount) {
    throw new Error('K-Kash account not found. Please sign in to K-Kash first.');
  }

  const now = new Date().toISOString();
  const withdrawalSessionId = `kash_${Date.now()}_${firebaseUid.slice(0, 8)}`;
  const amountFromMana = Math.min(amount, withdrawable.manaBalance);
  const amountFromContracts = Math.max(0, amount - amountFromMana);
  const distribution = amountFromContracts > 0
    ? distributeWithdrawalAmount(amountFromContracts, withdrawable.eligibleContracts)
    : [];

  const rawAmount = toRawAmount(amount);
  const transferResult = await transferFromTreasury(kashAccount.walletPublicKey, Number(rawAmount));
  if (!transferResult.success || !transferResult.txHash) {
    throw new Error(transferResult.error || 'Treasury transfer failed');
  }

  const updatedRawBalance = BigInt(await getTokenBalance(kashAccount.walletPublicKey));
  const updatedBalance = toTokenAmount(updatedRawBalance);

  const batch = firebaseAdminDb.batch();
  const payoutQueue = firebaseAdminDb.collection('payout_queue');

  if (amountFromMana > 0) {
    const currentBalance = Number(memberData.balance || 0);
    batch.update(memberRef, {
      balance: Math.max(0, currentBalance - amountFromMana),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const manaPayoutRef = payoutQueue.doc();
    batch.set(manaPayoutRef, {
      userId: firebaseUid,
      userName: memberData.fullName || memberData.email || 'Unknown',
      userEmail: memberData.email || '',
      userPhone: memberData.phoneNumber || '',
      amount: amountFromMana,
      netAmount: amountFromMana,
      grossAmount: amountFromMana,
      platformFee: 0,
      withdrawalType: 'MANA_REWARDS',
      destinationApp: 'K_KASH',
      kashWalletPublicKey: kashAccount.walletPublicKey,
      transactionHash: transferResult.txHash,
      isPooled: true,
      withdrawalSessionId,
      totalWithdrawableBalance: Math.max(0, withdrawable.totalAmount - amount),
      status: 'completed',
      paymentMethod: 'K_KASH',
      requestedAt: now,
      processedAt: now,
      processedBy: 'kash_treasury_service',
      transactionProof: transferResult.txHash,
      notes: `K-Kash treasury withdrawal (${amountFromMana.toFixed(2)} KOLI from MANA balance)`,
    });
  }

  for (const item of distribution) {
    const { contract, contractId, amount: contractAmount } = item;
    const contractRef = firebaseAdminDb.collection('donationContracts').doc(contractId);
    const plan = getContractPlanConfig(contract);
    const amountPerPeriod = getContractPrincipal(contract) * plan.periodicRate;
    const maxTotalWithdrawal = getContractMaxTotalWithdrawal(contract);
    const currentTotalWithdrawn = contract.totalWithdrawn ?? (contract.withdrawalsCount * amountPerPeriod);
    const newTotalWithdrawn = currentTotalWithdrawn + contractAmount;
    const equivalentPeriods = plan.compoundLockIn
      ? (newTotalWithdrawn > 0 ? 1 : 0)
      : Math.ceil(newTotalWithdrawn / amountPerPeriod);
    const newStatus = newTotalWithdrawn >= maxTotalWithdrawal ? 'completed' : contract.status;
    const remainingBalance = Math.max(0, maxTotalWithdrawal - newTotalWithdrawn);

    batch.update(contractRef, {
      totalWithdrawn: newTotalWithdrawn,
      withdrawalsCount: equivalentPeriods,
      lastWithdrawalDate: now,
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const payoutRef = payoutQueue.doc();
    batch.set(payoutRef, {
      userId: firebaseUid,
      userName: memberData.fullName || memberData.email || 'Unknown',
      userEmail: memberData.email || '',
      userPhone: memberData.phoneNumber || '',
      contractId,
      amount: contractAmount,
      netAmount: contractAmount,
      grossAmount: contractAmount,
      platformFee: 0,
      isPooled: true,
      destinationApp: 'K_KASH',
      kashWalletPublicKey: kashAccount.walletPublicKey,
      transactionHash: transferResult.txHash,
      withdrawalSessionId,
      totalWithdrawableBalance: Math.max(0, withdrawable.totalAmount - amount),
      withdrawalNumber: equivalentPeriods,
      totalWithdrawals: getContractWithdrawalSlots(contract),
      actualAmountWithdrawn: contractAmount,
      totalWithdrawnSoFar: newTotalWithdrawn,
      remainingBalance,
      status: 'completed',
      paymentMethod: 'K_KASH',
      requestedAt: now,
      processedAt: now,
      processedBy: 'kash_treasury_service',
      transactionProof: transferResult.txHash,
      notes: `K-Kash treasury withdrawal (${contractAmount.toFixed(2)} KOLI from contract ${contractId})`,
    });
  }

  try {
    await batch.commit();
  } catch (error: any) {
    await recordKashTransaction({
      kashAccountId: kashAccount.id,
      txHash: transferResult.txHash,
      reference: withdrawalSessionId,
      direction: 'CREDIT',
      type: 'TREASURY_WITHDRAWAL',
      sourceApp: 'KOLI_COIN',
      amount: rawAmount,
      balanceAfter: updatedRawBalance,
      status: 'RECONCILE_REQUIRED',
      metadata: {
        warning: 'Treasury transfer succeeded but Firestore source updates failed',
        error: error?.message || 'Unknown Firestore update error',
      },
    });
    throw new Error('Treasury transfer succeeded, but source balances need manual reconciliation.');
  }

  await prisma.kashAccount.update({
    where: { id: kashAccount.id },
    data: {
      balanceSnapshot: updatedRawBalance,
      lastLoginAt: new Date(),
    },
  });

  await firebaseAdminDb.collection('kashAccounts').doc(firebaseUid).set(
    {
      balance: updatedBalance,
      walletId: kashAccount.id,
      walletPublicKey: kashAccount.walletPublicKey,
      transactionHash: transferResult.txHash,
      lastTransactionAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await recordKashTransaction({
    kashAccountId: kashAccount.id,
    txHash: transferResult.txHash,
    reference: withdrawalSessionId,
    direction: 'CREDIT',
    type: 'TREASURY_WITHDRAWAL',
    sourceApp: 'KOLI_COIN',
    amount: rawAmount,
    balanceAfter: updatedRawBalance,
    metadata: {
      amountFromMana,
      amountFromContracts,
      contractCount: distribution.length,
    },
  });

  return {
    success: true,
    txHash: transferResult.txHash,
    withdrawalSessionId,
    balance: updatedBalance,
  };
}
