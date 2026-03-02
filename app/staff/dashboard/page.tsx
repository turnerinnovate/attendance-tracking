import { prisma } from '@/lib/prisma';

export default async function Dashboard() {
  const campers = await prisma.camper.findMany();
  const restroomOut = await prisma.outOfAreaEvent.findMany({ where: { type: 'RESTROOM_OUT', resolvedByEventId: null }, include: { camper: true } });
  const offsite = await prisma.outOfAreaEvent.findMany({ where: { type: 'FIELD_TRIP_DEPART', resolvedByEventId: null }, include: { camper: true } });
  return <div className="space-y-4">
    <h1 className="text-2xl font-bold">Staff Dashboard</h1>
    <section className="bg-white border p-3 rounded"><h2 className="font-semibold">Not arrived</h2>{campers.map(c=><div key={c.id}>{c.name}</div>)}</section>
    <section className="bg-white border p-3 rounded"><h2 className="font-semibold">Currently out (restroom)</h2>{restroomOut.map(e=><div key={e.id}>{e.camper.name}</div>)}</section>
    <section className="bg-white border p-3 rounded"><h2 className="font-semibold">Offsite (field trip)</h2>{offsite.map(e=><div key={e.id}>{e.camper.name}</div>)}</section>
  </div>;
}
