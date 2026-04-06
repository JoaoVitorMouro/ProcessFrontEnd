import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight, Wrench, Users, FileText } from 'lucide-react';
import { processService, areaService, toolService, responsibleService, documentService } from '@/services';
import type { Process, Area, ProcessFormData, ProcessFilters, ProcessType, ProcessStatus, ProcessPriority, Tool, Responsible, Document } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { StatusBadge, TypeBadge, PriorityBadge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';

export default function ProcessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Process | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Process | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters from URL
  const filters: ProcessFilters = {
    area_id: searchParams.get('area_id') ? Number(searchParams.get('area_id')) : undefined,
    status: (searchParams.get('status') as ProcessStatus) || undefined,
    type: (searchParams.get('type') as ProcessType) || undefined,
    priority: (searchParams.get('priority') as ProcessPriority) || undefined,
    search: searchParams.get('search') || undefined,
    root_only: searchParams.get('root_only') === 'true' || undefined,
  };

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await processService.list({ ...filters, page, per_page: 15 });
      setProcesses(res.data.data.data);
      setLastPage(res.data.data.meta.last_page);
      setTotal(res.data.data.meta.total);
    } catch {
      toast('error', 'Erro ao carregar processos.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]); 

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  useEffect(() => {
    areaService.list({ per_page: 100 }).then((res) => setAreas(res.data.data.data));
  }, []);

  const handleSave = async (data: ProcessFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await processService.update(editing.id, data);
        toast('success', 'Processo atualizado!');
      } else {
        await processService.create(data);
        toast('success', 'Processo criado!');
      }
      setModalOpen(false);
      setEditing(null);
      fetchProcesses();
    } catch {
      toast('error', 'Erro ao salvar processo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await processService.delete(deleteTarget.id);
      toast('success', 'Processo removido!');
      setDeleteTarget(null);
      fetchProcesses();
    } catch {
      toast('error', 'Erro ao remover processo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Processos"
        description={`${total} processos encontrados`}
        action={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Novo Processo
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.search || ''}
            onChange={(e) => setFilter('search', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={filters.area_id || ''}
          onChange={(e) => setFilter('area_id', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todas as áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          value={filters.type || ''}
          onChange={(e) => setFilter('type', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos os tipos</option>
          <option value="manual">Manual</option>
          <option value="systemic">Sistêmico</option>
          <option value="hybrid">Híbrido</option>
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilter('status', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="draft">Rascunho</option>
          <option value="deprecated">Descontinuado</option>
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todas prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={!!filters.root_only}
            onChange={(e) => setFilter('root_only', e.target.checked ? 'true' : '')}
            className="rounded"
          />
          Apenas raiz
        </label>
      </div>

      {loading ? (
        <Spinner />
      ) : processes.length === 0 ? (
        <EmptyState
          title="Nenhum processo encontrado"
          description="Ajuste os filtros ou crie um novo processo."
          action={
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Criar Processo
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Prioridade</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Hierarquia</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color || '#6b7280' }}
                        />
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={p.type} /></td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.is_root ? (
                        <span className="text-blue-600 font-medium">Raiz</span>
                      ) : (
                        <span>Subprocesso</span>
                      )}
                      {(p.children_count ?? 0) > 0 && (
                        <span className="ml-1 text-gray-400">({p.children_count} filhos)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/processes/${p.id}`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Página {page} de {lastPage} ({total} itens)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Processo' : 'Novo Processo'}
        size="lg"
      >
        <ProcessForm
          initial={editing}
          areas={areas}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
          defaultAreaId={filters.area_id}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover Processo"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"?`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={saving}
      />
    </div>
  );
}

function ProcessForm({
  initial,
  areas,
  onSubmit,
  onCancel,
  saving,
  defaultAreaId,
}: {
  initial: Process | null;
  areas: Area[];
  onSubmit: (data: ProcessFormData) => void;
  onCancel: () => void;
  saving: boolean;
  defaultAreaId?: number;
}) {
  const [areaId, setAreaId] = useState(initial?.area_id ?? defaultAreaId ?? (areas[0]?.id || 0));
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<ProcessType>(initial?.type ?? 'manual');
  const [status, setStatus] = useState<ProcessStatus>(initial?.status ?? 'active');
  const [priority, setPriority] = useState<ProcessPriority>(initial?.priority ?? 'medium');
  const [color, setColor] = useState(initial?.color ?? '#6b7280');

  // Associações — apenas para processos raiz
  const isRoot = !initial || initial.is_root;

  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [allResponsibles, setAllResponsibles] = useState<Responsible[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  const [selectedTools, setSelectedTools] = useState<{ id: number; notes: string }[]>(
    initial?.tools?.map((t) => ({ id: t.id, notes: t.pivot?.notes || '' })) ?? []
  );
  const [selectedResponsibles, setSelectedResponsibles] = useState<{ id: number; notes: string }[]>(
    initial?.responsibles?.map((r) => ({ id: r.id, notes: r.pivot?.notes || '' })) ?? []
  );
  const [selectedDocuments, setSelectedDocuments] = useState<{ id: number; notes: string }[]>(
    initial?.documents?.map((d) => ({ id: d.id, notes: d.pivot?.notes || '' })) ?? []
  );

  useEffect(() => {
    if (!isRoot) return;
    toolService.list({ per_page: 100 }).then((res) => setAllTools(res.data.data.data));
    responsibleService.list({ per_page: 100 }).then((res) => setAllResponsibles(res.data.data.data));
    documentService.list({ per_page: 100 }).then((res) => setAllDocuments(res.data.data.data));
  }, []);

  const toggleItem = (
    list: { id: number; notes: string }[],
    setList: React.Dispatch<React.SetStateAction<{ id: number; notes: string }[]>>,
    id: number,
  ) => {
    const exists = list.find((i) => i.id === id);
    if (exists) setList(list.filter((i) => i.id !== id));
    else setList([...list, { id, notes: '' }]);
  };

  const updateNotes = (
    list: { id: number; notes: string }[],
    setList: React.Dispatch<React.SetStateAction<{ id: number; notes: string }[]>>,
    id: number,
    notes: string,
  ) => {
    setList(list.map((i) => (i.id === id ? { ...i, notes } : i)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      area_id: areaId,
      parent_id: initial?.parent_id ?? null,
      name,
      description: description || undefined,
      type,
      status,
      priority,
      color: color || undefined,
      ...(isRoot && {
        tools: selectedTools.map((t) => ({ id: t.id, notes: t.notes || undefined })),
        responsibles: selectedResponsibles.map((r) => ({ id: r.id, notes: r.notes || undefined })),
        documents: selectedDocuments.map((d) => ({ id: d.id, notes: d.notes || undefined })),
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Área *</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            required
          >
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as ProcessType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option value="manual">Manual</option>
            <option value="systemic">Sistêmico</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProcessStatus)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="draft">Rascunho</option>
            <option value="deprecated">Descontinuado</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as ProcessPriority)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Cor</label>
        <div className="flex items-center gap-3">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300" />
          <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
        </div>
      </div>

      {isRoot && (
        <>
          {/* Ferramentas */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Wrench className="h-4 w-4 text-amber-600" /> Ferramentas
            </label>
            {allTools.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma ferramenta cadastrada.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {allTools.map((tool) => {
                  const selected = selectedTools.find((t) => t.id === tool.id);
                  return (
                    <div key={tool.id} className="px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleItem(selectedTools, setSelectedTools, tool.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">{tool.name}</span>
                        {tool.category && <span className="text-xs text-gray-400">({tool.category})</span>}
                      </label>
                      {selected && (
                        <input
                          type="text"
                          placeholder="Observações (opcional)"
                          value={selected.notes}
                          onChange={(e) => updateNotes(selectedTools, setSelectedTools, tool.id, e.target.value)}
                          className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Responsáveis */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4 text-green-600" /> Responsáveis
            </label>
            {allResponsibles.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum responsável cadastrado.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {allResponsibles.map((resp) => {
                  const selected = selectedResponsibles.find((r) => r.id === resp.id);
                  return (
                    <div key={resp.id} className="px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleItem(selectedResponsibles, setSelectedResponsibles, resp.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">{resp.name}</span>
                        {resp.role && <span className="text-xs text-gray-400">({resp.role})</span>}
                      </label>
                      {selected && (
                        <input
                          type="text"
                          placeholder="Observações (opcional)"
                          value={selected.notes}
                          onChange={(e) => updateNotes(selectedResponsibles, setSelectedResponsibles, resp.id, e.target.value)}
                          className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4 text-red-600" /> Documentos
            </label>
            {allDocuments.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum documento cadastrado.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {allDocuments.map((doc) => {
                  const selected = selectedDocuments.find((d) => d.id === doc.id);
                  return (
                    <div key={doc.id} className="px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleItem(selectedDocuments, setSelectedDocuments, doc.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">{doc.name}</span>
                        {doc.type && <span className="text-xs text-gray-400">({doc.type})</span>}
                      </label>
                      {selected && (
                        <input
                          type="text"
                          placeholder="Observações (opcional)"
                          value={selected.notes}
                          onChange={(e) => updateNotes(selectedDocuments, setSelectedDocuments, doc.id, e.target.value)}
                          className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
