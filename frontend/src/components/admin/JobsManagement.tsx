'use client';

import React, { useEffect, useState } from 'react';
import { jobsService } from '@/lib/services/jobs.service';
import { Jobs } from '@/types/jobs.types';
import { CreateJobForm } from '@/components/admin/jobs/CreateJobForm';
import { JobsList } from '@/components/admin/jobs/JobsList';
import { toast } from 'sonner';

export function JobsManagement() {
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Jobs>>({});

  useEffect(() => {
    jobsService.list().then(setJobs);
  }, []);

  const handleEdit = (job: Jobs) => {
    setForm(job);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this jobs?')) return;
    try {
      await jobsService.remove(id);
      setJobs(jobs.filter(j => j.id !== id));
      toast.success('Jobs deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        const updated = await jobsService.update(form.id!, form);
        setJobs(jobs.map(j => j.id === updated.id ? updated : j));
        toast.success('Jobs updated');
      } else {
        const created = await jobsService.create(form);
        setJobs([created, ...jobs]);
        toast.success('Jobs created');
      }
      setForm({});
      setIsEditing(false);
    } catch {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Jobs Management</h2>
      <CreateJobForm form={form} setForm={setForm} onSubmit={handleSubmit} isEditing={isEditing} />
      <JobsList jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
