import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Route } from 'lucide-react';
import type { GuideSection } from '../types';
import GuideScreenshot from './GuideScreenshot';

type GuideSectionCardProps = {
  section: GuideSection;
  roleTitle: string;
  accentColor?: string;
  index?: number;
};

export default function GuideSectionCard({
  section,
  roleTitle,
  accentColor,
  index,
}: GuideSectionCardProps) {
  const detailText = section.purpose ?? section.screenshotHint ?? '';
  const targetSelector = section.steps.find((step) => step.targetSelector)?.targetSelector;

  return (
    <article
      id={section.id}
      className="overflow-hidden rounded-default border border-light-ash bg-white shadow-card"
      style={accentColor ? { borderTopWidth: '4px', borderTopColor: accentColor } : undefined}
    >
      <header className="border-b border-light-ash bg-white px-[21px] py-[21px] md:px-[25px]">
        <div className="flex flex-col gap-[17px] md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-caption font-bold uppercase tracking-[0.14em] text-graphite mb-[6px]">
              {roleTitle}
              {index != null ? ` · Langkah ${index + 1}` : ''}
            </p>
            <h3 className="text-heading font-bold text-deep-slate leading-[1.15] tracking-tight">
              {section.title}
            </h3>
            {detailText && (
              <p className="mt-[8px] max-w-[68ch] text-body-sm text-graphite leading-relaxed">
                {detailText}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-start gap-[8px] md:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-faint-fog px-[13px] py-[8px] text-caption font-semibold text-deep-slate">
              <Route size={14} strokeWidth={2} className="text-primary-600" />
              {section.route}
            </span>
            <Link
              to={section.route}
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Buka halaman
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-light-ash p-[21px] md:p-[25px] lg:border-b-0 lg:border-r">
          <GuideScreenshot
            src={`/user-guide/assets/${section.screenshotFile}`}
            alt={`${roleTitle} - ${section.title}`}
            hint={section.screenshotHint ?? section.purpose}
            targetSelector={targetSelector}
            accentColor={accentColor}
          />
        </div>

        <div className="bg-white p-[21px] md:p-[25px]">
          <div className="space-y-[17px]">
            <section aria-labelledby={`${section.id}-steps`}>
              <div className="flex items-center justify-between gap-[13px]">
                <h4
                  id={`${section.id}-steps`}
                  className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600"
                >
                  Langkah
                </h4>
                <span className="text-caption text-graphite">
                  {section.steps.length} langkah
                </span>
              </div>

              <ol className="mt-[13px] space-y-[13px]">
                {section.steps.map((step, stepIndex) => (
                  <li
                    key={step.id}
                    className="flex gap-[13px] rounded-default border border-light-ash bg-faint-fog/70 px-[13px] py-[13px]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[2px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-white text-caption font-bold text-primary-700 shadow-sm"
                    >
                      {stepIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-deep-slate">{step.label}</p>
                      <p className="mt-1 text-body-sm text-graphite leading-relaxed">
                        {step.action}
                      </p>
                      <p className="mt-1 text-caption text-graphite">
                        Hasil: {step.result}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby={`${section.id}-result`}>
              <h4
                id={`${section.id}-result`}
                className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600"
              >
                Hasil yang diharapkan
              </h4>
              <p className="mt-[10px] rounded-default border border-primary-100 bg-primary-50/50 px-[13px] py-[13px] text-body-sm text-deep-slate leading-relaxed">
                {section.expectedResult}
              </p>
            </section>

            <section aria-labelledby={`${section.id}-tips`}>
              <h4
                id={`${section.id}-tips`}
                className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600"
              >
                Tips
              </h4>
              <ul className="mt-[10px] space-y-[10px]">
                {section.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-[10px] rounded-default border border-light-ash px-[13px] py-[10px]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[4px] h-[8px] w-[8px] shrink-0 rounded-full bg-primary-500"
                    />
                    <span className="text-caption text-graphite leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-[17px] flex flex-wrap items-center gap-[13px] border-t border-light-ash pt-[17px]">
            <Link
              to={section.route}
              className="inline-flex items-center gap-2 rounded-full bg-deep-slate px-[20px] py-[11px] text-body-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Buka route
              <ExternalLink size={16} strokeWidth={2} />
            </Link>
            <span className="text-caption text-graphite">
              Route ini dipakai di aplikasi, jadi alurnya sama dengan PPTX.
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
