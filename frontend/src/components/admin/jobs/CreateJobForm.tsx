'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Jobs } from "@/types/jobs.types";

interface Props {
  form: Partial<Jobs>;
  setForm: (form: Partial<Jobs>) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

const formatDateForInput = (date: Date | undefined) => {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function CreateJobForm({ form, setForm, onSubmit, isEditing }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? 'Edit' : 'Create'} Jobs</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <Input type="datetime-local" placeholder="Start Date" value={formatDateForInput(form.startDate)} onChange={(e) => setForm({ ...form, startDate: new Date(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Subscription Deadline</label>
          <Input type="datetime-local" placeholder="Subscription Deadline" value={formatDateForInput(form.subscriptionDeadline)} onChange={(e) => setForm({ ...form, subscriptionDeadline: new Date(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Payment Start</label>
          <Input type="datetime-local" placeholder="Payment Start" value={formatDateForInput(form.payStart)} onChange={(e) => setForm({ ...form, payStart: new Date(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Payment Deadline</label>
          <Input type="datetime-local" placeholder="Payment Deadline" value={formatDateForInput(form.payDeadline)} onChange={(e) => setForm({ ...form, payDeadline: new Date(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">First Payment Deadline</label>
          <Input type="datetime-local" placeholder="First Payment Deadline" value={formatDateForInput(form.firstPayDeadline)} onChange={(e) => setForm({ ...form, firstPayDeadline: new Date(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Payment Amount</label>
          <Input type="number" placeholder="Payment Amount" value={form.PayAmount || 0} onChange={(e) => setForm({ ...form, PayAmount: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">First Payment Amount</label>
          <Input type="number" placeholder="First Payment Amount" value={form.firstPayAmount || 0} onChange={(e) => setForm({ ...form, firstPayAmount: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Second Payment Amount</label>
          <Input type="number" placeholder="Second Payment Amount" value={form.secondPayAmount || 0} onChange={(e) => setForm({ ...form, secondPayAmount: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium">Number of Participants</label>
          <Input type="number" placeholder="Number of Participants" value={form.nbrParticipants || 0} onChange={(e) => setForm({ ...form, nbrParticipants: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive || false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <span>Is Active</span>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onSubmit}>{isEditing ? 'Update' : 'Create'}</Button>
      </CardContent>
    </Card>
  )
}
