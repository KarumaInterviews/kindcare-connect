import { useState, useEffect } from 'react';
import { appointmentsApi, type Appointment } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.list({ limit: 100 })
      .then(r => setAppointments(r.rows ?? []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const todayAppts = appointments.filter(a => a.appointmentDate === today);

  const handleAction = async (id: number, action: 'confirmed' | 'cancelled') => {
    try {
      await appointmentsApi.updateStatus(id, action);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
      toast.success(action === 'confirmed' ? 'Appointment accepted' : 'Appointment declined');
    } catch { toast.error('Action failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Doctor Dashboard</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: "Today", value: todayAppts.length, color: 'text-primary' },
          { icon: Clock, label: 'Pending', value: pending.length, color: 'text-warning' },
          { icon: Users, label: 'Confirmed', value: confirmed.length, color: 'text-info' },
        ].map((s, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed" className="flex-1">Confirmed ({confirmed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.map(apt => {
            const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
            return (
              <Card key={apt.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-foreground">{childName}</p>
                      <p className="text-xs text-muted-foreground">{apt.appointmentDate} at {apt.appointmentTime?.slice(0, 5)} · {apt.type}</p>
                      {apt.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {apt.reason}</p>}
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => handleAction(apt.id, 'confirmed')} className="flex-1 gap-1">
                      <CheckCircle className="w-3 h-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(apt.id, 'cancelled')} className="flex-1 gap-1 text-destructive border-destructive/30">
                      <XCircle className="w-3 h-3" /> Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {pending.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No pending requests</p>}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 space-y-3">
          {confirmed.map(apt => {
            const childName = apt.child ? `${apt.child.firstName} ${apt.child.lastName}` : `Patient #${apt.childId}`;
            return (
              <Card key={apt.id} className="shadow-card">
                <CardContent className="p-4">
                  <p className="font-medium text-foreground">{childName}</p>
                  <p className="text-xs text-muted-foreground">{apt.appointmentDate} at {apt.appointmentTime?.slice(0, 5)} · {apt.type}</p>
                  {apt.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {apt.reason}</p>}
                  <StatusBadge status={apt.status} className="mt-2" />
                </CardContent>
              </Card>
            );
          })}
          {confirmed.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No confirmed appointments</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
