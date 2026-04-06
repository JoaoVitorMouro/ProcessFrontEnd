import { useEffect, useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { changelogService } from '@/services';
import type { ProcessChange } from '@/types';
import { toast } from '@/components/ui/Toast';

interface ChangelogEntry extends ProcessChange {
  process_id: number;
  process_name: string;
}

export default function ChangelogPage() {
  const [changes, setChanges] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [days, setDays] = useState(30);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    fetchChanges();
  }, [currentPage, days]);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await changelogService.getAllChanges(days, currentPage);
      const paginated = res.data?.data ?? res.data;
      setChanges((paginated?.data ?? paginated) as unknown as ChangelogEntry[]);
      setLastPage(paginated?.meta?.last_page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load changelog');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (changeId: number, processId: number) => {
    try {
      setRestoringId(changeId);
      await changelogService.restoreVersion(processId, changeId);
      toast('success', 'Process restored successfully');
      await fetchChanges();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to restore process');
    } finally {
      setRestoringId(null);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'updated':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'deleted':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'restored':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Created';
      case 'updated':
        return 'Updated';
      case 'deleted':
        return 'Deleted';
      case 'restored':
        return 'Restored';
      default:
        return action;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Log de Processos</h1>
        <p className="text-gray-600 mt-2">
          Listagem de alterações realizadas nos processos!
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
        <label className="font-medium text-gray-700">Mostrar alterações desde:</label>
        <select
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Ultimos 7 dias</option>
          <option value={30}>Ultimos 30 dias</option>
          <option value={90}>Ultimos 90 dias</option>
          <option value={365}>Ano passado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading changelog...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : changes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">
          No changes found in the selected period
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

            <div className="space-y-4">
              {changes.map((change) => (
                <ChangelogItem
                  key={change.id}
                  change={change}
                  onRestore={handleRestore}
                  isRestoring={restoringId === change.id}
                  getActionColor={getActionColor}
                  getActionLabel={getActionLabel}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > lastPage) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
                disabled={currentPage === lastPage}
                className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChangelogItem({
  change,
  onRestore,
  isRestoring,
  getActionColor,
  getActionLabel,
  formatDate,
}: {
  change: ChangelogEntry;
  onRestore: (changeId: number, processId: number) => void;
  isRestoring: boolean;
  getActionColor: (action: string) => string;
  getActionLabel: (action: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="relative pl-16">
      <div
        className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
          change.action === 'created'
            ? 'bg-green-500'
            : change.action === 'updated'
              ? 'bg-blue-500'
              : change.action === 'deleted'
                ? 'bg-red-500'
                : 'bg-purple-500'
        }`}
      />

      <div className={`border rounded-lg p-4 ${getActionColor(change.action)}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-lg">{change.process_name}</h4>
            <p className="text-sm opacity-75">
              <span className="font-medium">{getActionLabel(change.action)}</span>
              {change.changed_by && (
                <>
                  {' '}
                  by <span className="font-medium">{change.changed_by}</span>
                </>
              )}
            </p>
          </div>
          {(change.action === 'updated' || change.action === 'deleted') && (
            <button
              onClick={() => onRestore(change.id, change.process_id)}
              disabled={isRestoring}
              className="flex items-center gap-1 px-3 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-100 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </>
              )}
            </button>
          )}
        </div>

        {change.description && (
          <p className="text-sm mb-3 opacity-90">{change.description}</p>
        )}

        {change.changes && Object.keys(change.changes).length > 0 && (
          <div className="mt-3 text-sm space-y-1 bg-white bg-opacity-30 p-2 rounded">
            {Object.entries(change.changes).map(([key, value]: [string, any]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium min-w-fit">{key}:</span>
                <span className="opacity-90">
                  {typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs opacity-60 mt-3">
          {formatDate(change.created_at)}
        </p>
      </div>
    </div>
  );
}
