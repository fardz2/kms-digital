import dayjs from 'dayjs';

export function isThisMonth(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  if (!d.isValid()) return false;
  const now = dayjs();
  return d.month() === now.month() && d.year() === now.year();
}

export function isWithinDays(dateStr?: string | null, days = 7): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  if (!d.isValid()) return false;
  return dayjs().diff(d, 'days') <= days;
}
