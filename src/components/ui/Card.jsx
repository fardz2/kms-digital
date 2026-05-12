import React from 'react';

export default function Card({ title, footer, onClick, style: styleProp, children }) {
  const style = {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: 'var(--space-lg)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.15s',
    ...styleProp,
  };

  return (
    <div
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {title && (
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-md)' }}>
          {title}
        </div>
      )}
      <div>{children}</div>
      {footer && <div style={{ marginTop: 'var(--space-md)' }}>{footer}</div>}
    </div>
  );
}
