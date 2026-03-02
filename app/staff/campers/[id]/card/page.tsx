import { prisma } from '@/lib/prisma';
import { CamperCard } from '@/components/CamperCard';
import { createOpaqueToken, hashToken } from '@/lib/codes';

export default async function CamperCardPage({ params }: { params: { id: string } }) {
  const camper = await prisma.camper.findUniqueOrThrow({ where: { id: params.id }, include: { org: true, scanTokens: { where: { revokedAt: null }, take: 1, orderBy: { createdAt: 'desc' } } } });
  let token = camper.scanTokens[0];
  let raw = '';
  if (!token) {
    raw = createOpaqueToken();
    token = await prisma.scanToken.create({ data: { camperId: camper.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 365*24*3600*1000) } });
  }
  return <CamperCard camper={camper} orgName={camper.org.name} token={raw || camper.camperCode} />;
}
