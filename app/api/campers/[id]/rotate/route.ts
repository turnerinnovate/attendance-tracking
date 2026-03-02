import { createOpaqueToken, hashToken } from '@/lib/codes';
import { prisma } from '@/lib/prisma';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await prisma.scanToken.updateMany({ where: { camperId: params.id, revokedAt: null }, data: { revokedAt: new Date() } });
  const raw = createOpaqueToken();
  await prisma.scanToken.create({ data: { camperId: params.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 365*24*3600*1000) } });
  return Response.json({ ok: true, token: raw });
}
