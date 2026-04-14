interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
