import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      toast.success('Welcome back!');
      // Role-based redirect
      if (email === 'admin@demo.com') navigate('/admin');
      else if (email === 'doctor@demo.com') navigate('/doctor');
      else navigate('/parent');
    } else {
      toast.error('Invalid credentials. Try demo accounts below.');
    }
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    await login(email, 'demo');
    setLoading(false);
    toast.success('Welcome!');
    if (email === 'admin@demo.com') navigate('/admin');
    else if (email === 'doctor@demo.com') navigate('/doctor');
    else navigate('/parent');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/GCH-Logo.png" alt="GCH Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">Gertrude's Children's Hospital</h1>
          <p className="text-muted-foreground text-sm mt-1">KindCare Connect — Digital Pediatric Care Platform</p>
        </div>

        <Card className="shadow-elevated border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick demo login</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => quickLogin('parent@demo.com')} className="text-xs justify-start gap-2">
                  👨‍👩‍👧 Parent — parent@demo.com
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickLogin('doctor@demo.com')} className="text-xs justify-start gap-2">
                  🩺 Doctor — doctor@demo.com
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickLogin('admin@demo.com')} className="text-xs justify-start gap-2">
                  🔧 Admin — admin@demo.com
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
