'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { paymentService } from '@/lib/services/payment.service';

interface PaymentFailResult {
  success: boolean;
  message: string;
  errorMessage?: string;
  orderId?: string;
}

export default function PaymentFailPage() {
  const [result, setResult] = useState<PaymentFailResult | null>(null);
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

    handlePaymentFail(orderId);
  }, [searchParams, router]);

  const handlePaymentFail = async (orderId: string) => {
    try {
      const data = await paymentService.handlePaymentFail(orderId);
      setResult(data);
    } catch (error: any) {
      console.error('Payment fail handling error:', error);
      setResult({
        success: false,
        message: 'Payment processing failed',
        errorMessage: error.message,
        orderId,
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = () => {
    if (!result?.errorMessage) {
      return 'Your payment could not be processed. Please try again.';
    }

    // Common error messages and their user-friendly versions
    const errorMap: { [key: string]: string } = {
      'insufficient funds': 'Insufficient funds in your account. Please check your balance and try again.',
      'card declined': 'Your card was declined. Please check your card details or try a different payment method.',
      'expired card': 'Your card has expired. Please use a valid card.',
      'invalid card': 'Invalid card details. Please check your card information.',
      'timeout': 'The payment session timed out. Please try again.',
      'cancelled': 'Payment was cancelled by user.',
      'network error': 'Network connection issue. Please check your internet connection and try again.',
    };

    const errorKey = Object.keys(errorMap).find(key => 
      result.errorMessage?.toLowerCase().includes(key)
    );

    return errorKey ? errorMap[errorKey] : result.errorMessage;
  };

  const getErrorSolutions = () => {
    if (!result?.errorMessage) {
      return [
        'Check your internet connection',
        'Verify your card details are correct',
        'Ensure you have sufficient funds',
        'Try using a different browser',
      ];
    }

    const errorMessage = result.errorMessage?.toLowerCase() || '';

    if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
      return [
        'Check your account balance',
        'Try a different payment method',
        'Contact your bank if needed',
      ];
    }

    if (errorMessage.includes('declined') || errorMessage.includes('invalid')) {
      return [
        'Verify your card number, expiry date, and CVV',
        'Check if your card supports online transactions',
        'Try a different card',
        'Contact your bank to enable online payments',
      ];
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('session')) {
      return [
        'Try the payment again',
        'Ensure stable internet connection',
        'Complete payment faster next time',
      ];
    }

    if (errorMessage.includes('cancelled')) {
      return [
        'Start a new payment process',
        'Complete the payment without cancelling',
      ];
    }

    return [
      'Check your internet connection',
      'Verify your payment details',
      'Try again in a few minutes',
      'Contact support if the problem persists',
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment Result</h2>
          <p className="text-gray-600">Please wait while we check your payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
            <CardDescription className="text-red-700">
              Your payment could not be processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Error Details */}
              <div className="bg-white rounded-lg p-6 border border-red-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  What Happened?
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Error Message</span>
                    <p className="text-red-700 bg-red-50 p-3 rounded border border-red-200">
                      {getErrorMessage()}
                    </p>
                  </div>
                  {result?.orderId && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Order ID</span>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {result.orderId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Solutions */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-lg mb-4 text-blue-800">
                  How to Resolve This
                </h3>
                <ul className="space-y-2">
                  {getErrorSolutions().map((solution, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-blue-700">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Issues */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-semibold text-lg mb-4 text-yellow-800">
                  Common Payment Issues
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Card Issues</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Expired or invalid card</li>
                      <li>• Insufficient balance</li>
                      <li>• Card not enabled for online payments</li>
                      <li>• International transaction restrictions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Technical Issues</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Slow internet connection</li>
                      <li>• Browser compatibility</li>
                      <li>• Session timeout</li>
                      <li>• Payment gateway issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => router.push('/payment')}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Payment Again
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>

              {/* Support Note */}
              <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong>Still having trouble?</strong>
                </p>
                <p>
                  Contact our support team at{' '}
                  <a href="mailto:support@jobs2026.com" className="text-blue-600 hover:underline">
                    support@jobs2026.com
                  </a>
                  {' '}or call{' '}
                  <a href="tel:+21612345678" className="text-blue-600 hover:underline">
                    +216 12 345 678
                  </a>
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  Include your order ID ({result?.orderId}) when contacting support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
