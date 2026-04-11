import { useState } from 'react';
import { mockAppointments, mockNotifications } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Clock, Users, CheckCircle, XCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment } from '@/types';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(
    mockAppointments.filter(a => a.doctorId === 'd1')
  );

  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const today = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  const handleAction = (id: string, action: 'confirmed' | 'cancelled') => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    toast.success(action === 'confirmed' ? 'Appointment accepted' : 'Appointment declined');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Doctor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: "Today", value: today.length, color: 'text-primary' },
          { icon: Clock, label: 'Pending', value: pending.length, color: 'text-warning' },
          { icon: Users, label: 'Patients', value: confirmed.length, color: 'text-info' },
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
          {pending.map(apt => (
            <Card key={apt.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-foreground">{apt.childName}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time} · {apt.type}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleAction(apt.id, 'confirmed')} className="flex-1 gap-1">
                    <CheckCircle className="w-3 h-3" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(apt.id, 'cancelled')} className="flex-1 gap-1 text-destructive">
                    <XCircle className="w-3 h-3" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No pending requests</p>}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 space-y-3">
          {confirmed.map(apt => (
            <Card key={apt.id} className="shadow-card">
              <CardContent className="p-4">
                <p className="font-medium text-foreground">{apt.childName}</p>
                <p className="text-xs text-muted-foreground">{apt.date} at {apt.time} · {apt.type}</p>
                <StatusBadge status={apt.status} className="mt-2" />
              </CardContent>
            </Card>
          ))}
          {confirmed.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No confirmed appointments</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
