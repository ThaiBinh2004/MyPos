import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  default:  'bg-gray-100 text-gray-600 ring-gray-200/60',
  success:  'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning:  'bg-amber-50 text-amber-700 ring-amber-200/60',
  danger:   'bg-red-50 text-red-600 ring-red-200/60',
  error:    'bg-red-50 text-red-600 ring-red-200/60',
  info:     'bg-blue-50 text-blue-700 ring-blue-200/60',
};

const dots: Record<Variant, string> = {
  default:  'bg-gray-400',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  error:    'bg-red-500',
  info:     'bg-blue-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        variants[variant],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[variant])} />
      {children}
    </span>
  );
}
