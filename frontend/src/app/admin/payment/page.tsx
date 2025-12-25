'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download, 
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface PaymentRecord {
  id: number;
  firstName: string;
  lastName: string;
  cin: string;
  paymentDate: Date;
  amount: number;
  paymentType: 'FIRST' | 'FULL' | 'SECOND';
  status: 'completed' | 'pending' | 'failed';
}

// Generate fake payment data
const generateFakeData = (): PaymentRecord[] => {
  const firstNames = ['Ahmed', 'Mohamed', 'Fatima', 'Sarah', 'Youssef', 'Mariem', 'Karim', 'Ines', 'Ali', 'Nour', 'Amine', 'Leila', 'Sami', 'Asma', 'Omar', 'Salma', 'Fares', 'Amira', 'Rami', 'Dalia'];
  const lastNames = ['Ben Ali', 'Trabelsi', 'Hamdi', 'Sassi', 'Gharbi', 'Bouazizi', 'Jemaa', 'Khelifi', 'Mansouri', 'Slimani', 'Melliti', 'Oueslati', 'Chaari', 'Najjar', 'Lahmar', 'Guesmi', 'Bouzid', 'Tlili'];
  const paymentTypes: ('FIRST' | 'FULL' | 'SECOND')[] = ['FIRST', 'FULL', 'SECOND'];
  const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed'];

  const data: PaymentRecord[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const cin = String(Math.floor(10000000 + Math.random() * 90000000)); // 8 digits
    const daysAgo = Math.floor(Math.random() * 30);
    const paymentDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let amount = 0;
    if (paymentType === 'FIRST') amount = 150;
    else if (paymentType === 'SECOND') amount = 100;
    else amount = 200;

    data.push({
      id: i + 1,
      firstName,
      lastName,
      cin,
      paymentDate,
      amount,
      paymentType,
      status
    });
  }

  return data.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
};

export default function AdminPaymentPage() {
  const [payments] = useState<PaymentRecord[]>(generateFakeData());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Calculate analytics
  const analytics = useMemo(() => {
    const completed = payments.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const totalParticipants = new Set(payments.map(p => p.cin)).size;
    const averagePayment = completed.length > 0 ? totalRevenue / completed.length : 0;
    const completedCount = completed.length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;

    return {
      totalRevenue,
      totalParticipants,
      averagePayment,
      completedCount,
      pendingCount,
      totalPayments: payments.length
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = 
        payment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.cin.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesType = filterType === 'all' || payment.paymentType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchTerm, filterStatus, filterType]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'CIN', 'Payment Date', 'Amount', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => 
        [p.firstName, p.lastName, p.cin, formatDate(p.paymentDate), p.amount, p.paymentType, p.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      FIRST: 'bg-blue-100 text-blue-800 border-blue-200',
      SECOND: 'bg-orange-100 text-orange-800 border-orange-200',
      FULL: 'bg-green-100 text-green-800 border-green-200'
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    );
  };

  return (
    <AdminLayout>
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Analytics</h1>
          <p className="text-muted-foreground">Monitor and analyze all payment transactions</p>
        </div>
        <Button onClick={exportToCSV} className="bg-red-600 hover:bg-red-700">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)} DT</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.completedCount} completed payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Unique participants who paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averagePayment.toFixed(2)} DT</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all payment records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or CIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="FIRST">First Payment</option>
              <option value="SECOND">Second Payment</option>
              <option value="FULL">Full Payment</option>
            </select>
          </div>

          {/* Payment Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CIN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                              {payment.firstName[0]}{payment.lastName[0]}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.firstName} {payment.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{payment.cin}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDate(payment.paymentDate)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getTypeBadge(payment.paymentType)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                            {payment.amount.toFixed(2)} DT
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredPayments.length}</span> of{' '}
              <span className="font-medium">{payments.length}</span> payments
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">
                  {analytics.completedCount} Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">
                  {analytics.pendingCount} Pending
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}
