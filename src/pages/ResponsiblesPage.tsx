import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Mail, Phone, Building } from 'lucide-react';
import { responsibleService } from '@/services';
import type { Responsible, ResponsibleFormData } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function ResponsiblesPage() {
  const [items, setItems] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Responsible | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Responsible | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await responsibleService.list({ search: search || undefined, per_page: 100 });
      setItems(res.data.data.data);
    } catch {
      toast('error', 'Erro ao carregar responsáveis.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleSave = async (data: ResponsibleFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await responsibleService.update(editing.id, data);
        toast('success', 'Responsável atualizado!');
      } else {
        await responsibleService.create(data);
        toast('success', 'Responsável criado!');
      }
      setModalOpen(false);
      setEditing(null);
      fetchData();
    } catch {
      toast('error', 'Erro ao salvar responsável.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await responsibleService.delete(deleteTarget.id);
      toast('success', 'Responsável removido!');
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
      <PageHeader title="Responsáveis" description="Pessoas e equipes responsáveis pelos processos"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> Novo Responsável</Button>}
      />

      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar responsáveis..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="Nenhum responsável" description={search ? 'Tente outra busca.' : 'Cadastre o primeiro responsável.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.role && <p className="text-xs text-gray-500">{item.role}</p>}
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
              <div className="space-y-1 text-sm text-gray-500">
                {item.department && (
                  <p className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-gray-400" /> {item.department}</p>
                )}
                {item.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">{item.email}</a>
                  </p>
                )}
                {item.phone && (
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {item.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Responsável' : 'Novo Responsável'}>
        <ResponsibleForm initial={editing} onSubmit={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} saving={saving} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Remover Responsável"
        message={`Remover "${deleteTarget?.name}"?`} confirmLabel="Remover"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}

function ResponsibleForm({ initial, onSubmit, onCancel, saving }: {
  initial: Responsible | null; onSubmit: (d: ResponsibleFormData) => void; onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email: email || undefined, role: role || undefined, department: department || undefined, phone: phone || undefined }); }} className="space-y-4">
      <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      <Input label="Cargo/Função" value={role} onChange={(e) => setRole(e.target.value)} />
      <Input label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
