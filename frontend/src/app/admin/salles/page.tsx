"use client";
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { salleService } from '@/lib/services/salle.service';
import type { Salle } from '@/types/salle.types';
import { toast } from 'sonner';
import { CreateSalleForm } from '@/components/admin/salles/CreateSalleForm';
import { SalleList } from '@/components/admin/salles/SalleList';

export default function AdminSallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Salle>>({ name: '', capacity: 0, type: 'OTHER' as any });

  useEffect(() => {
    salleService.list().then(setSalles).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      const created = await salleService.create(form as any);
      setSalles((p) => [created, ...p]);
    } catch {
      toast.error('Create failed');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete salle?')) return;
    try {
      await salleService.remove(id);
      setSalles((p) => p.filter((s) => s.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Salles</h1>
        <CreateSalleForm form={form} setForm={setForm} create={create} />
        <SalleList salles={salles} remove={remove} />
      </div>
    </AdminLayout>
  );
}