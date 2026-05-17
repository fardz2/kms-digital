import React from 'react';

const OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum diukur' },
  { key: 'perhatian', label: '\u26A0 Perhatian' },
];

export default function FilterChip({ value = 'semua', onChange, counts = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => {
        const count = counts[opt.key];
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange?.(opt.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 ${
              active
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-deep-slate border border-light-ash hover:border-graphite/30 hover:bg-faint-fog'
            }`}
          >
            {opt.label}
            {count != null && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                  active ? 'bg-white/25' : 'bg-neutral-100'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
