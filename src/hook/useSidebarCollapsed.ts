import { useState, useEffect } from 'react';

const KEY = 'admin-sidebar-collapsed';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(KEY) === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const toggle = () => setCollapsed((v) => !v);

  return { collapsed, toggle, setCollapsed };
}
