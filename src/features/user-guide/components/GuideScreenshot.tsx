import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

type GuideScreenshotProps = {
  src: string;
  alt: string;
  hint?: string;
  targetSelector?: string;
  accentColor?: string;
};

export default function GuideScreenshot({
  src,
  alt,
  hint,
  targetSelector,
  accentColor,
}: GuideScreenshotProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <figure
      className="overflow-hidden rounded-default border border-light-ash bg-faint-fog"
      style={accentColor ? { boxShadow: `inset 0 0 0 1px ${accentColor}22` } : undefined}
    >
      <div className="relative aspect-[16/10]">
        {!imageFailed ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[13px] px-[25px] text-center">
            <span
              aria-hidden="true"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-graphite shadow-sm"
            >
              <ImageOff size={22} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-body-sm font-semibold text-deep-slate">
                Screenshot belum tersedia
              </p>
              <p className="mt-1 text-caption text-graphite leading-relaxed">
                {hint ?? 'Gunakan panduan langkah di samping sampai aset PNG digenerate.'}
              </p>
              {targetSelector && (
                <p className="mt-2 text-caption text-graphite">
                  Target selector: <code className="font-mono">{targetSelector}</code>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {(hint || targetSelector) && !imageFailed && (
        <figcaption className="border-t border-light-ash bg-white px-[17px] py-[13px] text-caption text-graphite">
          {hint && <span>{hint}</span>}
          {hint && targetSelector && <span className="mx-2">·</span>}
          {targetSelector && (
            <span>
              Target selector: <code className="font-mono">{targetSelector}</code>
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
