import { useState, useEffect, useRef } from 'react';
import { billingApi, type Invoice, type Payment, type CreatePaymentPayload } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Receipt, CreditCard, Phone, Building2, Banknote, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Status helpers ──────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  waived: 'bg-purple-100 text-purple-700',
  draft: 'bg-yellow-100 text-yellow-700',
};

const paymentStatusColor: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const methodIcon: Record<string, React.ElementType> = {
  mpesa: Phone,
  card: CreditCard,
  cash: Banknote,
  insurance: Building2,
  bank_transfer: Building2,
};

// ── Invoice PDF-printable view ───────────────────────────────────────────────
const InvoicePrintView = ({ invoice }: { invoice: Invoice }) => {
  const childName = invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : `Patient #${invoice.childId}`;
  const doctorName = invoice.doctor?.user
    ? `Dr. ${invoice.doctor.user.firstName} ${invoice.doctor.user.lastName}`
    : `Doctor #${invoice.doctorId}`;

  return (
    <div id="invoice-print" className="bg-white p-8 font-sans text-sm max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0096D6]">Gertrude's Children's Hospital</h1>
          <p className="text-gray-500 text-xs mt-1">Nairobi, Kenya · info@gertrudeshospital.org</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">INVOICE</p>
          <p className="text-xs text-gray-500">{invoice.invoiceNumber}</p>
          <Badge className={`mt-1 text-xs ${statusColor[invoice.status] ?? ''}`}>{invoice.status.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Bill to */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Patient</p>
          <p className="font-medium text-gray-800">{childName}</p>
          <p className="text-gray-500 text-xs">Attended by: {doctorName}</p>
          <p className="text-gray-500 text-xs">{invoice.doctor?.specialty?.replace(/_/g, ' ')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Invoice Details</p>
          <p className="text-gray-600 text-xs">Issue Date: <span className="text-gray-800">{invoice.issueDate}</span></p>
          <p className="text-gray-600 text-xs">Due Date: <span className="text-gray-800">{invoice.dueDate}</span></p>
          {invoice.paidAt && <p className="text-green-600 text-xs mt-1">Paid: {new Date(invoice.paidAt).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Line items */}
      <table className="w-full mb-4 text-sm">
        <thead className="bg-gray-50 border-y">
          <tr>
            <th className="text-left p-2 text-gray-500 font-medium">Description</th>
            <th className="text-right p-2 text-gray-500 font-medium">Qty</th>
            <th className="text-right p-2 text-gray-500 font-medium">Unit Price</th>
            <th className="text-right p-2 text-gray-500 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {(typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems) : invoice.lineItems ?? []).map((item, i) => (
            <tr key={i} className="border-b">
              <td className="p-2 text-gray-800">{item.description}</td>
              <td className="p-2 text-right text-gray-600">{item.quantity}</td>
              <td className="p-2 text-right text-gray-600">{Number(item.unitPrice).toLocaleString()}</td>
              <td className="p-2 text-right font-medium text-gray-800">{Number(item.total).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-56 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>KES {Number(invoice.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>VAT ({invoice.taxRate}%)</span>
            <span>KES {Number(invoice.taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t pt-1">
            <span>Total</span>
            <span>KES {Number(invoice.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment records */}
      {(invoice.payments ?? []).length > 0 && (
        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Payment Records</p>
          {invoice.payments!.map(p => (
            <div key={p.id} className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{p.method?.toUpperCase()} — {p.reference}</span>
              <span className="font-medium text-green-600">KES {Number(p.amount).toLocaleString()} · {p.status}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-8">Thank you for trusting Gertrude's Children's Hospital with your child's care.</p>
    </div>
  );
};

// ── Payment Modal ──────────────────────────────────────────────────────────────
const PaymentModal = ({
  invoice, open, onClose, onSuccess,
}: { invoice: Invoice; open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [method, setMethod] = useState<'mpesa' | 'card' | 'cash' | 'insurance' | 'bank_transfer'>('mpesa');
  const [phone, setPhone] = useState('');
  const [card4, setCard4] = useState('');
  const [insurer, setInsurer] = useState('');
  const [policyNo, setPolicyNo] = useState('');
  const [paying, setPaying] = useState(false);
  const [pollingId, setPollingId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePay = async () => {
    setPaying(true);
    setPaymentStatus('processing');
    try {
      const payload: CreatePaymentPayload = { invoiceId: invoice.id, method };
      if (method === 'mpesa') payload.phoneNumber = phone;
      if (method === 'card') payload.cardLast4 = card4;
      if (method === 'insurance') { payload.insuranceProvider = insurer; payload.insurancePolicyNumber = policyNo; }

      const res = await billingApi.createPayment(payload);
      setPollingId(res.paymentId);
      toast.info(method === 'mpesa' ? `STK Push sent to ${phone}. Approve on your phone.` : 'Processing payment…');

      // Poll for status every 2 seconds
      let attempts = 0;
      intervalRef.current = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await billingApi.getPaymentStatus(res.paymentId);
          if (statusRes.status === 'completed') {
            clearInterval(intervalRef.current!);
            setPaymentStatus('completed');
            toast.success('Payment successful!');
            onSuccess();
          } else if (statusRes.status === 'failed') {
            clearInterval(intervalRef.current!);
            setPaymentStatus('failed');
            toast.error(`Payment failed: ${statusRes.failureReason ?? 'Unknown error'}`);
          } else if (attempts >= 10) {
            clearInterval(intervalRef.current!);
            setPaymentStatus('failed');
            toast.error('Payment timed out. Please try again.');
          }
        } catch { /* continue polling */ }
      }, 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Payment failed';
      toast.error(msg);
      setPaymentStatus('failed');
      setPaying(false);
    }
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPaymentStatus('idle');
    setPaying(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        {paymentStatus === 'completed' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-foreground">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">KES {Number(invoice.totalAmount).toLocaleString()} paid via {method.toUpperCase()}</p>
            <Button onClick={handleClose} className="mt-4">Close</Button>
          </motion.div>
        ) : paymentStatus === 'processing' ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-3" />
            <p className="font-medium text-foreground">Processing payment…</p>
            <p className="text-sm text-muted-foreground mt-1">
              {method === 'mpesa' ? 'Waiting for M-Pesa confirmation…' : 'Authorizing transaction…'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">KES {Number(invoice.totalAmount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>

            {/* Method selection */}
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['mpesa', 'card', 'cash', 'insurance'] as const).map(m => {
                  const Icon = methodIcon[m];
                  return (
                    <Button
                      key={m}
                      variant={method === m ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2 justify-start"
                      onClick={() => setMethod(m)}
                    >
                      <Icon className="w-4 h-4" />
                      {m === 'mpesa' ? 'M-Pesa' : m === 'card' ? 'Card' : m === 'cash' ? 'Cash' : 'Insurance'}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Method-specific fields */}
            {method === 'mpesa' && (
              <div>
                <Label>M-Pesa Phone Number</Label>
                <Input placeholder="e.g. 0712345678" value={phone} onChange={e => setPhone(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">An STK push will be sent to this number</p>
              </div>
            )}
            {method === 'card' && (
              <div>
                <Label>Last 4 digits of card</Label>
                <Input placeholder="e.g. 4242" maxLength={4} value={card4} onChange={e => setCard4(e.target.value)} />
              </div>
            )}
            {method === 'insurance' && (
              <div className="space-y-2">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input placeholder="e.g. AAR, NHIF, Jubilee" value={insurer} onChange={e => setInsurer(e.target.value)} />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input placeholder="Policy number" value={policyNo} onChange={e => setPolicyNo(e.target.value)} />
                </div>
              </div>
            )}
            {method === 'cash' && (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-lg p-3">
                Please pay KES {Number(invoice.totalAmount).toLocaleString()} at the hospital cashier and present this invoice number: <strong>{invoice.invoiceNumber}</strong>
              </div>
            )}

            <Button
              onClick={handlePay}
              className="w-full"
              disabled={paying || (method === 'mpesa' && !phone) || (method === 'card' && card4.length !== 4)}
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              Pay KES {Number(invoice.totalAmount).toLocaleString()}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Main Billing page ─────────────────────────────────────────────────────────
const Billing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const load = async () => {
    try {
      const [invRes, payRes] = await Promise.all([
        billingApi.listInvoices({ limit: 50 }),
        billingApi.listPayments({ limit: 50 }),
      ]);
      setInvoices(invRes.data ?? []);
      setPayments(payRes.data ?? []);
    } catch { toast.error('Failed to load billing data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePaymentSuccess = () => {
    setPayModal(false);
    load();
  };

  const handlePrint = () => {
    window.print();
  };

  const outstanding = invoices.filter(i => i.status === 'issued' || i.status === 'overdue');
  const paid = invoices.filter(i => i.status === 'paid');
  const totalOwed = outstanding.reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalPaid = paid.reduce((s, i) => s + Number(i.totalAmount), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Billing & Payments</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-xl font-bold text-foreground">KES {totalOwed.toLocaleString()}</p>
            <p className="text-xs text-warning">{outstanding.length} unpaid invoice{outstanding.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-bold text-foreground">KES {totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{paid.length} invoice{paid.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="w-full">
          <TabsTrigger value="invoices" className="flex-1">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 space-y-3">
          {invoices.map((inv, i) => {
            const childName = inv.child ? `${inv.child.firstName} ${inv.child.lastName}` : `Patient #${inv.childId}`;
            const doctorName = inv.doctor?.user
              ? `Dr. ${inv.doctor.user.firstName} ${inv.doctor.user.lastName}`
              : `Doctor #${inv.doctorId}`;
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`shadow-card ${inv.status === 'overdue' ? 'border-l-4 border-l-destructive' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{inv.invoiceNumber}</p>
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
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => { setSelectedInvoice(inv); setViewModal(true); }}
                      >
                        <Receipt className="w-3 h-3" /> View
                      </Button>
                      {(inv.status === 'issued' || inv.status === 'overdue') && (
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => { setSelectedInvoice(inv); setPayModal(true); }}
                        >
                          <CreditCard className="w-3 h-3" /> Pay Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {invoices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No invoices yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {payments.map((pmt, i) => {
            const Icon = methodIcon[pmt.method] ?? CreditCard;
            return (
              <motion.div key={pmt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="shadow-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pmt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {pmt.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : pmt.status === 'processing' ? <Clock className="w-5 h-5" /> : pmt.status === 'failed' ? <AlertCircle className="w-5 h-5 text-destructive" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{pmt.method?.toUpperCase()} · {pmt.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {pmt.invoice?.invoiceNumber} · {pmt.paidAt ? new Date(pmt.paidAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">KES {Number(pmt.amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColor[pmt.status] ?? 'bg-gray-100'}`}>
                        {pmt.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {payments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No payment records yet</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice view modal (with print) */}
      {selectedInvoice && (
        <Dialog open={viewModal} onOpenChange={setViewModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" /> Save PDF
                </Button>
              </div>
            </DialogHeader>
            <InvoicePrintView invoice={selectedInvoice} />
          </DialogContent>
        </Dialog>
      )}

      {/* Payment modal */}
      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          open={payModal}
          onClose={() => setPayModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Billing;
