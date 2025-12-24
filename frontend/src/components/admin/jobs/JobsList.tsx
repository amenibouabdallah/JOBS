"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Jobs } from "@/types/jobs.types";

interface Props {
  jobs: Jobs[];
  onEdit: (job: Jobs) => void;
  onDelete: (id: number) => void;
}

export function JobsList({ jobs, onEdit, onDelete }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {jobs.map((j) => (
        <Card key={j.id}>
          <CardHeader><CardTitle>{j.title}</CardTitle></CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{j.description}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(j)}>Edit</Button>
              <Button variant="destructive" onClick={() => onDelete(j.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}