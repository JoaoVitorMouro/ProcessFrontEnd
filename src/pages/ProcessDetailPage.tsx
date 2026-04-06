import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Wrench,
  Users,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Building,
  GitBranchPlus,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { processService, areaService } from '@/services';
import type { Process, BreadcrumbData, ProcessFormData, Area, ProcessType, ProcessStatus, ProcessPriority } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import { StatusBadge, TypeBadge, PriorityBadge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<Process | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  /* Subprocess CRUD state */
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Process | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Process | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProcess = useCallback(() => {
    if (!id) return;
    const pid = Number(id);
    setLoading(true);
    Promise.all([processService.get(pid), processService.breadcrumb(pid)])
      .then(([procRes, bcRes]) => {
        setProcess(procRes.data.data);
        setBreadcrumb(bcRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProcess();
  }, [fetchProcess]);

  useEffect(() => {
    areaService.list({ per_page: 100 }).then((res) => setAreas(res.data.data.data));
  }, []);

  const handleAddChild = () => {
    setEditingChild(null);
    setSubModalOpen(true);
  };

  const handleEditChild = (child: Process) => {
    setEditingChild(child);
    setSubModalOpen(true);
  };

  const handleSaveChild = async (data: ProcessFormData) => {
    setSaving(true);
    try {
      if (editingChild) {
        await processService.update(editingChild.id, data);
        toast('success', 'Subprocesso atualizado!');
      } else {
        await processService.create(data);
        toast('success', 'Subprocesso criado!');
      }
      setSubModalOpen(false);
      setEditingChild(null);
      fetchProcess();
    } catch {
      toast('error', 'Erro ao salvar subprocesso.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await processService.delete(deleteTarget.id);
      toast('success', 'Subprocesso removido!');
      setDeleteTarget(null);
      fetchProcess();
    } catch {
      toast('error', 'Erro ao remover subprocesso.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!process) return <EmptyState title="Processo não encontrado" />;

  return (
    <div className="fade-in">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/processes" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Processos
        </Link>
        {breadcrumb && breadcrumb.breadcrumb.map((name, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className={i === breadcrumb.breadcrumb.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {name}
            </span>
          </span>
        ))}
      </div>

      <PageHeader
        title={process.name}
        description={process.description || undefined}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TypeBadge type={process.type} />
        <StatusBadge status={process.status} />
        <PriorityBadge priority={process.priority} />
        {process.is_root && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <GitBranchPlus className="h-3 w-3" /> Processo Raiz
          </span>
        )}
        {process.color && (
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: process.color }} />
            <span className="text-xs text-gray-400">{process.color}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Section
            title="Subprocessos"
            icon={<GitBranchPlus className="h-5 w-5 text-purple-600" />}
            action={
              <Button size="sm" onClick={handleAddChild}>
                <Plus className="h-4 w-4" /> Novo Subprocesso
              </Button>
            }
          >
            {process.children && process.children.length > 0 ? (
              <div className="space-y-1">
                {process.children.map((child) => (
                  <ChildNode
                    key={child.id}
                    process={child}
                    depth={0}
                    onEdit={handleEditChild}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-2">
                Nenhum subprocesso cadastrado. Clique em "Novo Subprocesso" para adicionar.
              </p>
            )}
          </Section>

          {process.tools && process.tools.length > 0 && (
            <Section title="Ferramentas" icon={<Wrench className="h-5 w-5 text-amber-600" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {process.tools.map((tool) => (
                  <div key={tool.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{tool.name}</h4>
                      {tool.url && (
                        <a href={tool.url} target="_blank" rel="noreferrer"
                          className="text-blue-500 hover:text-blue-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {tool.category && <p className="text-xs text-gray-400 mt-0.5">{tool.category}</p>}
                    {tool.description && <p className="text-sm text-gray-500 mt-1">{tool.description}</p>}
                    {tool.pivot?.notes && (
                      <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                        📝 {tool.pivot.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {process.documents && process.documents.length > 0 && (
            <Section title="Documentos" icon={<FileText className="h-5 w-5 text-red-600" />}>
              <div className="space-y-3">
                {process.documents.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        {doc.type && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{doc.type}</span>
                        )}
                      </div>
                      {doc.description && <p className="text-sm text-gray-500 mt-1">{doc.description}</p>}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Abrir link
                        </a>
                      )}
                      {doc.pivot?.notes && (
                        <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                          📝 {doc.pivot.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          {process.responsibles && process.responsibles.length > 0 && (
            <Section title="Responsáveis" icon={<Users className="h-5 w-5 text-green-600" />}>
              <div className="space-y-3">
                {process.responsibles.map((resp) => (
                  <div key={resp.id} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900">{resp.name}</h4>
                    {resp.role && <p className="text-xs text-gray-500">{resp.role}</p>}
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      {resp.department && (
                        <p className="flex items-center gap-1"><Building className="h-3 w-3" /> {resp.department}</p>
                      )}
                      {resp.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${resp.email}`} className="text-blue-600 hover:underline">{resp.email}</a>
                        </p>
                      )}
                      {resp.phone && (
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {resp.phone}</p>
                      )}
                    </div>
                    {resp.pivot?.notes && (
                      <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                        📝 {resp.pivot.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Informações</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="font-mono text-gray-900">#{process.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ordem</dt>
                <dd className="text-gray-900">{process.order}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Criado em</dt>
                <dd className="text-gray-900">{new Date(process.created_at).toLocaleDateString('pt-BR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Atualizado em</dt>
                <dd className="text-gray-900">{new Date(process.updated_at).toLocaleDateString('pt-BR')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Modal
        open={subModalOpen}
        onClose={() => { setSubModalOpen(false); setEditingChild(null); }}
        title={editingChild ? 'Editar Subprocesso' : 'Novo Subprocesso'}
        size="lg"
      >
        <SubProcessForm
          initial={editingChild}
          parentProcess={process}
          areas={areas}
          onSubmit={handleSaveChild}
          onCancel={() => { setSubModalOpen(false); setEditingChild(null); }}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover Subprocesso"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"? Subprocessos filhos também serão afetados.`}
        confirmLabel="Remover"
        onConfirm={handleDeleteChild}
        onCancel={() => setDeleteTarget(null)}
        loading={saving}
      />
    </div>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          {icon} {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ChildNode({
  process,
  depth,
  onEdit,
  onDelete,
}: {
  process: Process;
  depth: number;
  onEdit: (p: Process) => void;
  onDelete: (p: Process) => void;
}) {
  return (
    <div>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors
          ${depth > 0 ? 'ml-6 border-l-2 border-gray-200' : ''}`}
      >
        <Link
          to={`/processes/${process.id}`}
          className="flex flex-1 items-center gap-2 min-w-0"
        >
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: process.color || '#6b7280' }}
          />
          <span className="font-medium text-gray-900 truncate">{process.name}</span>
          <TypeBadge type={process.type} />
          <StatusBadge status={process.status} />
          {(process.children_count ?? 0) > 0 && (
            <span className="text-xs text-gray-400">({process.children_count} filhos)</span>
          )}
        </Link>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Link
            to={`/processes/${process.id}`}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            title="Ver detalhes"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onEdit(process)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(process)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            title="Remover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {process.children?.map((child) => (
        <ChildNode
          key={child.id}
          process={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function SubProcessForm({
  initial,
  parentProcess,
  areas,
  onSubmit,
  onCancel,
  saving,
}: {
  initial: Process | null;
  parentProcess: Process;
  areas: Area[];
  onSubmit: (data: ProcessFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [areaId, setAreaId] = useState(initial?.area_id ?? parentProcess.area_id);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<ProcessType>(initial?.type ?? 'manual');
  const [status, setStatus] = useState<ProcessStatus>(initial?.status ?? 'active');
  const [priority, setPriority] = useState<ProcessPriority>(initial?.priority ?? 'medium');
  const [color, setColor] = useState(initial?.color ?? '#6b7280');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      area_id: areaId,
      parent_id: initial?.parent_id ?? parentProcess.id,
      name,
      description: description || undefined,
      type,
      status,
      priority,
      color: color || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-purple-50 border border-purple-200 px-4 py-3 text-sm">
        <span className="text-purple-700 font-medium">Processo pai:</span>{' '}
        <span className="text-purple-900">{parentProcess.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Área *</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            required
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProcessType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="manual">Manual</option>
            <option value="systemic">Sistêmico</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProcessStatus)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="draft">Rascunho</option>
            <option value="deprecated">Descontinuado</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Prioridade</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProcessPriority)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
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
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300"
          />
          <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar Subprocesso'}</Button>
      </div>
    </form>
  );
}
