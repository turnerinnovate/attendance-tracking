import { prisma } from '@/lib/prisma';
export default async function Settings(){ const org = await prisma.organization.findFirstOrThrow(); return <div><h1 className='text-2xl font-bold'>Settings</h1><p>restroomMaxMinutes: {org.restroomMaxMinutes}</p><p>allowCounselorOverride: {String(org.allowCounselorOverride)}</p><p>kioskAutoToggle: {String(org.kioskAutoToggle)}</p></div>; }
