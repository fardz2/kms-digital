import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

export default function MonthPicker({ value, onChange }) {
  const current = value ? moment(value, 'YYYY-MM') : moment();
  return (
    <DatePicker
      picker="month"
      value={current}
      onChange={(v) => v && onChange?.(v.format('YYYY-MM'))}
      allowClear={false}
      format="MMMM YYYY"
      style={{ height: 40, fontSize: 'var(--text-base)' }}
    />
  );
}
