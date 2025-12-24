'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Receipt, ArrowRight, Loader2 } from 'lucide-react';
import { paymentService } from '@/lib/services/payment.service';

interface PaymentResult {
  success: boolean;
  message: string;
  documentReference?: string;
  paymentType?: 'FIRST' | 'FULL';
  amount?: number;
  orderId?: string;
}

export default function PaymentSuccessPage() {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      toast.error('No order ID provided');
      router.push('/payment');
      return;
    }

    handlePaymentSuccess(orderId);
  }, [searchParams, router]);

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      const data = await paymentService.handlePaymentSuccess(orderId);
      setResult(data);
      
      toast.success(`Payment successful! Your ${data.paymentType === 'FIRST' ? 'first' : 'full'} payment has been processed.`);
    } catch (error: any) {
      console.error('Payment success handling error:', error);
      toast.error(error.message || 'Payment verification failed');
      
      // Redirect to fail page or payment page
      router.push('/payment/fail?orderId=' + orderId);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Payment Verification Failed</h2>
              <p className="text-gray-600 mb-4">Unable to verify your payment. Please contact support.</p>
              <Button onClick={() => router.push('/payment')}>
                Return to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription className="text-green-700">
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Order ID</span>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {result.orderId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Amount Paid</span>
                    <p className="text-lg font-semibold text-green-600">
                      {result.amount} DT
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Type</span>
                    <p className="font-semibold">
                      {result.paymentType === 'FIRST' ? 'First Payment' : 'Full Payment'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Document Reference</span>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {result.documentReference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 text-blue-800">
                  What's Next?
                </h3>
                {result.paymentType === 'FIRST' ? (
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">First Payment Complete</p>
                        <p className="text-sm text-blue-600">
                          You have successfully made your first payment. You can now complete your registration with the second payment.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-semibold text-yellow-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Complete Payment Later</p>
                        <p className="text-sm text-blue-600">
                          Remember to complete your second payment before the deadline to secure your participation.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Registration Complete</p>
                        <p className="text-sm text-blue-600">
                          Congratulations! Your payment is complete and you are now fully registered for Jobs 2026.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Check Your Email</p>
                        <p className="text-sm text-blue-600">
                          You will receive a confirmation email with your participation details and next steps.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {result.paymentType === 'FIRST' && (
                  <Button 
                    onClick={() => router.push('/payment')}
                    variant="outline"
                    className="flex-1"
                  >
                    Complete Payment
                  </Button>
                )}
              </div>

              {/* Support Note */}
              <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p>
                  If you have any questions about your payment or registration, 
                  please contact our support team at{' '}
                  <a href="mailto:support@jobs2026.com" className="text-blue-600 hover:underline">
                    support@jobs2026.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
