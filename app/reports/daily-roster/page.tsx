import { prisma } from '@/lib/prisma';
export default async function DailyRoster(){ const campers = await prisma.camper.findMany(); return <div className='print:p-0'><h1 className='text-2xl font-bold'>Daily Roster</h1><table className='w-full bg-white'><tbody>{campers.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.camperCode}</td></tr>)}</tbody></table></div>; }
