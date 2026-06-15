import React from 'react';
import {
  STATUS_LABEL,
  INDICATOR_LABEL,
  INDICATOR_TONE,
} from '../../features/pengukuran/statusGizi';

const TONE_STYLES = {
  normal:  'bg-success-bg text-success',
  warning: 'bg-warning-bg text-amber-800',
  danger:  'bg-danger-bg text-danger',
  unknown: 'bg-neutral-100 text-neutral-500',
};

// Tone untuk ringkasan status (4 kategori).
const SUMMARY_TONE = {
  normal: 'normal',
  kurang: 'warning',
  stunting: 'danger',
  obesitas: 'danger',
  unknown: 'unknown',
};

export default function StatusBadge({
  status,
  label,
}: {
  status?: string;
  label?: string;
}) {
  const key = String(status || 'unknown').toLowerCase();
  const tone =
    INDICATOR_TONE[key] || SUMMARY_TONE[key] || 'unknown';
  const style = TONE_STYLES[tone] || TONE_STYLES.unknown;
  const text =
    label ?? INDICATOR_LABEL[key] ?? STATUS_LABEL[key] ?? '-';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      {text}
    </span>
  );
}
