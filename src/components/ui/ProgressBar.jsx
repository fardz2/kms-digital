import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, color = 'bg-primary' }) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-caption text-neutral-700 mb-2">
          <span>{label}</span>
          <span className="tabular-nums">
            {value}/{max} ({pct.toFixed(0)}%)
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-[width] duration-400 ease-out-quart`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
