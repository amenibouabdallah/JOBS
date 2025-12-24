
'use client';

import { useState } from 'react';
import { jeService } from '@/lib/services/je.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PaymentSheetUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);

    try {
      await jeService.uploadPaymentSheet(file);
      toast.success('Fiche de paiement téléversée avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du téléversement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Téléverser une fiche de paiement</CardTitle>
        <CardDescription>Le fichier doit être au format CSV ou Excel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" onChange={handleFileChange} />
        <Button
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Téléversement...' : 'Téléverser'}
        </Button>
      </CardContent>
    </Card>
  );
}
