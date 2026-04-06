import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, FileText, ExternalLink } from 'lucide-react';
import { documentService } from '@/services';
import type { Document, DocumentFormData } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function DocumentsPage() {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentService.list({ search: search || undefined, per_page: 100 });
      setItems(res.data.data.data);
    } catch {
      toast('error', 'Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleSave = async (data: DocumentFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await documentService.update(editing.id, data);
        toast('success', 'Documento atualizado!');
      } else {
        await documentService.create(data);
        toast('success', 'Documento criado!');
      }
      setModalOpen(false);
      setEditing(null);
      fetchData();
    } catch {
      toast('error', 'Erro ao salvar documento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await documentService.delete(deleteTarget.id);
      toast('success', 'Documento removido!');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast('error', 'Erro ao remover.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader title="Documentos" description="Documentação associada aos processos"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Novo Documento</Button>}
      />

      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar documentos..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="Nenhum documento" description={search ? 'Tente outra busca.' : 'Cadastre o primeiro documento.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(item); setModalOpen(true); }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {item.type && (
                <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 mb-2">{item.type}</span>
              )}
              {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" /> Abrir link
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Documento' : 'Novo Documento'}>
        <DocumentForm initial={editing} onSubmit={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} saving={saving} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Remover Documento"
        message={`Remover "${deleteTarget?.name}"?`} confirmLabel="Remover"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}

function DocumentForm({ initial, onSubmit, onCancel, saving }: {
  initial: Document | null; onSubmit: (d: DocumentFormData) => void; onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [type, setType] = useState(initial?.type ?? '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description: description || undefined, url: url || undefined, type: type || undefined }); }} className="space-y-4">
      <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://" />
      <Input label="Tipo" value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex: PDF, Planilha, Fluxograma" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
