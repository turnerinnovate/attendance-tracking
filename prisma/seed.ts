import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { createOpaqueToken, generateCamperCode, hashToken } from '../lib/codes';
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.outOfAreaEvent.deleteMany(), prisma.attendanceEvent.deleteMany(), prisma.scanToken.deleteMany(), prisma.enrollment.deleteMany(), prisma.week.deleteMany(), prisma.parentCamper.deleteMany(), prisma.camper.deleteMany(), prisma.user.deleteMany(), prisma.organization.deleteMany()
  ]);
  const org = await prisma.organization.create({ data: { name: 'CampTrack Demo Camp', code: 'DEMO' } });
  const admin = await prisma.user.create({ data: { email: 'admin@camptrack.local', name: 'Admin User', passwordHash: await hash('Password123!', 10), role: 'ADMIN', orgId: org.id } });
  const counselor = await prisma.user.create({ data: { email: 'counselor@camptrack.local', name: 'Counselor User', passwordHash: await hash('Password123!', 10), role: 'COUNSELOR', orgId: org.id } });
  const parent = await prisma.user.create({ data: { email: 'parent@camptrack.local', name: 'Parent User', passwordHash: await hash('Password123!', 10), role: 'PARENT', orgId: org.id } });

  for (const name of ['Ava Stone', 'Liam Hart', 'Noah West']) {
    const camper = await prisma.camper.create({ data: { name, orgId: org.id, camperCode: generateCamperCode(org.code), emergencyPhone: '555-0100', pickupPinHash: await hash('1234', 10) } });
    await prisma.parentCamper.create({ data: { parentId: parent.id, camperId: camper.id } });
    const t = createOpaqueToken();
    await prisma.scanToken.create({ data: { camperId: camper.id, tokenHash: hashToken(t), expiresAt: new Date(Date.now() + 365*24*3600*1000) } });
    await prisma.attendanceEvent.create({ data: { orgId: org.id, camperId: camper.id, type: 'CHECK_IN', actorUserId: admin.id } });
  }
  const week = await prisma.week.create({ data: { orgId: org.id, startsOn: new Date(), endsOn: new Date(Date.now()+6*86400000) } });
  const campers = await prisma.camper.findMany();
  await Promise.all(campers.map(c=>prisma.enrollment.create({data:{camperId:c.id,weekId:week.id,daysMask:'1111100'}})));
  const restroomOut = await prisma.outOfAreaEvent.create({ data: { orgId: org.id, camperId: campers[0].id, type: 'RESTROOM_OUT', actorUserId: counselor.id, timestamp: new Date(Date.now()-8*60000) } });
  await prisma.outOfAreaEvent.create({ data: { orgId: org.id, camperId: campers[1].id, type: 'FIELD_TRIP_DEPART', actorUserId: counselor.id } });
  await prisma.outOfAreaEvent.create({ data: { orgId: org.id, camperId: campers[2].id, type: 'RESTROOM_OUT', actorUserId: counselor.id, timestamp: new Date(Date.now()-15*60000), resolvedByEventId: restroomOut.id, durationSeconds: 300 } });
  console.log('Seeded users: admin/counselor/parent with Password123!');
}
main().finally(()=>prisma.$disconnect());
