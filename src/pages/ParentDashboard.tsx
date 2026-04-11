import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockChildren, mockAppointments, mockNotifications } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Baby, Bell, ChevronRight, Plus, Video, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentDashboard = () => {
  const { user } = useAuth();
  const children = mockChildren.filter(c => c.parentId === 'p1');
  const upcoming = mockAppointments.filter(a => a.parentId === 'p1' && a.status !== 'completed' && a.status !== 'cancelled');
  const unread = mockNotifications.filter(n => n.userId === 'p1' && !n.read);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Hi, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your family's health</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Baby, label: 'Children', value: children.length, color: 'text-primary' },
          { icon: Calendar, label: 'Upcoming', value: upcoming.length, color: 'text-info' },
          { icon: Bell, label: 'Alerts', value: unread.length, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground">Your Children</h2>
          <Link to="/children">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {children.map((child, i) => (
            <motion.div key={child.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Link to={`/children/${child.id}`}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Baby className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{child.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground">Upcoming Appointments</h2>
          <Link to="/appointments"><Button variant="ghost" size="sm" className="text-primary">View all</Button></Link>
        </div>
        <div className="space-y-3">
          {upcoming.map(apt => (
            <Card key={apt.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.doctorSpecialty}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.date} at {apt.time}</span>
                  <span className="flex items-center gap-1">
                    {apt.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {apt.type === 'virtual' ? 'Virtual' : apt.location}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For: {apt.childName}</p>
              </CardContent>
            </Card>
          ))}
          {upcoming.length === 0 && (
            <Card className="shadow-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">No upcoming appointments</CardContent></Card>
          )}
        </div>
      </div>

      {/* CTA */}
      <Link to="/doctors">
        <Card className="bg-gradient-hero shadow-elevated cursor-pointer hover:opacity-95 transition-opacity">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-primary-foreground">Find a Doctor</p>
              <p className="text-sm text-primary-foreground/80">Book a consultation today</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ParentDashboard;
