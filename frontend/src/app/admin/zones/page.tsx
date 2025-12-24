'use client';

import { useState, useEffect } from 'react';
import { zoneService, Zone } from '@/lib/services/zone.service';
import { jeService } from '@/lib/services/je.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function ZoningPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [jes, setJes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJeId, setSelectedJeId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [zonesData, jesData] = await Promise.all([
        zoneService.getAll(),
        jeService.getAllJes()
      ]);
      setZones(zonesData);
      setJes(jesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateZones = async () => {
    try {
      await zoneService.generate(20); // Generate 20 zones (A-J pairs)
      fetchData();
      toast.success('Zones generated successfully');
    } catch (error) {
      toast.error('Failed to generate zones');
    }
  };

  const handleZoneClick = async (zone: Zone) => {
    try {
      const details = await zoneService.getOne(zone.id);
      setSelectedZone(details);
      // If zone has a JE, set it as selected
      if (details.jes && details.jes.length > 0) {
        setSelectedJeId(details.jes[0].id.toString());
      } else {
        setSelectedJeId('');
      }
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch zone details');
    }
  };

  const handleAssignJe = async () => {
    if (!selectedZone || !selectedJeId) return;
    try {
      await zoneService.assignJe(selectedZone.id, parseInt(selectedJeId));
      toast.success('JE assigned successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign JE');
    }
  };

  const handleExport = async () => {
    try {
      const data = await zoneService.exportData();
      
      // Convert to CSV
      const headers = ['First Name', 'Last Name', 'Place', 'JE', 'Zone'];
      const csvContent = [
        headers.join(','),
        ...data.map((p: any) => [
          p.firstName,
          p.lastName,
          p.placeName,
          p.je?.name,
          p.je?.reservedZone?.name
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zoning-export.csv';
      a.click();
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion du Zoning</h1>
        <div className="space-x-4">
          <Button onClick={handleGenerateZones}>Générer les Zones</Button>
          <Button variant="outline" onClick={handleExport}>Exporter CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {zones.map((zone) => (
          <Card 
            key={zone.id} 
            className={`cursor-pointer hover:border-blue-500 transition-colors ${
              zone.jes.length > 0 ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleZoneClick(zone)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-center text-xl text-gray-700">{zone.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-center">
              {zone.jes.length > 0 ? (
                <div className="text-sm font-medium text-blue-700">
                  {zone.jes[0].name}
                  <div className="text-xs text-blue-500 mt-1">
                    {zone.jes[0]._count.participants} participants
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Libre</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Zone {selectedZone?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Junior Entreprise</label>
                <Select value={selectedJeId} onValueChange={setSelectedJeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une JE" />
                  </SelectTrigger>
                  <SelectContent>
                    {jes.map((je) => (
                      <SelectItem key={je.id} value={je.id.toString()}>
                        {je.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignJe}>Assigner</Button>
            </div>

            {selectedZone?.jes && selectedZone.jes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Participants ({selectedZone.jes[0].participants?.length || 0})</h3>
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                  {selectedZone.jes[0].participants?.map((p: any) => (
                    <div 
                      key={p.id} 
                      className={`p-2 rounded text-sm border ${
                        p.placeName ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-700">{p.firstName} {p.lastName}</div>
                      <div className="text-xs text-gray-500">
                        {p.placeName || 'Non placé'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
