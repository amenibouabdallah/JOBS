import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityType } from '@/types/activity-type.types';
import { Salle } from '@/types/salle.types';
import { toast } from 'sonner';

interface CreateActivityFormProps {
  salles: Salle[];
  types: ActivityType[];
  selectedTypeId: number | null;
  onCreate: (form: any) => Promise<void>;
  onSelectType: (id: number) => void;
}

export const CreateActivityForm: React.FC<CreateActivityFormProps> = ({
  salles,
  types,
  selectedTypeId,
  onCreate,
  onSelectType,
}) => {
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    capacity: 0,
    isRequired: false,
    requiredForRoles: [],
    activityTypeId: selectedTypeId || undefined,
    salleId: undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((f: any) => ({ ...f, activityTypeId: selectedTypeId || undefined }));
  }, [selectedTypeId]);

  const handleSubmit = async () => {
    if (!form.name || !form.startTime || !form.endTime || !(form.activityTypeId ?? selectedTypeId) || !form.salleId) {
      toast.error('Name, Start Time, End Time, Type and Salle are required');
      return;
    }
    setLoading(true);
    await onCreate({
      ...form,
      startTime: new Date(`2000-01-01T${form.startTime}:00`),
      endTime: new Date(`2000-01-01T${form.endTime}:00`),
      activityTypeId: form.activityTypeId ?? selectedTypeId!,
    });
    setForm({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      capacity: 0,
      isRequired: false,
      requiredForRoles: [],
      activityTypeId: selectedTypeId || undefined,
      salleId: undefined,
    });
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Activity {selectedTypeId ? `for ${types.find(t=>t.id===selectedTypeId)?.name}` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
          disabled={loading}
        />
        <Input
          type="time"
          placeholder="Start Time"
          value={form.startTime}
          onChange={(e) => setForm((f: any) => ({ ...f, startTime: e.target.value }))}
          disabled={loading}
        />
        <Input
          type="time"
          placeholder="End Time"
          value={form.endTime}
          onChange={(e) => setForm((f: any) => ({ ...f, endTime: e.target.value }))}
          disabled={loading}
        />
        <Input
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => setForm((f: any) => ({ ...f, capacity: Number(e.target.value) }))}
          disabled={loading}
        />
        <select
          className="border bg-background rounded px-2 py-2"
          value={form.activityTypeId ?? selectedTypeId ?? ''}
          onChange={(e) => {
            const id = Number(e.target.value);
            setForm((f: any) => ({ ...f, activityTypeId: id }));
            onSelectType(id);
          }}
          disabled={loading}
        >
          <option value="">Select Activity Type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="border bg-background rounded px-2 py-2"
          value={form.salleId ?? ''}
          onChange={(e) => setForm((f: any) => ({ ...f, salleId: Number(e.target.value) }))}
          disabled={loading}
        >
          <option value="">Select Salle</option>
          {salles.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (cap {s.capacity})</option>
          ))}
        </select>
        <Button
          onClick={handleSubmit}
          disabled={loading || !form.name || !form.startTime || !form.endTime || !(form.activityTypeId ?? selectedTypeId) || !form.salleId}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Create
        </Button>
      </CardContent>
    </Card>
  );
};