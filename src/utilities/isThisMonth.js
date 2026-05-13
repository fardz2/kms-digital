import moment from 'moment';

export function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = moment(dateStr);
  if (!d.isValid()) return false;
  const now = moment();
  return d.year() === now.year() && d.month() === now.month();
}

export function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  const d = moment(dateStr);
  if (!d.isValid()) return false;
  return moment().diff(d, 'days') <= days;
}
