import { useState } from 'react';
import { mockChildren } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Plus, Edit2, Heart, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { Child } from '@/types';
import { useParams, Link } from 'react-router-dom';

const ChildProfiles = () => {
  const { childId } = useParams();
  const [children, setChildren] = useState(mockChildren.filter(c => c.parentId === 'p1'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const selectedChild = childId ? children.find(c => c.id === childId) : null;

  const [form, setForm] = useState<{ name: string; dateOfBirth: string; gender: 'male' | 'female' | 'other'; medicalHistory: string; allergies: string; bloodType: string }>({ name: '', dateOfBirth: '', gender: 'male', medicalHistory: '', allergies: '', bloodType: '' });

  const resetForm = () => setForm({ name: '', dateOfBirth: '', gender: 'male', medicalHistory: '', allergies: '', bloodType: '' });

  const openAdd = () => { resetForm(); setEditingChild(null); setDialogOpen(true); };
  const openEdit = (child: Child) => {
    setEditingChild(child);
    setForm({ name: child.name, dateOfBirth: child.dateOfBirth, gender: child.gender, medicalHistory: child.medicalHistory, allergies: child.allergies.join(', '), bloodType: child.bloodType || '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.dateOfBirth) { toast.error('Name and date of birth are required'); return; }
    if (editingChild) {
      setChildren(prev => prev.map(c => c.id === editingChild.id ? { ...c, ...form, allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean) } : c));
      toast.success('Child profile updated');
    } else {
      const newChild: Child = { id: `c_${Date.now()}`, parentId: 'p1', ...form, allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean) };
      setChildren(prev => [...prev, newChild]);
      toast.success('Child profile added');
    }
    setDialogOpen(false);
  };

  if (selectedChild) {
    const age = Math.floor((Date.now() - new Date(selectedChild.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/children"><Button variant="ghost" size="sm">← Back</Button></Link>
          <Button variant="outline" size="sm" onClick={() => openEdit(selectedChild)}><Edit2 className="w-4 h-4 mr-1" /> Edit</Button>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Baby className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">{selectedChild.name}</h1>
          <p className="text-muted-foreground text-sm">{age} years old · {selectedChild.gender}</p>
        </div>
        <div className="grid gap-4">
          <Card className="shadow-card"><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Droplets className="w-4 h-4 text-destructive" /><span className="text-sm font-medium text-foreground">Blood Type</span></div>
            <p className="text-sm text-muted-foreground">{selectedChild.bloodType || 'Not recorded'}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-foreground">Medical History</span></div>
            <p className="text-sm text-muted-foreground">{selectedChild.medicalHistory || 'No records'}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4">
            <span className="text-sm font-medium text-foreground block mb-2">Allergies</span>
            {selectedChild.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">{selectedChild.allergies.map(a => <span key={a} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">{a}</span>)}</div>
            ) : <p className="text-sm text-muted-foreground">None reported</p>}
          </CardContent></Card>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Child Profile</DialogTitle></DialogHeader>
            <ChildForm form={form} setForm={setForm} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Children</h1>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Child</Button>
      </div>
      <div className="space-y-3">
        {children.map(child => {
          const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          return (
            <Link key={child.id} to={`/children/${child.id}`}>
              <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer mb-3">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Baby className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{age} years old · {child.gender} · {child.bloodType || 'Blood type N/A'}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.preventDefault(); openEdit(child); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingChild ? 'Edit' : 'Add'} Child Profile</DialogTitle></DialogHeader>
          <ChildForm form={form} setForm={setForm} onSave={handleSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ChildForm = ({ form, setForm, onSave }: { form: any; setForm: (f: any) => void; onSave: () => void }) => (
  <div className="space-y-4">
    <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Child's name" /></div>
    <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
    <div><Label>Gender</Label>
      <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
      </Select>
    </div>
    <div><Label>Blood Type</Label><Input value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })} placeholder="e.g., A+" /></div>
    <div><Label>Allergies (comma separated)</Label><Input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g., Peanuts, Dust" /></div>
    <div><Label>Medical History</Label><Textarea value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} placeholder="Any notes..." /></div>
    <Button onClick={onSave} className="w-full">Save</Button>
  </div>
);

export default ChildProfiles;
