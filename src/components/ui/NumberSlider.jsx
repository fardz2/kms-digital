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
  const handleChange = (e) => {
    const next = parseFloat(e.target.value);
    if (!Number.isNaN(next)) onChange?.(Number(next.toFixed(1)));
  };

  const decrement = () => {
    const next = Math.max(min, value - step);
    onChange?.(Number(next.toFixed(1)));
  };

  const increment = () => {
    const next = Math.min(max, value + step);
    onChange?.(Number(next.toFixed(1)));
  };

  return (
    <div style={{ padding: 'var(--space-md) 0' }}>
      {label && (
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-sm)' }}>
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 'var(--text-display)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center',
          marginBottom: 'var(--space-md)',
        }}
      >
        {value.toFixed(1)} {unit}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={{ width: '100%', height: 12 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted)',
          marginTop: 'var(--space-xs)',
        }}
      >
        <span>{min}</span>
        <span>
          {max} {unit}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={decrement}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            background: 'var(--color-bg)',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={increment}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
