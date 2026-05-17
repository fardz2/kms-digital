import React from 'react';

interface CatatanFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function CatatanField({
  value = '',
  onChange,
  placeholder,
}: CatatanFieldProps) {
  return (
    <div className="py-4">
      <label className="text-overline text-neutral-600 mb-2 block">
        📝 Catatan{' '}
        <span className="font-normal text-neutral-500 normal-case tracking-normal">
          (opsional)
        </span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? 'Contoh: anak sedang sakit, baru sembuh demam...'}
        rows={3}
        maxLength={500}
        className="w-full px-4 py-3 text-base rounded-button border border-neutral-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-y font-sans"
      />
      <div className="text-caption text-neutral-400 text-right mt-1 tabular-nums">
        {value.length}/500
      </div>
    </div>
  );
}
