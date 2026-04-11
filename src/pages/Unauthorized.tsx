import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center">
      <ShieldX className="w-16 h-16 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted-foreground text-sm mb-6">You don't have permission to view this page.</p>
      <Link to="/login"><Button>Go to Login</Button></Link>
    </div>
  </div>
);

export default Unauthorized;
