import dayjs from 'dayjs';

export function monthDiff(start: any, end: any): number {
  return Math.abs(dayjs(end).diff(dayjs(start), 'month'));
}
