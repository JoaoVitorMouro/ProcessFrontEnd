import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, Plus, Wrench, Users, FileText } from 'lucide-react';
import { areaService, processService, toolService, responsibleService, documentService } from '@/services';
import type { Area, Process, ProcessFormData, ProcessType, ProcessStatus, ProcessPriority, Tool, Responsible, Document } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { StatusBadge, TypeBadge, PriorityBadge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';

export default function AreaTreePage() {
  const { id } = useParams<{ id: string }>();
  const [area, setArea] = useState<(Area & { processes: Process[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTree = () => {
    if (!id) return;
    setLoading(true);
    areaService.tree(Number(id))
      .then((res) => setArea(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTree();
  }, [id]);

  const handleSave = async (data: ProcessFormData) => {
    setSaving(true);
    try {
      await processService.create(data);
      toast('success', 'Processo criado!');
      setModalOpen(false);
      fetchTree();
    } catch {
      toast('error', 'Erro ao criar processo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!area) return <EmptyState title="Área não encontrada" />;

  return (
    <div className="fade-in">
      <div className="mb-4">
        <Link to="/areas" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" /> Voltar para Áreas
        </Link>
      </div>

      <PageHeader
        title={area.name}
        description={area.description || 'Árvore de processos'}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Novo Processo
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: area.color || '#6b7280' }}
        />
        <span className="text-sm text-gray-500">
          {area.processes?.length ?? 0} processos raiz
        </span>
      </div>

      {!area.processes || area.processes.length === 0 ? (
        <EmptyState
          title="Nenhum processo nesta área"
          description="Crie o primeiro processo para começar a mapear."
        />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="space-y-1">
            {area.processes.map((process) => (
              <TreeNode key={process.id} process={process} depth={0} />
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Processo"
        size="lg"
      >
        <ProcessForm
          areaId={area.id}
          areaName={area.name}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>
    </div>
  );
}

function TreeNode({ process, depth }: { process: Process; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = process.children && process.children.length > 0;
  const hasDetails =
    (process.tools && process.tools.length > 0) ||
    (process.responsibles && process.responsibles.length > 0) ||
    (process.documents && process.documents.length > 0);

  return (
    <div className="slide-in" style={{ animationDelay: `${depth * 30}ms` }}>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors
          ${depth > 0 ? 'ml-6 border-l-2 border-gray-200' : ''}`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={`shrink-0 rounded p-0.5 transition-colors
            ${hasChildren ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' : 'invisible'}`}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: process.color || '#6b7280' }}
        />

        <Link
          to={`/processes/${process.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
        >
          {process.name}
        </Link>

        <div className="flex items-center gap-1.5 ml-2">
          <TypeBadge type={process.type} />
          <StatusBadge status={process.status} />
          <PriorityBadge priority={process.priority} />
        </div>

        {hasDetails && (
          <div className="ml-auto flex items-center gap-2 text-gray-300">
            {process.tools && process.tools.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs" title={`${process.tools.length} ferramentas`}>
                <Wrench className="h-3 w-3" /> {process.tools.length}
              </span>
            )}
            {process.responsibles && process.responsibles.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs" title={`${process.responsibles.length} responsáveis`}>
                <Users className="h-3 w-3" /> {process.responsibles.length}
              </span>
            )}
            {process.documents && process.documents.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs" title={`${process.documents.length} documentos`}>
                <FileText className="h-3 w-3" /> {process.documents.length}
              </span>
            )}
          </div>
        )}

        {hasChildren && (
          <span className="ml-auto text-xs text-gray-400">
            {process.children!.length} sub
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="ml-2">
          {process.children!.map((child) => (
            <TreeNode key={child.id} process={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessForm({
  areaId,
  areaName,
  onSubmit,
  onCancel,
  saving,
}: {
  areaId: number;
  areaName: string;
  onSubmit: (data: ProcessFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProcessType>('manual');
  const [status, setStatus] = useState<ProcessStatus>('active');
  const [priority, setPriority] = useState<ProcessPriority>('medium');
  const [color, setColor] = useState('#6b7280');

  // Associações
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [allResponsibles, setAllResponsibles] = useState<Responsible[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  const [selectedTools, setSelectedTools] = useState<{ id: number; notes: string }[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<{ id: number; notes: string }[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<{ id: number; notes: string }[]>([]);

  useEffect(() => {
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
      parent_id: null,
      name,
      description: description || undefined,
      type,
      status,
      priority,
      color: color || undefined,
      tools: selectedTools.map((t) => ({ id: t.id, notes: t.notes || undefined })),
      responsibles: selectedResponsibles.map((r) => ({ id: r.id, notes: r.notes || undefined })),
      documents: selectedDocuments.map((d) => ({ id: d.id, notes: d.notes || undefined })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Área</label>
          <input
            type="text"
            value={areaName}
            disabled
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-500"
          />
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>Criar</Button>
      </div>
    </form>
  );
}
