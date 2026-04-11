import { useState, useEffect } from 'react';
import { adminApi, doctorsApi, childrenApi, appointmentsApi, type AdminDashboard as DashboardData, type Doctor, type Child, type Appointment } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/StatusBadge';
import { Users, Stethoscope, Calendar, Activity, Loader2, Star, MapPin, Phone, Mail, Search, ChevronRight, Heart, Syringe, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fmt = (s: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '';
const safeArr = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
  return [];
};

const DoctorDetail = ({ doc, open, onClose }: { doc: Doctor | null; open: boolean; onClose: () => void }) => {
  if (!doc) return null;
  const name = doc.user ? `Dr. ${doc.user.firstName} ${doc.user.lastName}` : `Doctor #${doc.id}`;
  const sched = safeArr(doc.availabilitySchedule) as { day: string; startTime: string; endTime: string }[];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0">🩺</div>
            <div>
              <p className="font-semibold text-foreground text-lg">{name}</p>
              <p className="text-sm text-primary font-medium">{fmt(doc.specialty)}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm font-medium">{Number(doc.averageRating).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({doc.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {doc.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 shrink-0" />{doc.location}</div>}
            {doc.clinicName && <div className="flex items-center gap-2 text-muted-foreground"><Stethoscope className="w-4 h-4 shrink-0" />{doc.clinicName}</div>}
            {doc.user?.email && <div className="flex items-center gap-2 text-muted-foreground col-span-2"><Mail className="w-4 h-4 shrink-0" />{doc.user.email}</div>}
            {doc.user?.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4 shrink-0" />{doc.user.phone}</div>}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-xl font-bold text-foreground">{doc.yearsOfExperience}</p><p className="text-xs text-muted-foreground">Yrs Exp</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-base font-bold text-foreground">KES {Number(doc.consultationFee).toLocaleString()}</p><p className="text-xs text-muted-foreground">Fee</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-xl">{doc.isAvailable ? '✅' : '❌'}</p><p className="text-xs text-muted-foreground">Available</p></div>
          </div>
          {doc.bio && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">About</p><p className="text-sm text-foreground">{doc.bio}</p></div>}
          {doc.education && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Education</p><p className="text-sm text-foreground">{doc.education}</p></div>}
          <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">License No.</p><p className="text-sm font-mono text-foreground">{doc.licenseNumber}</p></div>
          {sched.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Working Hours</p>
              <div className="flex flex-wrap gap-2">
                {sched.map((s, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                    {s.day} {s.startTime}–{s.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ChildDetail = ({ child, open, onClose }: { child: Child | null; open: boolean; onClose: () => void }) => {
  if (!child) return null;
  const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const allergies = safeArr(child.allergies) as string[];
  const vaccines = safeArr(child.vaccinationHistory) as { vaccine: string; date: string; administered: boolean }[];
  const conditions = safeArr(child.chronicConditions) as string[];
  const meds = safeArr(child.currentMedications) as string[];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{child.firstName} {child.lastName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center text-3xl">👶</div>
            <div>
              <p className="font-semibold text-foreground text-lg">{child.firstName} {child.lastName}</p>
              <p className="text-sm text-muted-foreground capitalize">{child.gender} · {age} years old</p>
              <p className="text-xs text-muted-foreground">DOB: {child.dateOfBirth}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-3"><Droplets className="w-4 h-4 text-destructive mx-auto mb-1" /><p className="text-sm font-bold">{child.bloodType || 'N/A'}</p><p className="text-xs text-muted-foreground">Blood Type</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm font-bold">{child.weight ? `${child.weight} kg` : '—'}</p><p className="text-xs text-muted-foreground">Weight</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm font-bold">{child.height ? `${child.height} cm` : '—'}</p><p className="text-xs text-muted-foreground">Height</p></div>
          </div>
          {child.parent?.user && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Parent / Guardian</p>
              <p className="text-sm text-foreground">{child.parent.user.firstName} {child.parent.user.lastName}</p>
              <p className="text-xs text-muted-foreground">{child.parent.user.email}</p>
            </div>
          )}
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
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Syringe className="w-3 h-3" /> Vaccinations ({vaccines.length})</p>
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
          {child.notes && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</p><p className="text-sm text-foreground">{child.notes}</p></div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AppointmentDetail = ({ apt, open, onClose }: { apt: Appointment | null; open: boolean; onClose: () => void }) => {
  if (!apt) return null;
  const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
  const doctorName = apt.doctor?.user ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}` : `Doctor #${apt.doctorId}`;
  const symptoms = safeArr(apt.symptoms) as string[];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Appointment #{apt.id}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium">{childName}</p></div>
            <div><p className="text-xs text-muted-foreground">Doctor</p><p className="font-medium">{doctorName}</p></div>
            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{apt.appointmentDate}</p></div>
            <div><p className="text-xs text-muted-foreground">Time</p><p className="font-medium">{apt.appointmentTime?.slice(0, 5)}</p></div>
            <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{apt.type}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={apt.status} /></div>
          </div>
          {apt.reason && <div><p className="text-xs text-muted-foreground">Reason</p><p className="text-foreground">{apt.reason}</p></div>}
          {symptoms.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
              <div className="flex flex-wrap gap-1">{symptoms.map(s => <span key={s} className="px-2 py-0.5 bg-muted text-xs rounded-full capitalize">{s}</span>)}</div>
            </div>
          )}
          {apt.doctor?.specialty && <div><p className="text-xs text-muted-foreground">Specialty</p><p>{fmt(apt.doctor.specialty)}</p></div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.dashboard(),
      doctorsApi.list({ limit: 100 }),
      childrenApi.list({ limit: 100 }),
      appointmentsApi.list({ limit: 100 }),
    ]).then(([dashboard, docRes, childRes, apptRes]) => {
      setStats(dashboard);
      setDoctors(docRes.data ?? []);
      setChildren(childRes.data ?? []);
      setAppointments(apptRes.data ?? []);
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const statCards = [
    { icon: Stethoscope, label: 'Doctors', value: stats?.totalDoctors ?? doctors.length, color: 'text-primary' },
    { icon: Users, label: 'Patients', value: stats?.totalChildren ?? children.length, color: 'text-info' },
    { icon: Calendar, label: 'Appointments', value: stats?.totalAppointments ?? appointments.length, color: 'text-success' },
    { icon: Activity, label: 'Pending', value: stats?.pendingAppointments ?? appointments.filter(a => a.status === 'pending').length, color: 'text-warning' },
  ];

  const q = search.toLowerCase();
  const filteredDocs = doctors.filter(d => !q || `${d.user?.firstName ?? ''} ${d.user?.lastName ?? ''} ${d.specialty} ${d.location ?? ''}`.toLowerCase().includes(q));
  const filteredChildren = children.filter(c => !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q));
  const filteredApts = appointments.filter(a => !q || `${a.child?.firstName ?? ''} ${a.child?.lastName ?? ''} ${a.doctor?.user?.firstName ?? ''} ${a.doctor?.user?.lastName ?? ''} ${a.status}`.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {stats?.totalRevenue !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-card border-l-4 border-l-success">
            <CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-lg font-bold text-foreground">KES {Number(stats.totalRevenue).toLocaleString()}</p></CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-warning">
            <CardContent className="p-3"><p className="text-xs text-muted-foreground">Unpaid Invoices</p><p className="text-lg font-bold text-foreground">{stats.unpaidInvoices ?? 0}</p></CardContent>
          </Card>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search doctors, patients, appointments…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Tabs defaultValue="doctors">
        <TabsList className="w-full">
          <TabsTrigger value="doctors" className="flex-1">Doctors ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="patients" className="flex-1">Patients ({filteredChildren.length})</TabsTrigger>
          <TabsTrigger value="appointments" className="flex-1">Visits ({filteredApts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="mt-4 space-y-2">
          {filteredDocs.map((doc, i) => {
            const name = doc.user ? `Dr. ${doc.user.firstName} ${doc.user.lastName}` : `Doctor #${doc.id}`;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xl">🩺</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-primary">{fmt(doc.specialty)}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {doc.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{doc.location}</span>}
                        <span>{doc.yearsOfExperience}y exp</span>
                        <span className={doc.isAvailable ? 'text-success' : 'text-destructive'}>{doc.isAvailable ? '● Active' : '● Off'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end"><Star className="w-3 h-3 text-warning fill-warning" /><span className="text-sm font-medium">{Number(doc.averageRating).toFixed(1)}</span></div>
                      <p className="text-xs text-muted-foreground">KES {Number(doc.consultationFee).toLocaleString()}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filteredDocs.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No doctors found</p>}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-2">
          {filteredChildren.map((child, i) => {
            const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const allergies = safeArr(child.allergies) as string[];
            return (
              <motion.div key={child.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setSelectedChild(child)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-xl">👶</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{child.gender} · {age} yrs · {child.bloodType || 'N/A'}</p>
                      {allergies.length > 0 && <p className="text-xs text-destructive">⚠ {allergies.join(', ')}</p>}
                      {child.parent?.user && <p className="text-xs text-muted-foreground">Parent: {child.parent.user.firstName} {child.parent.user.lastName}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filteredChildren.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No patients found</p>}
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-2">
          {filteredApts.map((apt, i) => {
            const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
            const doctorName = apt.doctor?.user ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}` : `Doctor #${apt.doctorId}`;
            return (
              <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setSelectedApt(apt)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground text-sm">{childName}</p>
                        <p className="text-xs text-muted-foreground">{doctorName} · {fmt(apt.doctor?.specialty ?? '')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{apt.appointmentDate} at {apt.appointmentTime?.slice(0, 5)} · {apt.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={apt.status} />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filteredApts.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No appointments found</p>}
        </TabsContent>
      </Tabs>

      <DoctorDetail doc={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
      <ChildDetail child={selectedChild} open={!!selectedChild} onClose={() => setSelectedChild(null)} />
      <AppointmentDetail apt={selectedApt} open={!!selectedApt} onClose={() => setSelectedApt(null)} />
    </div>
  );
};

export default AdminDashboard;
