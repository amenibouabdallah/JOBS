"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Salle } from "@/types/salle.types";

interface Props {
  form: Partial<Salle>;
  setForm: (form: Partial<Salle>) => void;
  create: () => void;
}

export function CreateSalleForm({ form, setForm, create }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Create Salle</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-3">
        <Input placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="number" placeholder="Capacity" value={form.capacity || 0} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        <select className="border rounded bg-background px-2" value={form.type as any} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
          {['CONFERENCE_ROOM', 'MEETING_ROOM', 'WORKSHOP_ROOM', 'AMPHITHEATER', 'AUDITORIUM', 'PANEL_ROOM', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={create}>Create</Button>
      </CardContent>
    </Card>
  )
}