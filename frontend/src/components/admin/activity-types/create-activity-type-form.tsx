import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Day } from '@/types/activity-type.types';

interface CreateActivityTypeFormProps {
  onCreate: (name: string, earliestTime: Date, latestTime: Date, day: Day) => Promise<void>;
}

export const CreateActivityTypeForm: React.FC<CreateActivityTypeFormProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [earliestTime, setEarliestTime] = useState('');
  const [latestTime, setLatestTime] = useState('');
  const [day, setDay] = useState<Day>(Day.J_1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onCreate(name, new Date(`2000-01-01T${earliestTime}:00`), new Date(`2000-01-01T${latestTime}:00`), day);
    setName('');
    setEarliestTime('');
    setLatestTime('');
    setDay(Day.J_1);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Create Type</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-4 gap-3">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <Input
          type="time"
          placeholder="Earliest Time"
          value={earliestTime}
          onChange={(e) => setEarliestTime(e.target.value)}
          disabled={loading}
        />
        <Input
          type="time"
          placeholder="Latest Time"
          value={latestTime}
          onChange={(e) => setLatestTime(e.target.value)}
          disabled={loading}
        />
        <select
          className="border rounded px-2 py-2"
          value={day}
          onChange={(e) => setDay(e.target.value as Day)}
          disabled={loading}
        >
          <option value={Day.J_1}>J_1</option>
          <option value={Day.J_2}>J_2</option>
        </select>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white col-span-4"
          onClick={handleSubmit}
          disabled={loading || !name || !earliestTime || !latestTime}
        >
          Create
        </Button>
      </CardContent>
    </Card>
  );
};