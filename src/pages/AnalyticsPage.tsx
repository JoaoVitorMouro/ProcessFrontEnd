import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { analyticsService } from '@/services';
import type { AnalyticsInsight } from '@/types';

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getInsights();
        setInsights(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análises</h1>
        <p className="text-gray-600 mt-2">
          Monitore os processos!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {insights.filter((i) => i.severity === 'critical').length}
          </div>
          <div className="text-sm text-red-700">Problemas Criticos</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {insights.filter((i) => i.severity === 'warning').length}
          </div>
          <div className="text-sm text-yellow-700">Avisos</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {insights.filter((i) => i.severity === 'info').length}
          </div>
          <div className="text-sm text-blue-700">Informações</div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No insights available!
          </div>
        ) : (
          insights.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      textColor: 'text-red-700',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      textColor: 'text-yellow-700',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
    },
  };

  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-4">
        <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${config.textColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${config.textColor}`}>
              {insight.message}
            </h4>
            {insight.count && (
              <span
                className={`text-xs px-2 py-1 rounded ${config.badgeBg} ${config.badgeText}`}
              >
                {insight.count}
              </span>
            )}
          </div>
          {insight.process_name && (
            <p className={`text-sm ${config.textColor} opacity-75 mb-2`}>
              Process: {insight.process_name}
            </p>
          )}
          {insight.area_name && (
            <p className={`text-sm ${config.textColor} opacity-75 mb-2`}>
              Area: {insight.area_name}
            </p>
          )}
          <p className={`text-sm ${config.textColor}`}>{insight.suggestion}</p>
        </div>
      </div>
    </div>
  );
}
