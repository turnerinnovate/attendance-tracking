import { prisma } from '@/lib/prisma';
export default async function WeeksPage(){ const weeks = await prisma.week.findMany(); return <div><h1 className='text-2xl font-bold'>Weeks</h1>{weeks.map(w=><div key={w.id}>{w.startsOn.toDateString()} - {w.endsOn.toDateString()}</div>)}</div>; }
