import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/codes';
import { validateAttendance, validateOutOfArea } from '@/lib/guards';

const bodySchema = z.object({ code: z.string().min(3), action: z.string(), stationName: z.string().default('Unknown') , overrideReason: z.string().optional() });

export async function POST(req: Request) {
  const body = bodySchema.parse(await req.json());
  const tokenHash = hashToken(body.code);
  const token = await prisma.scanToken.findFirst({ where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } }, include: { camper: true } });
  const camper = token?.camper ?? await prisma.camper.findFirst({ where: { camperCode: body.code } });
  if (!camper) return NextResponse.json({ error: 'Code not recognized' }, { status: 404 });
  const actor = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });

  if (body.action === 'CHECK_IN' || body.action === 'CHECK_OUT') {
    const guard = await validateAttendance(camper.id, body.action);
    if (guard && !body.overrideReason) return NextResponse.json({ error: guard }, { status: 400 });
    const event = await prisma.attendanceEvent.create({ data: { orgId: camper.orgId, camperId: camper.id, type: body.action, actorUserId: actor.id, deviceLabel: body.stationName, overrideReason: body.overrideReason } });
    return NextResponse.json({ ok: true, camper: camper.name, event });
  }

  const guard = await validateOutOfArea(camper.id, body.action as any);
  if (guard && !body.overrideReason) return NextResponse.json({ error: guard }, { status: 400 });
  const event = await prisma.outOfAreaEvent.create({ data: { orgId: camper.orgId, camperId: camper.id, type: body.action as any, actorUserId: actor.id, deviceLabel: body.stationName } });
  if (body.action === 'RESTROOM_IN') {
    const out = await prisma.outOfAreaEvent.findFirst({ where: { camperId: camper.id, type: 'RESTROOM_OUT', resolvedByEventId: null }, orderBy: { timestamp: 'desc' } });
    if (out) {
      await prisma.outOfAreaEvent.update({ where: { id: out.id }, data: { resolvedByEventId: event.id, durationSeconds: Math.floor((event.timestamp.getTime()-out.timestamp.getTime())/1000) } });
    }
  }
  return NextResponse.json({ ok: true, camper: camper.name, event });
}
