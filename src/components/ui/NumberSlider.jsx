import React from 'react';

export default function NumberSlider({
  label,
  min = 0,
  max = 100,
  step = 0.1,
  value = 0,
  onChange,
  unit = '',
}) {
  const handleRange = (e) => {
    const next = parseFloat(e.target.value);
    if (!Number.isNaN(next)) onChange?.(Number(next.toFixed(1)));
  };
  const dec = () => onChange?.(Number(Math.max(min, value - step).toFixed(1)));
  const inc = () => onChange?.(Number(Math.min(max, value + step).toFixed(1)));

  return (
    <div className="rounded-card border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between mb-4 gap-4">
        {label && <span className="text-overline text-neutral-600">{label}</span>}
        <div className="text-h3 font-display text-neutral-900 tabular-nums">
          {value.toFixed(1)}
          {unit && <span className="text-base text-neutral-500 ml-1">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleRange}
        className="w-full h-2 appearance-none bg-gradient-to-r from-primary-100 to-primary-300 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-raised [&::-webkit-slider-thumb]:cursor-grab
          active:[&::-webkit-slider-thumb]:scale-110
          [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
          [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white"
      />

      <div className="flex justify-between text-xs text-neutral-400 mt-1 tabular-nums">
        <span>{min}</span>
        <span>{max} {unit}</span>
      </div>

      <div className="flex justify-between items-center gap-3 mt-4">
        <button
          type="button"
          onClick={dec}
          aria-label={`Kurangi ${step}${unit ? ' ' + unit : ''}`}
          className="w-14 h-14 rounded-full bg-neutral-100 hover:bg-primary-50 hover:text-primary border-2 border-transparent hover:border-primary-200 text-2xl font-display font-bold transition-all duration-150 ease-out-quart active:scale-95"
        >
          −
        </button>
        <span className="text-caption text-neutral-500">Geser atau tap</span>
        <button
          type="button"
          onClick={inc}
          aria-label={`Tambah ${step}${unit ? ' ' + unit : ''}`}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-600 text-white text-2xl font-display font-bold shadow-raised transition-all duration-150 ease-out-quart active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
