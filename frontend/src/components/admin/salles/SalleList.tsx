"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Salle } from "@/types/salle.types";

interface Props {
  salles: Salle[];
  remove: (id: number) => void;
}

export function SalleList({ salles, remove }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {salles.map((s) => (
        <Card key={s.id}>
          <CardHeader><CardTitle>{s.name}</CardTitle></CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Cap: {s.capacity} • {s.type}</div>
            <Button variant="outline" onClick={() => remove(s.id)}>Delete</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}