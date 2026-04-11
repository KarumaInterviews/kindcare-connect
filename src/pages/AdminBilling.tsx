import { useState, useEffect } from 'react';
import { billingApi, adminApi, type Invoice, type Payment, type BillingSummary, type AuditLog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, TrendingUp, DollarSign, Clock, AlertCircle, Receipt, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColor: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  waived: 'bg-purple-100 text-purple-700',
};

const payStatusColor: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const AdminBilling = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      billingApi.summary(),
      billingApi.listInvoices({ limit: 100 }),
      billingApi.listPayments({ limit: 100 }),
      adminApi.auditLogs({ limit: 100 }),
    ]).then(([sum, invRes, payRes, auditRes]) => {
      setSummary(sum);
      setInvoices(invRes.data ?? []);
      setPayments(payRes.data ?? []);
      setAuditLogs(auditRes.data ?? []);
    }).catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  const statCards = [
    { icon: TrendingUp, label: 'Total Revenue', value: `KES ${Number(summary?.totalRevenue ?? 0).toLocaleString()}`, color: 'text-success', sub: 'All time' },
    { icon: DollarSign, label: 'This Month', value: `KES ${Number(summary?.monthRevenue ?? 0).toLocaleString()}`, color: 'text-primary', sub: 'Current month' },
    { icon: Clock, label: 'Outstanding', value: `KES ${Number(summary?.pendingAmount ?? 0).toLocaleString()}`, color: 'text-warning', sub: `${summary?.unpaidInvoices ?? 0} unpaid` },
    { icon: AlertCircle, label: 'Overdue', value: String(summary?.overdueInvoices ?? 0), color: 'text-destructive', sub: 'invoices' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Billing & Revenue</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Invoices progress */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground mb-3">Invoice Overview</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-medium text-foreground">{summary?.paidInvoices ?? 0}</span> paid of{' '}
            <span className="font-medium text-foreground">{summary?.totalInvoices ?? 0}</span> total
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${summary?.totalInvoices ? (summary.paidInvoices / summary.totalInvoices) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{summary?.totalInvoices ? Math.round((summary.paidInvoices / summary.totalInvoices) * 100) : 0}% collected</span>
            <span>{summary?.unpaidInvoices ?? 0} remaining</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices">
        <TabsList className="w-full">
          <TabsTrigger value="invoices" className="flex-1">Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
          <TabsTrigger value="audit" className="flex-1">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Invoices tab */}
        <TabsContent value="invoices" className="mt-4 space-y-3">
          {invoices.map(inv => {
            const childName = inv.child ? `${inv.child.firstName} ${inv.child.lastName}` : `Patient #${inv.childId}`;
            const doctorName = inv.doctor?.user
              ? `Dr. ${inv.doctor.user.firstName} ${inv.doctor.user.lastName}`
              : `Doctor #${inv.doctorId}`;
            return (
              <Card key={inv.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{childName} · {doctorName}</p>
                      <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">KES {Number(inv.totalAmount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {invoices.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No invoices found</p>}
        </TabsContent>

        {/* Payments tab */}
        <TabsContent value="payments" className="mt-4 space-y-3">
          {payments.map(pmt => (
            <Card key={pmt.id} className="shadow-card">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{pmt.method?.toUpperCase()} · {pmt.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {pmt.invoice?.invoiceNumber ?? `Invoice #${pmt.invoiceId}`}
                      {pmt.paidAt ? ` · ${new Date(pmt.paidAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">KES {Number(pmt.amount).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payStatusColor[pmt.status] ?? ''}`}>{pmt.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {payments.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No payments found</p>}
        </TabsContent>

        {/* Audit logs tab */}
        <TabsContent value="audit" className="mt-4 space-y-2">
          {auditLogs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
              <Card className="shadow-card">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-xs">{log.action}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{log.resource}</span>
                      {log.resourceId && <span className="text-xs text-muted-foreground">#{log.resourceId}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.role})` : 'System'}
                      {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {auditLogs.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No audit logs found</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBilling;
