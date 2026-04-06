import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { toolService } from '@/services';
import type { Tool, ToolFormData } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await toolService.list({ search: search || undefined, per_page: 100 });
      setTools(res.data.data.data);
    } catch {
      toast('error', 'Erro ao carregar ferramentas.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchTools, 300);
    return () => clearTimeout(t);
  }, [fetchTools]);

  const handleSave = async (data: ToolFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await toolService.update(editing.id, data);
        toast('success', 'Ferramenta atualizada!');
      } else {
        await toolService.create(data);
        toast('success', 'Ferramenta criada!');
      }
      setModalOpen(false);
      setEditing(null);
      fetchTools();
    } catch {
      toast('error', 'Erro ao salvar ferramenta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await toolService.delete(deleteTarget.id);
      toast('success', 'Ferramenta removida!');
      setDeleteTarget(null);
      fetchTools();
    } catch {
      toast('error', 'Erro ao remover ferramenta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Ferramentas"
        description="Sistemas e ferramentas utilizados nos processos"
        action={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Nova Ferramenta
          </Button>
        }
      />

      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar ferramentas..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {loading ? <Spinner /> : tools.length === 0 ? (
        <EmptyState title="Nenhuma ferramenta" description={search ? 'Tente outra busca.' : 'Cadastre a primeira ferramenta.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.id} className="group rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(tool); setModalOpen(true); }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(tool)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {tool.category && (
                <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 mb-2">{tool.category}</span>
              )}
              {tool.description && <p className="text-sm text-gray-500 line-clamp-2">{tool.description}</p>}
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" /> {new URL(tool.url).hostname}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Ferramenta' : 'Nova Ferramenta'}>
        <ToolForm initial={editing} onSubmit={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} saving={saving} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Remover Ferramenta"
        message={`Remover "${deleteTarget?.name}"?`} confirmLabel="Remover"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}

function ToolForm({ initial, onSubmit, onCancel, saving }: {
  initial: Tool | null; onSubmit: (d: ToolFormData) => void; onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description: description || undefined, url: url || undefined, icon: icon || undefined, category: category || undefined }); }} className="space-y-4">
      <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://" />
      <Input label="Ícone" value={icon} onChange={(e) => setIcon(e.target.value)} />
      <Input label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Gestão de Projetos" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
