import { prisma } from '@/lib/prisma';
export default async function Users(){ const users = await prisma.user.findMany(); return <div><h1 className='text-2xl font-bold'>Users</h1>{users.map(u=><div key={u.id}>{u.email} ({u.role})</div>)}</div>; }
