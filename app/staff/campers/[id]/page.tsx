import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CamperPage({ params }: { params: { id: string } }) {
  const camper = await prisma.camper.findUniqueOrThrow({ where: { id: params.id }, include: { org: true } });
  return <div className="space-y-2"><h1 className="text-2xl font-bold">{camper.name}</h1><p>Camper ID: {camper.camperCode}</p>
  <Link className="text-blue-600 underline" href={`/staff/campers/${camper.id}/card`}>Print Camper Card</Link></div>;
}
