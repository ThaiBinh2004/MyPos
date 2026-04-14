import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: TableProps) {
  return (
    <thead className="border-b border-gray-100 bg-gray-50/70">
      {children}
    </thead>
  );
}

export function TableBody({ children }: TableProps) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('transition-colors hover:bg-indigo-50/30', className)}>
      {children}
    </tr>
  );
}

export function TableTh({ children, className }: TableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400', className)}>
      {children}
    </th>
  );
}

export function TableTd({ children, className, colSpan }: TableProps) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3.5 text-gray-700', className)}>
      {children}
    </td>
  );
}
