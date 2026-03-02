import { prisma } from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  const campers = await prisma.camper.findMany({ include: { attendance: true, outOfAreaEvents: true } });
  const rows = campers.map((c) => {
    const inEvt = c.attendance.find((e) => e.type === 'CHECK_IN');
    const outEvt = c.attendance.find((e) => e.type === 'CHECK_OUT');
    const depart = c.outOfAreaEvents.find((e)=>e.type==='FIELD_TRIP_DEPART');
    const ret = c.outOfAreaEvents.find((e)=>e.type==='FIELD_TRIP_RETURN');
    const trips = c.outOfAreaEvents.filter((e) => e.type === 'RESTROOM_OUT').length;
    const mins = Math.round(c.outOfAreaEvents.filter((e) => e.durationSeconds).reduce((a, e) => a + (e.durationSeconds || 0), 0) / 60);
    return [c.name, c.camperCode, inEvt?.timestamp.toISOString() || '', outEvt?.timestamp.toISOString() || '', trips, mins, depart?.timestamp.toISOString()||'', ret?.timestamp.toISOString()||'', 'N'];
  });
  const csv = stringify([['camper', 'camperCode', 'checkIn', 'checkOut', 'restroomTrips', 'restroomMinutes','fieldTripDepart','fieldTripReturn','incidentNote'], ...rows]);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}
