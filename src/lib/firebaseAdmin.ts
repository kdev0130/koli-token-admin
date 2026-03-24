import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function initializeFirebaseAdmin() {
  if (getApps().length) {
    return getApps()[0];
  }

  const { projectId, clientEmail, privateKey } = getFirebaseConfig();

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

const firebaseAdminApp = initializeFirebaseAdmin();

export const firebaseAdminAuth = getAuth(firebaseAdminApp);
export const firebaseAdminDb = getFirestore(firebaseAdminApp);

export function getFirebaseAdminProjectId() {
  return getFirebaseConfig().projectId;
}
