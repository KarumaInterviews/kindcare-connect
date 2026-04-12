import { useState, useEffect } from 'react';
import { appointmentsApi, billingApi, type Appointment, type Child, type Invoice } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader2, Baby, Droplets, Heart, Syringe, ChevronRight, MapPin, Video, Receipt, CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const invoiceStatusColor: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  waived: 'bg-purple-100 text-purple-700',
  draft: 'bg-yellow-100 text-yellow-700',
};

const safeArr = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
  return [];
};

// ── Patient detail modal ─────────────────────────────────────────────────────
const PatientDetail = ({ child, apts, open, onClose }: { child: Child | null; apts: Appointment[]; open: boolean; onClose: () => void }) => {
  if (!child) return null;
  const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const allergies = safeArr(child.allergies) as string[];
  const vaccines = safeArr(child.vaccinationHistory) as { vaccine: string; date: string; administered: boolean }[];
  const conditions = safeArr(child.chronicConditions) as string[];
  const meds = safeArr(child.currentMedications) as string[];
  const patientApts = apts.filter(a => a.childId === child.id);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{child.firstName} {child.lastName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">👶</div>
            <div>
              <p className="font-semibold text-foreground text-lg">{child.firstName} {child.lastName}</p>
              <p className="text-sm text-muted-foreground capitalize">{child.gender} · {age} years old</p>
              <p className="text-xs text-muted-foreground">DOB: {child.dateOfBirth}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-3"><Droplets className="w-4 h-4 text-destructive mx-auto mb-1" /><p className="text-sm font-bold">{child.bloodType || 'N/A'}</p><p className="text-xs text-muted-foreground">Blood</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm font-bold">{child.weight ? `${child.weight} kg` : '—'}</p><p className="text-xs text-muted-foreground">Weight</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm font-bold">{child.height ? `${child.height} cm` : '—'}</p><p className="text-xs text-muted-foreground">Height</p></div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Heart className="w-3 h-3 text-destructive" /> Allergies</p>
            {allergies.length > 0
              ? <div className="flex flex-wrap gap-1">{allergies.map(a => <span key={a} className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">{a}</span>)}</div>
              : <p className="text-xs text-muted-foreground">None reported</p>}
          </div>

          {conditions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Chronic Conditions</p>
              <div className="flex flex-wrap gap-1">{conditions.map(c => <span key={c} className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">{c}</span>)}</div>
            </div>
          )}

          {meds.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Current Medications</p>
              <div className="flex flex-wrap gap-1">{meds.map(m => <span key={m} className="px-2 py-0.5 bg-info/10 text-info text-xs rounded-full">{m}</span>)}</div>
            </div>
          )}

          {vaccines.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Syringe className="w-3 h-3" /> Vaccinations</p>
              <div className="grid grid-cols-2 gap-1">
                {vaccines.map((v, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${v.administered ? 'bg-success' : 'bg-muted'}`} />
                    <span className={v.administered ? 'text-foreground' : 'text-muted-foreground'}>{v.vaccine}</span>
                    <span className="text-muted-foreground text-[10px]">{v.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patientApts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Visit History ({patientApts.length})</p>
              <div className="space-y-2">
                {patientApts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center text-xs border-l-2 border-primary pl-2">
                    <div>
                      <p className="font-medium text-foreground">{a.appointmentDate} at {a.appointmentTime?.slice(0, 5)}</p>
                      <p className="text-muted-foreground">{a.reason || 'No reason provided'}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Appointment Detail Modal ─────────────────────────────────────────────────
const AptDetail = ({ apt, open, onClose, onAction }: {
  apt: Appointment | null; open: boolean; onClose: () => void;
  onAction: (id: number, action: 'confirmed' | 'cancelled' | 'completed') => void;
}) => {
  if (!apt) return null;
  const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
  const age = apt.child ? Math.floor((Date.now() - new Date(apt.child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const symptoms = safeArr(apt.symptoms) as string[];
  const allergies = safeArr(apt.child?.allergies) as string[];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Appointment: {childName}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">👶</div>
            <div>
              <p className="font-medium text-foreground">{childName}</p>
              <p className="text-xs text-muted-foreground">
                {apt.child?.gender && `${apt.child.gender} · `}{age !== null ? `${age} yrs` : ''} · {apt.child?.bloodType || ''}
              </p>
              {allergies.length > 0 && <p className="text-xs text-destructive mt-0.5">⚠ Allergic to: {allergies.join(', ')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{apt.appointmentDate}</p></div>
            <div><p className="text-xs text-muted-foreground">Time</p><p className="font-medium">{apt.appointmentTime?.slice(0, 5)}</p></div>
            <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{apt.type}</p></div>
            <div><p className="text-xs text-muted-foreground">Duration</p><p className="font-medium">{apt.durationMinutes} min</p></div>
          </div>

          <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={apt.status} /></div>

          {apt.reason && <div><p className="text-xs text-muted-foreground">Reason</p><p className="text-foreground">{apt.reason}</p></div>}

          {symptoms.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
              <div className="flex flex-wrap gap-1">{symptoms.map(s => <span key={s} className="px-2 py-0.5 bg-muted text-xs rounded-full capitalize">{s}</span>)}</div>
            </div>
          )}

          {apt.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 gap-1" onClick={() => { onAction(apt.id, 'confirmed'); onClose(); }}>
                <CheckCircle className="w-3 h-3" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive border-destructive/30" onClick={() => { onAction(apt.id, 'cancelled'); onClose(); }}>
                <XCircle className="w-3 h-3" /> Decline
              </Button>
            </div>
          )}
          {apt.status === 'confirmed' && (
            <Button size="sm" className="w-full gap-1" onClick={() => { onAction(apt.id, 'completed'); onClose(); }}>
              <CheckCircle className="w-3 h-3" /> Mark as Completed
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Doctor Dashboard ────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Child | null>(null);

  useEffect(() => {
    Promise.all([
      appointmentsApi.list({ limit: 200 }),
      billingApi.listInvoices({ limit: 100 }),
    ])
      .then(([aptRes, invRes]) => {
        setAppointments(aptRes.data ?? []);
        setInvoices(invRes.data ?? []);
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, action: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await appointmentsApi.updateStatus(id, action);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
      toast.success(action === 'confirmed' ? 'Appointment accepted' : action === 'completed' ? 'Marked as completed' : 'Appointment declined');
    } catch { toast.error('Action failed'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const todayApts = appointments.filter(a => a.appointmentDate === today);
  const completed = appointments.filter(a => a.status === 'completed');

  // Unique patients
  const patientMap = new Map<number, Child>();
  appointments.forEach(a => { if (a.child && !patientMap.has(a.childId)) patientMap.set(a.childId, a.child); });
  const patients = Array.from(patientMap.values());

  // Billing stats
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const unpaidInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'overdue');
  const totalEarned = paidInvoices.reduce((s, i) => s + Number(i.totalAmount), 0);

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const AppCard = ({ apt }: { apt: Appointment }) => {
    const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
    const age = apt.child ? Math.floor((Date.now() - new Date(apt.child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const allergies = safeArr(apt.child?.allergies) as string[];
    return (
      <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setSelectedApt(apt)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg">👶</div>
              <div>
                <p className="font-medium text-foreground text-sm">{childName}</p>
                <p className="text-xs text-muted-foreground">{age !== null ? `${age} yrs` : ''}{apt.child?.gender ? ` · ${apt.child.gender}` : ''}</p>
                {allergies.length > 0 && <p className="text-xs text-destructive">⚠ {allergies.slice(0, 2).join(', ')}</p>}
              </div>
            </div>
            <StatusBadge status={apt.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.appointmentDate}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.appointmentTime?.slice(0, 5)}</span>
            <span className="flex items-center gap-1">{apt.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{apt.type}</span>
          </div>
          {apt.reason && <p className="text-xs text-muted-foreground mt-1 truncate">Reason: {apt.reason}</p>}
          {apt.status === 'pending' && (
            <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
              <Button size="sm" onClick={() => handleAction(apt.id, 'confirmed')} className="flex-1 gap-1 text-xs h-7">
                <CheckCircle className="w-3 h-3" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(apt.id, 'cancelled')} className="flex-1 gap-1 text-xs h-7 text-destructive border-destructive/30">
                <XCircle className="w-3 h-3" /> Decline
              </Button>
            </div>
          )}
          {apt.status === 'confirmed' && (
            <Button size="sm" className="w-full mt-2 text-xs h-7 gap-1" onClick={e => { e.stopPropagation(); handleAction(apt.id, 'completed'); }}>
              <CheckCircle className="w-3 h-3" /> Mark Completed
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Doctor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Calendar, label: "Today's Appointments", value: todayApts.length, color: 'text-primary' },
          { icon: Clock, label: 'Pending Requests', value: pending.length, color: 'text-warning' },
          { icon: CheckCircle, label: 'Confirmed', value: confirmed.length, color: 'text-success' },
          { icon: Users, label: 'Total Patients', value: patients.length, color: 'text-info' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow-card border-l-2 border-l-success">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-4 h-4 mx-auto mb-0.5 text-success" />
            <p className="text-sm font-bold text-foreground">KES {totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-2 border-l-primary">
          <CardContent className="p-3 text-center">
            <Receipt className="w-4 h-4 mx-auto mb-0.5 text-primary" />
            <p className="text-sm font-bold text-foreground">{paidInvoices.length}</p>
            <p className="text-[10px] text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-2 border-l-warning">
          <CardContent className="p-3 text-center">
            <CreditCard className="w-4 h-4 mx-auto mb-0.5 text-warning" />
            <p className="text-sm font-bold text-foreground">{unpaidInvoices.length}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="pending" className="flex-1">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed" className="flex-1">Upcoming ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="patients" className="flex-1">Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History ({completed.length})</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1">Billing ({invoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.map((apt, i) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <AppCard apt={apt} />
            </motion.div>
          ))}
          {pending.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No pending requests</p>}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 space-y-3">
          {confirmed.map((apt, i) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <AppCard apt={apt} />
            </motion.div>
          ))}
          {confirmed.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No confirmed appointments</p>}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-2">
          {patients.map((child, i) => {
            const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const allergies = safeArr(child.allergies) as string[];
            const visitCount = appointments.filter(a => a.childId === child.id).length;
            return (
              <motion.div key={child.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setSelectedPatient(child)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-xl">👶</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{child.gender} · {age} yrs · {child.bloodType || 'N/A'}</p>
                      {allergies.length > 0 && <p className="text-xs text-destructive">⚠ {allergies.join(', ')}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">{visitCount}</p>
                      <p className="text-xs text-muted-foreground">visits</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {patients.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No patients yet</p>}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-2">
          {completed.map((apt, i) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="shadow-card cursor-pointer" onClick={() => setSelectedApt(apt)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{apt.appointmentDate} at {apt.appointmentTime?.slice(0, 5)} · {apt.type}</p>
                      {apt.reason && <p className="text-xs text-muted-foreground truncate">Reason: {apt.reason}</p>}
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {completed.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No completed appointments</p>}
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-2">
          {invoices.map((inv, i) => {
            const childName = inv.child ? `${inv.child.firstName} ${inv.child.lastName}` : `Patient #${inv.childId}`;
            const parentName = inv.parent?.user
              ? `${inv.parent.user.firstName} ${inv.parent.user.lastName}`
              : null;
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`shadow-card ${inv.status === 'overdue' ? 'border-l-4 border-l-destructive' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{childName}</p>
                        {parentName && <p className="text-xs text-muted-foreground">Parent: {parentName}</p>}
                        <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-sm">KES {Number(inv.totalAmount).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoiceStatusColor[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {inv.status}
                        </span>
                        {inv.payments && inv.payments.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">{inv.payments.length} payment{inv.payments.length !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {invoices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No billing records yet
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AptDetail apt={selectedApt} open={!!selectedApt} onClose={() => setSelectedApt(null)} onAction={handleAction} />
      <PatientDetail child={selectedPatient} apts={appointments} open={!!selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
};

export default DoctorDashboard;
