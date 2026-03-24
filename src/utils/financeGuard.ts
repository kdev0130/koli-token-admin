import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db';

export async function requireFinanceUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'FINANCE') {
    throw new Error('FORBIDDEN');
  }

  return user;
}
