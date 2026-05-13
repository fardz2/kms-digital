import React from 'react';
import bgDashboard from '../../assets/img/bg-dashboard.svg';

export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <header
      className="relative overflow-hidden text-white rounded-b-hero shadow-hero px-6 py-10 md:py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgDashboard})` }}
    >
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-300 opacity-40 blur-3xl pointer-events-none"
      />
      <div className="relative max-w-4xl mx-auto">
        {subtitle && (
          <p className="text-overline text-primary-100 mb-1">{subtitle}</p>
        )}
        {title && (
          <h1 className="text-h1 font-display text-white leading-tight">{title}</h1>
        )}
        {action && <div className="mt-6">{action}</div>}
        {children}
      </div>
    </header>
  );
}
