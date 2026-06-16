export function indicatorHeaderToneClass(tone: string): string {
  return 'bg-primary-600';
}

export function indicatorWarningBgClass(): string {
  return 'bg-warning-bg text-deep-slate';
}

export function indicatorCellToneClass(tone: string): string {
  if (tone === 'danger') return 'text-warning font-bold';
  if (tone === 'warning') return 'text-amber-700 font-bold';
  return 'text-charcoal';
}

export function indicatorGroupBorderClass(
  variant: 'header' | 'cell',
  isGroupStart: boolean
): string {
  if (isGroupStart) {
    return variant === 'cell'
      ? 'border-l-4 border-primary-200'
      : 'border-l-4 border-white/60';
  }

  return variant === 'cell'
    ? 'border-l-2 border-light-ash'
    : 'border-l-2 border-white/40';
}
