import React from 'react';
import bgDashboard from '../../assets/img/bg-dashboard.svg';

export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 200,
        padding: 'var(--space-xl) var(--space-lg)',
        borderBottomLeftRadius: 'var(--radius-hero)',
        borderBottomRightRadius: 'var(--radius-hero)',
        boxShadow: 'var(--shadow-hero)',
        backgroundImage: `url(${bgDashboard})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {title && <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-sm) 0 0' }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 'var(--space-lg)' }}>{action}</div>}
      {children}
    </div>
  );
}
