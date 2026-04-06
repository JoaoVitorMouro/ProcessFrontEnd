import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  GitBranchPlus,
  Wrench,
  Users,
  FileText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { dashboardService } from '@/services';
import type { DashboardStats, DashboardOverviewArea } from '@/types';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/layout/PageHeader';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overview, setOverview] = useState<DashboardOverviewArea[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.stats(), dashboardService.overview()])
      .then(([statsRes, overviewRes]) => {
        setStats(statsRes.data.data);
        setOverview(overviewRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statCards = stats
    ? [
        { label: 'Áreas', value: stats.totals.areas, icon: FolderKanban, color: 'bg-blue-500', link: '/areas' },
        { label: 'Processos', value: stats.totals.processes, icon: GitBranchPlus, color: 'bg-purple-500', link: '/processes' },
        { label: 'Ferramentas', value: stats.totals.tools, icon: Wrench, color: 'bg-amber-500', link: '/tools' },
        { label: 'Responsáveis', value: stats.totals.responsibles, icon: Users, color: 'bg-green-500', link: '/responsibles' },
        { label: 'Documentos', value: stats.totals.documents, icon: FileText, color: 'bg-red-500', link: '/documents' },
      ]
    : [];

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do mapeamento de processos"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-200
              hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats && (
          <>
            <DistributionCard
              title="Por Tipo"
              data={stats.processes_by_type}
              colors={{ manual: '#f97316', systemic: '#3b82f6', hybrid: '#8b5cf6' }}
              labels={{ manual: 'Manual', systemic: 'Sistêmico', hybrid: 'Híbrido' }}
            />
            <DistributionCard
              title="Por Status"
              data={stats.processes_by_status}
              colors={{ active: '#10b981', inactive: '#6b7280', draft: '#f59e0b', deprecated: '#ef4444' }}
              labels={{ active: 'Ativo', inactive: 'Inativo', draft: 'Rascunho', deprecated: 'Descontinuado' }}
            />
          </>
        )}
      </div>

      {overview && overview.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Visão por Área
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {overview.map((item) => (
              <Link
                key={item.id}
                to={`/areas/${item.id}`}
                className="group rounded-xl bg-white p-5 shadow-sm border border-gray-200
                  hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color || '#6b7280' }}
                    />
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span><strong className="text-gray-900">{item.total_processes}</strong> processos</span>
                  <span><strong className="text-gray-900">{item.root_processes}</strong> raiz</span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-100">
                  {Object.entries(item.by_status).map(([status, count]) => {
                    const pct = item.total_processes > 0 ? (count / item.total_processes) * 100 : 0;
                    const colors: Record<string, string> = {
                      active: '#10b981',
                      inactive: '#6b7280',
                      draft: '#f59e0b',
                      deprecated: '#ef4444',
                    };
                    return (
                      <div
                        key={status}
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: colors[status] || '#6b7280' }}
                        title={`${status}: ${count}`}
                      />
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DistributionCard({
  title,
  data,
  colors,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  colors: Record<string, string>;
  labels: Record<string, string>;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <h3 className="mb-4 font-semibold text-gray-900">Processos {title}</h3>
      {total === 0 ? (
        <p className="text-sm text-gray-400">Sem dados</p>
      ) : (
        <>
          {/* Bar */}
          <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
            {Object.entries(data).map(([key, count]) => {
              const pct = (count / total) * 100;
              return (
                <div
                  key={key}
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: colors[key] || '#6b7280' }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data).map(([key, count]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[key] || '#6b7280' }}
                />
                <span className="text-gray-600">
                  {labels[key] || key}: <strong>{count}</strong>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
