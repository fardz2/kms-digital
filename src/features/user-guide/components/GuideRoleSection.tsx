import React from 'react';
import type { GuideRole } from '../types';
import GuideSectionCard from './GuideSectionCard';

type GuideRoleSectionProps = {
  role: GuideRole;
  position: number;
  totalRoles: number;
};

function getRoleAnchor(roleId: string) {
  return `role-${roleId.toLowerCase()}`;
}

export default function GuideRoleSection({ role, position, totalRoles }: GuideRoleSectionProps) {
  const anchorId = getRoleAnchor(role.id);
  const accent = role.accentColor ?? '#1D4ED8';

  return (
    <section id={anchorId} className="scroll-mt-[96px] space-y-[17px]">
      <header className="overflow-hidden rounded-default border border-light-ash bg-white shadow-card">
        <div className="border-t-[4px] px-[21px] py-[21px] md:px-[25px]" style={{ borderTopColor: accent }}>
          <div className="flex flex-col gap-[13px] md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[6px]">
                {role.id.replace('_', ' ')}
              </p>
              <h2 className="text-heading-lg font-bold text-deep-slate leading-[1.1] tracking-tight">
                {role.title}
              </h2>
              <p className="mt-[10px] max-w-[72ch] text-body-lg text-graphite leading-relaxed">
                {role.summary}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-[8px]">
              <span
                className="inline-flex items-center rounded-full px-[13px] py-[8px] text-caption font-semibold"
                style={{ backgroundColor: `${accent}14`, color: accent }}
              >
                {role.sections.length} bagian
              </span>
              <span className="inline-flex items-center rounded-full bg-faint-fog px-[13px] py-[8px] text-caption font-semibold text-deep-slate">
                {position}/{totalRoles} urutan
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-[17px]">
        {role.sections.map((section, index) => (
          <GuideSectionCard
            key={section.id}
            section={section}
            roleTitle={role.title}
            accentColor={accent}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
