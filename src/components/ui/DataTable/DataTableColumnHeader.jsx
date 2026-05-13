import { flexRender } from '@tanstack/react-table';
import { SortIcon, SortUpIcon, SortDownIcon } from './icons';

export default function DataTableColumnHeader({ header }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();

  if (header.isPlaceholder) {
    return <th className="px-4 py-3" />;
  }

  const content = flexRender(header.column.columnDef.header, header.getContext());

  if (!canSort) {
    return (
      <th
        scope="col"
        className="px-4 py-3 text-left text-overline text-white"
      >
        {content}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className="group px-4 py-3 text-left text-overline text-white cursor-pointer select-none"
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="flex items-center justify-between gap-2">
        {content}
        <span>
          {sorted === 'desc' ? (
            <SortDownIcon className="w-4 h-4 text-white/80" />
          ) : sorted === 'asc' ? (
            <SortUpIcon className="w-4 h-4 text-white/80" />
          ) : (
            <SortIcon className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
}
