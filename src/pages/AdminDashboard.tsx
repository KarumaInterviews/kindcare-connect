import { useState, useEffect } from 'react';
import { adminApi, doctorsApi, childrenApi, appointmentsApi, type AdminDashboard as DashboardData, type Doctor, type Child, type Appointment } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Users, Stethoscope, Calendar, Activity, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.dashboard(),
      doctorsApi.list({ limit: 50 }),
      childrenApi.list({ limit: 50 }),
      appointmentsApi.list({ limit: 50 }),
    ]).then(([dashboard, docRes, childRes, apptRes]) => {
      setStats(dashboard);
      setDoctors(docRes.rows ?? []);
      setChildren(childRes.rows ?? []);
      setAppointments(apptRes.rows ?? []);
    }).catch(() => toast.error('Failed to load dashboard data'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  const statCards = [
    { icon: Stethoscope, label: 'Doctors', value: stats?.totalDoctors ?? doctors.length, color: 'text-primary' },
    { icon: Users, label: 'Patients', value: stats?.totalChildren ?? children.length, color: 'text-info' },
    { icon: Calendar, label: 'Appointments', value: stats?.totalAppointments ?? appointments.length, color: 'text-success' },
    { icon: Activity, label: 'Pending', value: stats?.pendingAppointments ?? appointments.filter(a => a.status === 'pending').length, color: 'text-warning' },
  ];

  const formatSpecialty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="doctors">
        <TabsList className="w-full">
          <TabsTrigger value="doctors" className="flex-1">Doctors</TabsTrigger>
          <TabsTrigger value="patients" className="flex-1">Patients</TabsTrigger>
          <TabsTrigger value="appointments" className="flex-1">Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="mt-4 space-y-3">
          {doctors.map(doc => {
            const name = doc.user ? `Dr. ${doc.user.firstName} ${doc.user.lastName}` : `Doctor #${doc.id}`;
            return (
              <Card key={doc.id} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><span className="text-lg">🩺</span></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{formatSpecialty(doc.specialty)} · {doc.location || 'N/A'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 text-warning fill-warning" />{Number(doc.averageRating).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">{doc.yearsOfExperience}y exp</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-3">
          {children.map(child => {
            const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            return (
              <Card key={child.id} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0"><span className="text-lg">👶</span></div>
                  <div>
                    <p className="font-medium text-foreground">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-muted-foreground">{child.gender} · {age} yrs · {child.bloodType || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-3">
          {appointments.map(apt => {
            const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
            const doctorName = apt.doctor?.user
              ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`
              : `Doctor #${apt.doctorId}`;
            return (
              <Card key={apt.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{childName} → {doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.appointmentDate} at {apt.appointmentTime?.slice(0, 5)} · {apt.type}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
