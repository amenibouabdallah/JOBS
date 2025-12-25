'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Jobs } from "@/types/jobs.types";
import { useState, useEffect } from "react";
import { Upload, X, Calendar, DollarSign, Users, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

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
  const [qrPreviews, setQrPreviews] = useState<{
    full?: string;
    first?: string;
    second?: string;
  }>({});
  const [uploading, setUploading] = useState<string | null>(null);

  // Initialize previews when editing
  useEffect(() => {
    if (isEditing) {
      setQrPreviews({
        full: form.fullPayQrCode,
        first: form.firstPayQrCode,
        second: form.secondPayQrCode,
      });
    }
  }, [isEditing, form.fullPayQrCode, form.firstPayQrCode, form.secondPayQrCode]);

  const handleQrCodeUpload = async (file: File, type: 'full' | 'first' | 'second') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3020'}/uploads/file?destination=qrcodes`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Update form with the QR code URL
      const updatedForm = { ...form };
      if (type === 'full') {
        updatedForm.fullPayQrCode = imageUrl;
      } else if (type === 'first') {
        updatedForm.firstPayQrCode = imageUrl;
      } else if (type === 'second') {
        updatedForm.secondPayQrCode = imageUrl;
      }
      setForm(updatedForm);

      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);

      toast.success('QR code uploaded successfully');
    } catch (error) {
      console.error('QR code upload failed:', error);
      toast.error('QR code upload failed');
    } finally {
      setUploading(null);
    }
  };

  const removeQrCode = (type: 'full' | 'first' | 'second') => {
    const updatedForm = { ...form };
    if (type === 'full') {
      updatedForm.fullPayQrCode = undefined;
    } else if (type === 'first') {
      updatedForm.firstPayQrCode = undefined;
    } else if (type === 'second') {
      updatedForm.secondPayQrCode = undefined;
    }
    setForm(updatedForm);
    setQrPreviews(prev => ({ ...prev, [type]: undefined }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-900 to-blue-700 text-white justify-center align-center">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calendar className="w-6 h-6 text-red-600" />
          {isEditing ? 'Edit Job' : 'Create New Job'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            Basic Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
              <Input 
                id="title"
                placeholder="Enter job title" 
                value={form.title || ''} 
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Input 
                id="description"
                placeholder="Enter job description" 
                value={form.description || ''} 
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
          </div>
        </div>

        {/* Date Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Calendar className="w-5 h-5 text-red-600" />
            Schedule & Deadlines
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
              <Input 
                id="startDate"
                type="datetime-local" 
                value={formatDateForInput(form.startDate)} 
                onChange={(e) => setForm({ ...form, startDate: new Date(e.target.value) })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionDeadline" className="text-sm font-medium">Subscription Deadline</Label>
              <Input 
                id="subscriptionDeadline"
                type="datetime-local" 
                value={formatDateForInput(form.subscriptionDeadline)} 
                onChange={(e) => setForm({ ...form, subscriptionDeadline: new Date(e.target.value) })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payStart" className="text-sm font-medium">Payment Start *</Label>
              <Input 
                id="payStart"
                type="datetime-local" 
                value={formatDateForInput(form.payStart)} 
                onChange={(e) => setForm({ ...form, payStart: new Date(e.target.value) })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payDeadline" className="text-sm font-medium">Payment Deadline *</Label>
              <Input 
                id="payDeadline"
                type="datetime-local" 
                value={formatDateForInput(form.payDeadline)} 
                onChange={(e) => setForm({ ...form, payDeadline: new Date(e.target.value) })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstPayDeadline" className="text-sm font-medium">First Payment Deadline</Label>
              <Input 
                id="firstPayDeadline"
                type="datetime-local" 
                value={formatDateForInput(form.firstPayDeadline)} 
                onChange={(e) => setForm({ ...form, firstPayDeadline: new Date(e.target.value) })}
                className="focus:ring-2 focus:ring-red-500" 
              />
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Payment Details
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payAmount" className="text-sm font-medium">Full Payment Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  id="payAmount"
                  type="number" 
                  placeholder="0.00" 
                  value={form.PayAmount || 0} 
                  onChange={(e) => setForm({ ...form, PayAmount: Number(e.target.value) })}
                  className="pl-10 focus:ring-2 focus:ring-red-500" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstPayAmount" className="text-sm font-medium">First Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  id="firstPayAmount"
                  type="number" 
                  placeholder="0.00" 
                  value={form.firstPayAmount || 0} 
                  onChange={(e) => setForm({ ...form, firstPayAmount: Number(e.target.value) })}
                  className="pl-10 focus:ring-2 focus:ring-red-500" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondPayAmount" className="text-sm font-medium">Second Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  id="secondPayAmount"
                  type="number" 
                  placeholder="0.00" 
                  value={form.secondPayAmount || 0} 
                  onChange={(e) => setForm({ ...form, secondPayAmount: Number(e.target.value) })}
                  className="pl-10 focus:ring-2 focus:ring-red-500" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* QR Codes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            Payment QR Codes
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Full Payment QR Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Payment QR Code</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                {(qrPreviews.full || form.fullPayQrCode) ? (
                  <div className="relative">
                    <img 
                      src={qrPreviews.full || form.fullPayQrCode} 
                      alt="Full Payment QR" 
                      className="w-full h-40 object-contain rounded border" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeQrCode('full')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload QR Code</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleQrCodeUpload(e.target.files[0], 'full')}
                      disabled={uploading === 'full'}
                    />
                  </label>
                )}
                {uploading === 'full' && (
                  <div className="text-xs text-center text-gray-500 mt-2">Uploading...</div>
                )}
              </div>
            </div>

            {/* First Payment QR Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Payment QR Code</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                {(qrPreviews.first || form.firstPayQrCode) ? (
                  <div className="relative">
                    <img 
                      src={qrPreviews.first || form.firstPayQrCode} 
                      alt="First Payment QR" 
                      className="w-full h-40 object-contain rounded border" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeQrCode('first')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload QR Code</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleQrCodeUpload(e.target.files[0], 'first')}
                      disabled={uploading === 'first'}
                    />
                  </label>
                )}
                {uploading === 'first' && (
                  <div className="text-xs text-center text-gray-500 mt-2">Uploading...</div>
                )}
              </div>
            </div>

            {/* Second Payment QR Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Second Payment QR Code</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                {(qrPreviews.second || form.secondPayQrCode) ? (
                  <div className="relative">
                    <img 
                      src={qrPreviews.second || form.secondPayQrCode} 
                      alt="Second Payment QR" 
                      className="w-full h-40 object-contain rounded border" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeQrCode('second')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload QR Code</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleQrCodeUpload(e.target.files[0], 'second')}
                      disabled={uploading === 'second'}
                    />
                  </label>
                )}
                {uploading === 'second' && (
                  <div className="text-xs text-center text-gray-500 mt-2">Uploading...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Users className="w-5 h-5 text-red-600" />
            Additional Settings
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nbrParticipants" className="text-sm font-medium">Number of Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  id="nbrParticipants"
                  type="number" 
                  placeholder="0" 
                  value={form.nbrParticipants || 0} 
                  onChange={(e) => setForm({ ...form, nbrParticipants: Number(e.target.value) })}
                  className="pl-10 focus:ring-2 focus:ring-red-500" 
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-8">
              <input 
                type="checkbox" 
                id="isActive"
                checked={form.isActive || false} 
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500" 
              />
              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Job is Active
              </Label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 font-medium shadow-md hover:shadow-lg transition-all" 
            onClick={onSubmit}
          >
            {isEditing ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
