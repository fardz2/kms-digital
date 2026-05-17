import moment from 'moment';

export function monthDiff(start, end) {
  return Math.abs(moment(end).diff(moment(start), 'month'));
}
