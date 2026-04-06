import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, TreePine, ArrowRight } from 'lucide-react';
import { areaService } from '@/services';
import type { Area, AreaFormData } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await areaService.list({ search: search || undefined, per_page: 100 });
      setAreas(res.data.data.data);
    } catch {
      toast('error', 'Erro ao carregar áreas.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchAreas, 300);
    return () => clearTimeout(timer);
  }, [fetchAreas]);

  const handleSave = async (data: AreaFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await areaService.update(editing.id, data);
        toast('success', 'Área atualizada!');
      } else {
        await areaService.create(data);
        toast('success', 'Área criada!');
      }
      setModalOpen(false);
      setEditing(null);
      fetchAreas();
    } catch {
      toast('error', 'Erro ao salvar área.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await areaService.delete(deleteTarget.id);
      toast('success', 'Área removida!');
      setDeleteTarget(null);
      fetchAreas();
    } catch {
      toast('error', 'Erro ao remover área.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Áreas"
        description="Departamentos e áreas da organização"
        action={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Nova Área
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar áreas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : areas.length === 0 ? (
        <EmptyState
          title="Nenhuma área encontrada"
          description={search ? 'Tente outra busca.' : 'Crie a primeira área da organização.'}
          action={
            !search && (
              <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
                <Plus className="h-4 w-4" /> Criar Área
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="group rounded-xl bg-white p-5 shadow-sm border border-gray-200
                hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full ring-2 ring-offset-2 ring-gray-200"
                    style={{ backgroundColor: area.color || '#6b7280' }}
                  />
                  <h3 className="font-semibold text-gray-900">{area.name}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(area); setModalOpen(true); }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(area)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {area.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{area.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {area.processes_count ?? 0} processos
                </span>
                <Link
                  to={`/areas/${area.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <TreePine className="h-4 w-4" /> Ver árvore
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Área' : 'Nova Área'}
      >
        <AreaForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover Área"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação pode ser desfeita pelo administrador.`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={saving}
      />
    </div>
  );
}

function AreaForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial: Area | null;
  onSubmit: (data: AreaFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [color, setColor] = useState(initial?.color ?? '#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      icon: icon || undefined,
      color: color || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Ícone" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ex: users, building, code" />
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
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
