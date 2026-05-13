import { flexRender } from '@tanstack/react-table';
import { SortIcon, SortUpIcon, SortDownIcon } from './icons';

export default function DataTableColumnHeader({ header }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();

  if (header.isPlaceholder) {
    return <th className="px-[17px] py-[13px]" />;
  }

  const content = flexRender(header.column.columnDef.header, header.getContext());

  if (!canSort) {
    return (
      <th
        scope="col"
        className="px-[17px] py-[13px] text-left text-caption font-semibold uppercase tracking-wider text-deep-slate"
      >
        {content}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className="group px-[17px] py-[13px] text-left text-caption font-semibold uppercase tracking-wider text-deep-slate cursor-pointer select-none hover:bg-light-ash/60 transition-colors"
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="flex items-center justify-between gap-2">
        {content}
        <span>
          {sorted === 'desc' ? (
            <SortDownIcon className="w-4 h-4 text-primary-600" strokeWidth={2} />
          ) : sorted === 'asc' ? (
            <SortUpIcon className="w-4 h-4 text-primary-600" strokeWidth={2} />
          ) : (
            <SortIcon
              className="w-4 h-4 text-graphite opacity-0 group-hover:opacity-100 transition-opacity"
              strokeWidth={1.75}
            />
          )}
        </span>
      </div>
    </th>
  );
}
