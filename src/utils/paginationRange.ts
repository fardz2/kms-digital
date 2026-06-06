export type PageItem = number | '...';

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function paginationRange(
  current: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] {
  const total = Math.max(totalPages, 1);
  const page = Math.min(Math.max(current, 1), total);

  const totalSlots = siblingCount * 2 + 5;
  if (total <= totalSlots) {
    return range(1, total);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const edgeCount = siblingCount * 2 + 1;

  if (!showLeftDots && showRightDots) {
    return [...range(1, edgeCount), '...', total];
  }

  if (showLeftDots && !showRightDots) {
    return [1, '...', ...range(total - edgeCount + 1, total)];
  }

  return [1, '...', ...range(leftSibling, rightSibling), '...', total];
}
