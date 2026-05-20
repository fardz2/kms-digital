import React from 'react';
import { guideContent } from '../data/guideContent';
import type { GuideRole } from '../types';

type GuideSidebarProps = {
  roles?: GuideRole[];
};

function getRoleAnchor(roleId: string) {
  return `#role-${roleId.toLowerCase()}`;
}

export default function GuideSidebar({ roles = guideContent }: GuideSidebarProps) {
  return (
    <nav
      aria-label="Navigasi role panduan"
      className="rounded-default border border-light-ash bg-white p-[21px] shadow-card lg:sticky lg:top-[25px]"
    >
      <div className="border-b border-light-ash pb-[17px]">
        <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[6px]">
          Navigasi Role
        </p>
        <h2 className="text-heading font-bold text-deep-slate leading-[1.1] tracking-tight">
          Lompat ke bagian yang Anda butuhkan
        </h2>
        <p className="mt-[8px] text-body-sm text-graphite">
          Setiap role diambil dari sumber data yang sama dengan file PPTX.
        </p>
      </div>

      <ul className="mt-[17px] space-y-[10px]">
        {roles.map((role) => (
          <li key={role.id}>
            <a
              aria-label={role.title}
              aria-describedby={`role-nav-${role.id.toLowerCase()}-meta`}
              href={getRoleAnchor(role.id)}
              className="group flex items-start gap-[13px] rounded-default border border-light-ash px-[13px] py-[13px] transition-colors duration-150 hover:border-primary-300 hover:bg-primary-50/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span
                aria-hidden="true"
                className="mt-[4px] h-[10px] w-[10px] shrink-0 rounded-full"
                style={{ backgroundColor: role.accentColor ?? '#1D4ED8' }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-body-sm font-semibold text-deep-slate">
                  {role.title}
                </span>
                <span
                  className="mt-1 block text-caption text-graphite leading-relaxed"
                  id={`role-nav-${role.id.toLowerCase()}-meta`}
                >
                  {role.sections.length} bagian · {role.summary}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
