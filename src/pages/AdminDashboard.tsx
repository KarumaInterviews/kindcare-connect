import { mockDoctors, mockAppointments, mockChildren } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Users, Stethoscope, Calendar, Activity, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const totalDoctors = mockDoctors.length;
  const totalPatients = mockChildren.length;
  const totalAppointments = mockAppointments.length;
  const pendingCount = mockAppointments.filter(a => a.status === 'pending').length;

  const stats = [
    { icon: Stethoscope, label: 'Doctors', value: totalDoctors, color: 'text-primary' },
    { icon: Users, label: 'Patients', value: totalPatients, color: 'text-info' },
    { icon: Calendar, label: 'Appointments', value: totalAppointments, color: 'text-success' },
    { icon: Activity, label: 'Pending', value: pendingCount, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
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
          {mockDoctors.map(doc => (
            <Card key={doc.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-lg">🩺</span></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialty} · {doc.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{doc.rating}⭐</p>
                  <p className="text-xs text-muted-foreground">{doc.experience}y exp</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-3">
          {mockChildren.map(child => (
            <Card key={child.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center"><span className="text-lg">👶</span></div>
                <div>
                  <p className="font-medium text-foreground">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.gender} · Born {child.dateOfBirth} · {child.bloodType || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-3">
          {mockAppointments.map(apt => (
            <Card key={apt.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{apt.childName} → {apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time} · {apt.type}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
