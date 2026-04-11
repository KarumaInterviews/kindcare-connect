import { useState } from 'react';
import { mockAppointments } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Video, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment } from '@/types';

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments.filter(a => a.parentId === 'p1'));

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    toast.success('Appointment cancelled');
  };

  const AppointmentCard = ({ apt }: { apt: Appointment }) => (
    <Card className="shadow-card mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-foreground">{apt.doctorName}</p>
            <p className="text-xs text-muted-foreground">{apt.doctorSpecialty}</p>
          </div>
          <StatusBadge status={apt.status} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.date} at {apt.time}</span>
          <span className="flex items-center gap-1">
            {apt.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {apt.type === 'virtual' ? 'Virtual' : apt.location}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Child: {apt.childName}</p>
        {apt.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{apt.notes}"</p>}
        {(apt.status === 'confirmed' || apt.status === 'pending') && (
          <div className="flex gap-2 mt-3">
            {apt.type === 'virtual' && apt.status === 'confirmed' && (
              <Button size="sm" variant="outline" className="gap-1 text-info border-info/30" onClick={() => toast.info('Video call feature coming soon')}>
                <Video className="w-3 h-3" /> Join Call
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30" onClick={() => handleCancel(apt.id)}>
              <X className="w-3 h-3" /> Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Appointments</h1>
      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.map(a => <AppointmentCard key={a.id} apt={a} />)}
          {upcoming.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No upcoming appointments</p>}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {past.map(a => <AppointmentCard key={a.id} apt={a} />)}
          {past.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No past appointments</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;
