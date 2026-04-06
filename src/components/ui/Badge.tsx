import type { ProcessStatus, ProcessType, ProcessPriority } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

const statusColors: Record<ProcessStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  deprecated: 'bg-red-100 text-red-800',
};

const typeColors: Record<ProcessType, string> = {
  manual: 'bg-orange-100 text-orange-800',
  systemic: 'bg-blue-100 text-blue-800',
  hybrid: 'bg-purple-100 text-purple-800',
};

const priorityColors: Record<ProcessPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${color || 'bg-gray-100 text-gray-800'} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProcessStatus }) {
  const labels: Record<ProcessStatus, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    draft: 'Rascunho',
    deprecated: 'Descontinuado',
  };
  return <Badge color={statusColors[status]}>{labels[status]}</Badge>;
}

export function TypeBadge({ type }: { type: ProcessType }) {
  const labels: Record<ProcessType, string> = {
    manual: 'Manual',
    systemic: 'Sistêmico',
    hybrid: 'Híbrido',
  };
  return <Badge color={typeColors[type]}>{labels[type]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: ProcessPriority }) {
  const labels: Record<ProcessPriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  };
  return <Badge color={priorityColors[priority]}>{labels[priority]}</Badge>;
}
