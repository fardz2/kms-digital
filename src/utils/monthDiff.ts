import dayjs from 'dayjs';

export function monthDiff(
  start: dayjs.ConfigType,
  end: dayjs.ConfigType,
): number {
  return dayjs(end).diff(dayjs(start), 'month');
}
