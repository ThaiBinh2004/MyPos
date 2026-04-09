import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: TableProps) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TableBody({ children }: TableProps) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  );
}

export function TableTh({ children, className }: TableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide', className)}>
      {children}
    </th>
  );
}

export function TableTd({ children, className }: TableProps) {
  return (
    <td className={cn('px-4 py-3 text-gray-700', className)}>
      {children}
    </td>
  );
}
