import React from 'react';
import { Download } from 'lucide-react';

type GuideDownloadButtonProps = {
  href?: string;
};

export default function GuideDownloadButton({
  href = '/user-guide/KMS-Digital-User-Guide.pptx',
}: GuideDownloadButtonProps) {
  return (
    <a
      href={href}
      download="KMS-Digital-User-Guide.pptx"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-[25px] py-[13px] text-body-sm font-semibold text-primary-700 transition-colors duration-150 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <Download size={16} strokeWidth={2} />
      Download PPTX
    </a>
  );
}
