'use client';

import { useEffect, useState } from 'react';
import { activityService, ActivityRules } from '@/lib/services/activity.service';
import { participantService } from '@/lib/services/participant.service';
import { Activity } from '@/types/activity.types';
import { ParticipantRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Save, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';

interface ProgramItem {
  id: number;
  activityId: number;
  activity: Activity;
}

export default function ProgramPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<number>>(new Set());
  const [rules, setRules] = useState<ActivityRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Ensure required first
      await activityService.ensureRequired();
      
      const [allActivities, program, profile] = await Promise.all([
        activityService.getActivities(),
        activityService.getMyProgram(),
        participantService.getParticipantProfile(),
      ]);
      
      const computedRules = activityService.organizeRules(allActivities, profile.role as any);
      setRules(computedRules);
      setActivities(allActivities);

      const initialSelected = new Set<number>(program.map((p: any) => p.activityId));
      
      // Enforce mandatory rules
      computedRules.mandatoryIds.forEach(id => initialSelected.add(id));
      
      setSelectedActivityIds(initialSelected);
      
    } catch (error) {
      toast.error('Échec du chargement des données du programme');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivity = (activity: Activity) => {
    if (!rules) return;

    const newSelected = new Set(selectedActivityIds);
    
    if (newSelected.has(activity.id)) {
      // Deselect
      // Check if required (simple check, backend does full check)
      if (activity.isRequired || rules.mandatoryIds.has(activity.id)) {
        toast.error('Impossible de désélectionner une activité obligatoire');
        return;
      }
      newSelected.delete(activity.id);

      // Deselect activities that require this one
      const toRemove = new Set<number>();
      newSelected.forEach(selectedId => {
        const deps = rules.dependencies.get(selectedId);
        if (deps?.required.includes(activity.id)) {
           toRemove.add(selectedId);
        }
      });
      
      if (toRemove.size > 0) {
         toRemove.forEach(id => newSelected.delete(id));
         toast.info(`${toRemove.size} activité(s) dépendante(s) désélectionnée(s)`);
      }

    } else {
      // Select
      if (rules.forbiddenIds.has(activity.id)) {
        toast.error('Cette activité n\'est pas disponible pour votre rôle');
        return;
      }

      // Enforce one per type logic locally for better UX
      // Find other selected activities of same type
      const othersOfType = activities.filter(a => 
        a.activityTypeId === activity.activityTypeId && 
        a.id !== activity.id &&
        newSelected.has(a.id)
      );
      
      othersOfType.forEach(other => {
        newSelected.delete(other.id);
      });
      
      newSelected.add(activity.id);

      // Handle dependencies
      const deps = rules.dependencies.get(activity.id);
      if (deps) {
        // Add required
        deps.required.forEach(reqId => {
           if (!newSelected.has(reqId)) {
             // Check if forbidden?
             if (rules.forbiddenIds.has(reqId)) {
               toast.warning(`L'activité requise (ID: ${reqId}) est interdite pour votre rôle.`);
             } else {
               newSelected.add(reqId);
               toast.info('Activité requise ajoutée automatiquement');
             }
           }
        });
        
        // Remove excluded
        deps.excluded.forEach(exId => {
          if (newSelected.has(exId)) {
            newSelected.delete(exId);
            toast.info('Activité incompatible retirée');
          }
        });
      }
    }
    
    setSelectedActivityIds(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await activityService.updateProgram(Array.from(selectedActivityIds));
      toast.success('Programme mis à jour avec succès');
      // Reload to get fresh state (e.g. auto-picks)
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Échec de l\'enregistrement du programme');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await activityService.downloadMyProgram();
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error('Échec du téléchargement du PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Group activities by type
  const activitiesByType = activities.reduce((acc, activity) => {
    const typeName = activity.activityType?.name || 'Autre';
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const sortedTypes = Object.keys(activitiesByType).sort();

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mon Programme</h1>
            <p className="text-muted-foreground">Sélectionnez vos activités pour l'événement.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} disabled={downloading} variant="outline" size="lg">
              {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Télécharger PDF
            </Button>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </div>

        {sortedTypes.map((typeName) => (
          <Card key={typeName} className="overflow-hidden border-2">
            <CardHeader className="text-xl text-center mx-auto w-1/2">
              <CardTitle>{typeName}</CardTitle>
              <CardDescription>{}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activitiesByType[typeName].map((activity) => {
                  const isSelected = selectedActivityIds.has(activity.id);
                  const capacityLeft = activity.capacityLeft ?? activity.capacity; // Fallback
                  
                  const isForbidden = rules?.forbiddenIds.has(activity.id);
                  const isMandatory = rules?.mandatoryIds.has(activity.id) || activity.isRequired;

                  return (
                    <div 
                      key={activity.id}
                      className={cn(
                        "border-2 rounded-xl p-4 transition-all relative hover:shadow-md",
                        isForbidden ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" : "cursor-pointer",
                        !isForbidden && isSelected 
                          ? "border-green-600 bg-primary/5 ring-1 ring-primary" 
                          : !isForbidden && "border-red-700 bg-card shadow-sm hover:border-green-500"
                      )}
                      onClick={() => !isForbidden && handleToggleActivity(activity)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold pr-8 leading-tight">{activity.name}</h3>
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Salle</span>
                          <span className="font-medium">{activity.salle?.name || 'TBA'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Places Restantes</span>
                          <span className={cn(
                            "font-bold",
                            capacityLeft < 10 ? "text-red-500" : "text-green-600"
                          )}>
                            {capacityLeft}
                          </span>
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 bg-muted/30 p-2 rounded-md">
                          {activity.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {isMandatory && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Obligatoire</Badge>
                        )}
                        {isForbidden && (
                          <Badge variant="destructive" className="text-xs">Non disponible</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Floating Save Button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden flex flex-col gap-2">
        <Button onClick={handleDownloadPDF} disabled={downloading} size="lg" variant="secondary" className="shadow-lg rounded-full h-14 w-14 p-0">
          {downloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg rounded-full h-14 w-14 p-0">
          {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
        </Button>
      </div>
    </ParticipantLayout>
  );
}
