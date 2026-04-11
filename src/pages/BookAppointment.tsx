import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDoctors, mockChildren } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Video, Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctor = mockDoctors.find(d => d.id === doctorId);
  const children = mockChildren.filter(c => c.parentId === 'p1');

  const [childId, setChildId] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'physical' | 'virtual'>('physical');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);

  if (!doctor) return <div className="text-center py-12 text-muted-foreground">Doctor not found</div>;

  const availableSlots = doctor.availability.find(a => a.day === day)?.slots || [];

  const handleBook = () => {
    if (!childId || !day || !time) { toast.error('Please fill all required fields'); return; }
    if (type === 'virtual' && !doctor.acceptsVirtual) { toast.error('This doctor does not accept virtual consultations'); return; }
    setBooked(true);
    toast.success('Appointment booked successfully!');
  };

  if (booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Appointment Booked!</h2>
        <p className="text-muted-foreground text-sm mb-1">{doctor.name} · {day} at {time}</p>
        <p className="text-muted-foreground text-xs mb-6">{type === 'virtual' ? 'Virtual consultation' : doctor.location}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/appointments')}>View Appointments</Button>
          <Button onClick={() => navigate('/parent')}>Go Home</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>

      {/* Doctor info */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><span className="text-2xl">🩺</span></div>
          <div>
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-xs text-primary">{doctor.specialty}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" />{doctor.rating}</span>
              <span><MapPin className="w-3 h-3 inline" /> {doctor.location}</span>
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">${doctor.consultationFee} / visit</p>
          </div>
        </CardContent>
      </Card>

      {/* Booking form */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Book Appointment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Child</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger><SelectValue placeholder="Choose a child" /></SelectTrigger>
              <SelectContent>{children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Consultation Type</Label>
            <div className="flex gap-2 mt-1">
              <Button variant={type === 'physical' ? 'default' : 'outline'} size="sm" onClick={() => setType('physical')} className="flex-1 gap-1">
                <MapPin className="w-4 h-4" /> In-Person
              </Button>
              <Button variant={type === 'virtual' ? 'default' : 'outline'} size="sm" onClick={() => setType('virtual')} className="flex-1 gap-1"
                disabled={!doctor.acceptsVirtual}>
                <Video className="w-4 h-4" /> Virtual
              </Button>
            </div>
          </div>

          <div>
            <Label>Select Day</Label>
            <Select value={day} onValueChange={v => { setDay(v); setTime(''); }}>
              <SelectTrigger><SelectValue placeholder="Choose a day" /></SelectTrigger>
              <SelectContent>{doctor.availability.map(a => <SelectItem key={a.day} value={a.day}>{a.day}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {day && (
            <div>
              <Label>Select Time</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {availableSlots.map(slot => (
                  <Button key={slot} variant={time === slot ? 'default' : 'outline'} size="sm" onClick={() => setTime(slot)}>
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any concerns or notes for the doctor..." />
          </div>

          <Button onClick={handleBook} className="w-full" disabled={!childId || !day || !time}>
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
