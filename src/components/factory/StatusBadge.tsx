interface StatusBadgeProps {
  status: 'theoretical' | 'partial' | 'validated' | 'stale';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    theoretical: { icon: '⚪', label: 'Teórico', color: 'bg-secondary/50 text-muted-foreground border-border' },
    partial: { icon: '🟡', label: 'Parcial', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300' },
    validated: { icon: '🟢', label: 'Validado', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300' },
    stale: { icon: '🔴', label: 'Obsoleto', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300' }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
      <span>{config.icon}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
};
