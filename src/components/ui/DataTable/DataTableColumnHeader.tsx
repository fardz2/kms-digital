import { flexRender } from '@tanstack/react-table';
import { SortIcon, SortUpIcon, SortDownIcon } from './icons';

export default function DataTableColumnHeader({ header }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();

  if (header.isPlaceholder) {
    return <th className="px-[17px] py-[17px]" />;
  }

  const content = flexRender(header.column.columnDef.header, header.getContext());

  if (!canSort) {
    return (
      <th
        scope="col"
        className="px-[17px] py-[17px] text-left text-caption font-bold uppercase tracking-[0.08em] text-deep-slate"
      >
        {content}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className={`group px-[17px] py-[17px] text-left text-caption font-bold uppercase tracking-[0.08em] cursor-pointer select-none transition-colors ${
        sorted ? 'text-primary-700 bg-primary-50/60' : 'text-deep-slate hover:bg-white'
      }`}
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="flex items-center justify-between gap-2">
        {content}
        <span>
          {sorted === 'desc' ? (
            <SortDownIcon className="w-4 h-4 text-primary-600" strokeWidth={2.25} />
          ) : sorted === 'asc' ? (
            <SortUpIcon className="w-4 h-4 text-primary-600" strokeWidth={2.25} />
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
