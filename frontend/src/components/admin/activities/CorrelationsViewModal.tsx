'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity } from '@/types/activity.types';
import { ParticipantRole } from '@/types/auth.types';
import { toast } from 'sonner';

interface CorrelationsViewModalProps {
  activities: Activity[];
  correlations: any[];
  onCreate: (data: { sourceActivityId: number; targetActivityId: number; rule: 'REQUIRES' | 'EXCLUDES' | 'ALL'; role: ParticipantRole | null }) => void;
  onDelete: (id: number) => void;
}

export function CorrelationsViewModal({
  activities,
  correlations,
  onCreate,
  onDelete,
}: CorrelationsViewModalProps) {
  const [sourceActivityId, setSourceActivityId] = useState<number | null>(null);
  const [targetActivityId, setTargetActivityId] = useState<number | null>(null);
  const [rule, setRule] = useState<'REQUIRES' | 'EXCLUDES' | 'ALL'>('REQUIRES');
  const [role, setRole] = useState<ParticipantRole | null>(null);

  const handleCreateCorrelation = () => {
    if (!sourceActivityId || !targetActivityId) {
      toast.error('Please select source and target activities');
      return;
    }
    onCreate({
      sourceActivityId,
      targetActivityId,
      rule,
      role,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Define Correlations</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Correlations View</DialogTitle>
        </DialogHeader>
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Create Correlation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Activity</label>
                <select
                  className="mt-1 block w-full bg-background pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) => setSourceActivityId(Number(e.target.value))}
                >
                  <option value="">Select activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Activity</label>
                <select
                  className="mt-1 block bg-background w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) => setTargetActivityId(Number(e.target.value))}
                >
                  <option value="">Select activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rule</label>
                <select
                  className="mt-1 block w-full bg-background pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={rule}
                  onChange={(e) => setRule(e.target.value as any)}
                >
                  <option value="REQUIRES">Requires</option>
                  <option value="EXCLUDES">Excludes</option>
                  <option value="ALL">All</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role (Optional)</label>
                <select
                  className="mt-1 block w-full bg-background pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={role || ''}
                  onChange={(e) => setRole(e.target.value ? (e.target.value as ParticipantRole) : null)}
                >
                  <option value="">All Roles</option>
                  <option value="MEMBRE_JUNIOR">Membre Junior</option>
                  <option value="MEMBRE_SENIOR">Membre Senior</option>
                  <option value="RESPONSABLE">Responsable</option>
                  <option value="QUARTET">Quartet</option>
                  <option value="CDM">CDM</option>
                  <option value="ALUMNUS">Alumnus</option>
                  <option value="ALUMNA">Alumna</option>
                  <option value="BUREAU_NATIONAL">Bureau National</option>
                  <option value="INTERNATIONAL_GUEST">International Guest</option>
                  <option value="OC">OC</option>
                </select>
              </div>
            </div>
            <Button onClick={handleCreateCorrelation} className="mt-4">
              Create
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Existing Correlations</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {correlations.map((corr) => (
                  <tr key={corr.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{corr.sourceActivity.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{corr.rule}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{corr.targetActivity.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{corr.role || 'All'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button variant="destructive" onClick={() => onDelete(corr.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}