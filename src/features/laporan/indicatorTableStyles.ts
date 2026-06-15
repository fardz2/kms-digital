export function indicatorHeaderToneClass(tone: string): string {
  if (tone === 'danger') return 'bg-danger';
  if (tone === 'warning') return 'bg-warning';
  if (tone === 'normal') return 'bg-primary-600';
  return 'bg-neutral-500';
}

export function indicatorCellToneClass(tone: string): string {
  if (tone === 'danger') return 'text-danger font-bold';
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
