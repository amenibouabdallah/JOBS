'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Receipt, AlertCircle } from 'lucide-react';
import { paymentService } from '@/lib/services/payment.service';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';

interface PaymentConfig {
  firstPayAmount: number;
  secondPayAmount: number;
  fullPayAmount: number;
  payStart: string;
  payDeadline: string;
  firstPayDeadline: string;
  fullPayQrCode?: string;
  firstPayQrCode?: string;
  secondPayQrCode?: string;
}

interface PaymentStatus {
  participant: any;
  hasFirstPayment: boolean;
  hasFullPayment: boolean;
  canPayFirst: boolean;
  canPaySecond: boolean;
  isFullyPaid: boolean;
}

export default function PaymentPage() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const [configData, statusData] = await Promise.all([
        paymentService.getPaymentConfig(),
        paymentService.getPaymentStatus(),
      ]);

      setConfig(configData);
      setStatus(statusData);
    } catch (error: any) {
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (paymentType: 'FIRST' | 'FULL', amount: number) => {
    setPaymentLoading(true);
    
    try {
      const data = await paymentService.initiatePayment(paymentType, amount);
      
      // Redirect to ClicToPay payment page
      window.location.href = data.formUrl;
    } catch (error: any) {
      toast.error(error.message || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPaymentPeriodActive = () => {
    if (!config) return false;
    const now = new Date();
    const start = new Date(config.payStart);
    const deadline = new Date(config.payDeadline);
    return now >= start && now <= deadline;
  };

  const isFirstPaymentDeadlineActive = () => {
    if (!config) return false;
    const now = new Date();
    const firstDeadline = new Date(config.firstPayDeadline);
    return now <= firstDeadline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config || !status) {
    return (
      <ParticipantLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Payment Information Unavailable</h2>
              <p className="text-gray-600">Unable to load payment configuration. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </ParticipantLayout>
    );
  }

  if (status.isFullyPaid) {
    return (
      <ParticipantLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Completed</CardTitle>
            <CardDescription>
              Your payment has been successfully processed. You are fully registered for the event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Full Payment Amount</span>
                  <p className="text-lg font-semibold">{config.fullPayAmount} DT</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Status</span>
                  <Badge variant="default" className="bg-green-500">
                    Fully Paid
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription>
              Choose your payment option for Jobs 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-500">Payment Period</span>
                <p className="font-semibold">
                  {formatDate(config.payStart)} - {formatDate(config.payDeadline)}
                </p>
                <Badge variant={isPaymentPeriodActive() ? "default" : "secondary"}>
                  {isPaymentPeriodActive() ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-500">First Payment Deadline</span>
                <p className="font-semibold">{formatDate(config.firstPayDeadline)}</p>
                <Badge variant={isFirstPaymentDeadlineActive() ? "default" : "destructive"}>
                  {isFirstPaymentDeadlineActive() ? "Available" : "Expired"}
                </Badge>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-500">Your Status</span>
                <p className="font-semibold">
                  {status.hasFirstPayment ? "First Payment Made" : "No Payment"}
                </p>
                <Badge variant={status.hasFirstPayment ? "default" : "outline"}>
                  {status.hasFirstPayment ? "Partial" : "Pending"}
                </Badge>
              </div>
            </div>

            {!isPaymentPeriodActive() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    Payment period is not currently active
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Payment Option */}
              <Card className={`border-2 ${status.canPayFirst ? 'border-blue-200' : 'border-gray-200 opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    First Payment
                  </CardTitle>
                  <CardDescription>
                    Pay a partial amount now and complete later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {config.firstPayAmount} DT
                      </span>
                      <p className="text-sm text-gray-500">
                        + {config.secondPayAmount} DT later
                      </p>
                    </div>
                    {config.firstPayQrCode && (
                      <div className="flex justify-center">
                        <img 
                          src={config.firstPayQrCode} 
                          alt="First Payment QR Code" 
                          className="w-48 h-48 object-contain border-2 border-blue-200 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <div className="text-center text-sm text-gray-600">
                      Scan the QR code to complete first payment
                    </div>
                    {!status.canPayFirst && status.hasFirstPayment && (
                      <p className="text-sm text-green-600 text-center">
                        ✓ First payment completed
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Full Payment Option */}
              <Card className={`border-2 ${!status.hasFirstPayment ? 'border-green-200' : 'border-gray-200 opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Full Payment
                  </CardTitle>
                  <CardDescription>
                    Pay the complete amount at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-green-600">
                        {config.fullPayAmount} DT
                      </span>
                      <p className="text-sm text-gray-500">
                        Complete registration
                      </p>
                    </div>
                    {config.fullPayQrCode && !status.hasFirstPayment && (
                      <div className="flex justify-center">
                        <img 
                          src={config.fullPayQrCode} 
                          alt="Full Payment QR Code" 
                          className="w-48 h-48 object-contain border-2 border-green-200 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <div className="text-center text-sm text-gray-600">
                      {!status.hasFirstPayment ? 'Scan the QR code to complete full payment' : 'Full payment not available after partial payment'}
                    </div>
                    {status.hasFirstPayment && (
                      <p className="text-sm text-yellow-600 text-center">
                        Cannot pay full amount after partial payment
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Payment Option (shown only if first payment is made) */}
            {status.hasFirstPayment && status.canPaySecond && (
              <Card className="border-2 border-orange-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Complete Payment
                  </CardTitle>
                  <CardDescription>
                    Pay the remaining amount to complete your registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-orange-600">
                        {config.secondPayAmount} DT
                      </span>
                      <p className="text-sm text-gray-500">
                        Remaining amount
                      </p>
                    </div>
                    {config.secondPayQrCode && (
                      <div className="flex justify-center">
                        <img 
                          src={config.secondPayQrCode} 
                          alt="Second Payment QR Code" 
                          className="w-48 h-48 object-contain border-2 border-orange-200 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <div className="text-center text-sm text-gray-600">
                      Scan the QR code to complete remaining payment
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ParticipantLayout>
  );
}
