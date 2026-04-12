import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';

const SPECIALTIES = [
  { value: 'general_pediatrics', label: 'General Pediatrics' },
  { value: 'neonatology', label: 'Neonatology' },
  { value: 'pediatric_cardiology', label: 'Pediatric Cardiology' },
  { value: 'pediatric_neurology', label: 'Pediatric Neurology' },
  { value: 'pediatric_oncology', label: 'Pediatric Oncology' },
  { value: 'pediatric_surgery', label: 'Pediatric Surgery' },
  { value: 'pediatric_orthopedics', label: 'Pediatric Orthopedics' },
  { value: 'pediatric_dermatology', label: 'Pediatric Dermatology' },
  { value: 'pediatric_endocrinology', label: 'Pediatric Endocrinology' },
  { value: 'pediatric_gastroenterology', label: 'Pediatric Gastroenterology' },
  { value: 'pediatric_pulmonology', label: 'Pediatric Pulmonology' },
  { value: 'pediatric_nephrology', label: 'Pediatric Nephrology' },
  { value: 'child_psychiatry', label: 'Child Psychiatry' },
  { value: 'other', label: 'Other' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Full name is required'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (role === 'doctor') {
      if (!licenseNumber.trim()) { toast.error('License number is required for doctors'); return; }
      if (!specialty) { toast.error('Specialty is required for doctors'); return; }
    }
    setLoading(true);
    try {
      await register(name, email, password, role,
        role === 'doctor' ? { licenseNumber, specialty } : undefined
      );
      toast.success('Account created!');
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else navigate('/parent');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/GCH-Logo.png" alt="GCH Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">Join KindCare Connect</h1>
          <p className="text-muted-foreground text-sm mt-1">Gertrude's Children's Hospital</p>
        </div>

        <Card className="shadow-elevated border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Start managing your child's healthcare</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="First and last name" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
              </div>
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent / Guardian</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'doctor' && (
                <>
                  <div className="space-y-2">
                    <Label>Medical License Number</Label>
                    <Input
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      placeholder="e.g. KMP/2024/001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
