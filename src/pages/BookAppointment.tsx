import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsApi, childrenApi, appointmentsApi, type Doctor, type Child } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Video, Star, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const [childId, setChildId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [type, setType] = useState<'physical' | 'virtual'>('physical');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    Promise.all([
      doctorsApi.get(Number(doctorId)),
      childrenApi.list({ limit: 50 }),
    ]).then(([doc, childRes]) => {
      setDoctor(doc);
      setChildren(childRes.data ?? []);
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false));
  }, [doctorId]);

  const handleBook = async () => {
    if (!childId || !appointmentDate || !appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }
    setBooking(true);
    try {
      await appointmentsApi.create({
        doctorId: Number(doctorId),
        childId: Number(childId),
        appointmentDate,
        appointmentTime,
        type,
        reason,
        durationMinutes: 30,
      });
      setBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to book appointment';
      toast.error(msg);
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );
  if (!doctor) return <div className="text-center py-12 text-muted-foreground">Doctor not found</div>;

  const formatSpecialty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const doctorName = doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : `Doctor #${doctor.id}`;

  // Generate time slots 08:00 – 16:30 in 30-min intervals
  const timeSlots: string[] = [];
  for (let h = 8; h < 17; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  if (booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Appointment Booked!</h2>
        <p className="text-muted-foreground text-sm mb-1">{doctorName}</p>
        <p className="text-muted-foreground text-sm mb-1">{appointmentDate} at {appointmentTime}</p>
        <p className="text-muted-foreground text-xs mb-6">{type === 'virtual' ? 'Virtual consultation' : (doctor.location ?? 'Clinic')}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/appointments')}>View Appointments</Button>
          <Button onClick={() => navigate('/parent')}>Go Home</Button>
        </div>
      </motion.div>
    );
  }

  // Today's date as min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>

      {/* Doctor info */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><span className="text-2xl">🩺</span></div>
          <div>
            <p className="font-semibold text-foreground">{doctorName}</p>
            <p className="text-xs text-primary">{formatSpecialty(doctor.specialty)}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" />{Number(doctor.averageRating).toFixed(1)}</span>
              {doctor.location && <span><MapPin className="w-3 h-3 inline" /> {doctor.location}</span>}
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">KES {Number(doctor.consultationFee).toLocaleString()} / visit</p>
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
              <SelectContent>
                {children.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Consultation Type</Label>
            <div className="flex gap-2 mt-1">
              <Button variant={type === 'physical' ? 'default' : 'outline'} size="sm" onClick={() => setType('physical')} className="flex-1 gap-1">
                <MapPin className="w-4 h-4" /> In-Person
              </Button>
              <Button variant={type === 'virtual' ? 'default' : 'outline'} size="sm" onClick={() => setType('virtual')} className="flex-1 gap-1">
                <Video className="w-4 h-4" /> Virtual
              </Button>
            </div>
          </div>

          <div>
            <Label>Appointment Date</Label>
            <Input type="date" min={today} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
          </div>

          {appointmentDate && (
            <div>
              <Label>Select Time</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {timeSlots.map(slot => (
                  <Button key={slot} variant={appointmentTime === slot ? 'default' : 'outline'} size="sm" onClick={() => setAppointmentTime(slot)}>
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Reason / Notes</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe the reason for the visit..." />
          </div>

          <Button onClick={handleBook} className="w-full" disabled={booking || !childId || !appointmentDate || !appointmentTime}>
            {booking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
