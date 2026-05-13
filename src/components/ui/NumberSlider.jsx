import React from 'react';
import { Minus, Plus } from 'lucide-react';

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
    <div className="rounded-default border border-light-ash bg-white p-[21px]">
      <div className="flex items-baseline justify-between mb-[17px] gap-[17px]">
        {label && (
          <span className="text-overline text-graphite uppercase">{label}</span>
        )}
        <div className="text-heading font-semibold text-deep-slate tabular-nums">
          {value.toFixed(1)}
          {unit && <span className="text-body-sm text-graphite ml-1">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleRange}
        className="w-full h-[6px] appearance-none bg-polar-mist rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500
          [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:cursor-grab
          active:[&::-webkit-slider-thumb]:scale-110
          [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500
          [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white"
      />

      <div className="flex justify-between text-caption text-graphite mt-1 tabular-nums">
        <span>{min}</span>
        <span>
          {max} {unit}
        </span>
      </div>

      <div className="flex justify-between items-center gap-[13px] mt-[17px]">
        <button
          type="button"
          onClick={dec}
          aria-label={`Kurangi ${step}${unit ? ' ' + unit : ''}`}
          className="w-[56px] h-[56px] rounded-full bg-white border border-light-ash hover:bg-faint-fog text-deep-slate transition-colors duration-150 ease-out-quart flex items-center justify-center active:scale-95"
        >
          <Minus size={24} strokeWidth={2} />
        </button>
        <span className="text-caption text-graphite">Geser atau tap</span>
        <button
          type="button"
          onClick={inc}
          aria-label={`Tambah ${step}${unit ? ' ' + unit : ''}`}
          className="w-[56px] h-[56px] rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors duration-150 ease-out-quart flex items-center justify-center active:scale-95"
        >
          <Plus size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
