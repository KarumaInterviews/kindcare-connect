import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-success/15 text-success border-success/20',
  pending: 'bg-warning/15 text-warning border-warning/20',
  completed: 'bg-info/15 text-info border-info/20',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/20',
  physical: 'bg-primary/15 text-primary border-primary/20',
  virtual: 'bg-info/15 text-info border-info/20',
};

const StatusBadge = ({ status, className }: { status: string; className?: string }) => (
  <Badge variant="outline" className={cn('capitalize font-medium text-xs', statusStyles[status] || '', className)}>
    {status}
  </Badge>
);

export default StatusBadge;
