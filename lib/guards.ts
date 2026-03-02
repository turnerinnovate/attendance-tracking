import { AttendanceType, OutOfAreaType, Role } from '@prisma/client';
import { prisma } from './prisma';

export async function validateAttendance(camperId: string, type: AttendanceType) {
  const latest = await prisma.attendanceEvent.findFirst({ where: { camperId }, orderBy: { timestamp: 'desc' } });
  if (type === 'CHECK_OUT' && (!latest || latest.type === 'CHECK_OUT')) return 'Cannot check out before check in.';
  if (type === 'CHECK_IN' && latest?.type === 'CHECK_IN') return 'Duplicate check-in blocked unless override is provided.';
  return null;
}

export async function validateOutOfArea(camperId: string, type: OutOfAreaType) {
  const restroomOpen = await prisma.outOfAreaEvent.findFirst({ where: { camperId, type: 'RESTROOM_OUT', resolvedByEventId: null }, orderBy: { timestamp: 'desc' } });
  if (type === 'RESTROOM_OUT' && restroomOpen) return 'Camper already marked restroom out.';
  if (type === 'RESTROOM_IN' && !restroomOpen) return 'No matching restroom out event.';
  return null;
}

export function canOverride(role: Role, allowCounselorOverride: boolean) {
  return role === 'ADMIN' || role === 'MANAGER' || (allowCounselorOverride && role === 'COUNSELOR');
}
