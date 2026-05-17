import React from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface MonthPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const current = value ? dayjs(value, 'YYYY-MM') : dayjs();
  return (
    <DatePicker
      picker="month"
      value={current}
      onChange={(v) => v && onChange?.(v.format('YYYY-MM'))}
      allowClear={false}
      format="MMMM YYYY"
      className="w-full h-11 text-base"
    />
  );
}
