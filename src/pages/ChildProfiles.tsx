import { useState, useEffect } from 'react';
import { childrenApi, medicalRecordsApi, type Child, type MedicalRecord } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Plus, Edit2, Heart, Droplets, Activity, Loader2, Syringe } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, Link } from 'react-router-dom';

type ChildForm = {
  firstName: string; lastName: string; dateOfBirth: string;
  gender: 'male' | 'female' | 'other'; bloodType: string; allergies: string; notes: string;
};
const EMPTY_FORM: ChildForm = { firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodType: 'unknown', allergies: '', notes: '' };

const ChildProfiles = () => {
  const { childId } = useParams();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ChildForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    childrenApi.list({ limit: 100 }).then(r => {
      setChildren(r.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectedChild = childId ? children.find(c => String(c.id) === childId) : null;

  useEffect(() => {
    if (selectedChild) {
      medicalRecordsApi.list({ childId: selectedChild.id, limit: 5 })
        .then(r => setRecords(r.data ?? [])).catch(() => {});
    }
  }, [selectedChild]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };
  const openEdit = (child: Child) => {
    setEditingId(child.id);
    setForm({
      firstName: child.firstName, lastName: child.lastName,
      dateOfBirth: child.dateOfBirth, gender: child.gender,
      bloodType: child.bloodType ?? 'unknown',
      allergies: (child.allergies ?? []).join(', '),
      notes: child.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.dateOfBirth) { toast.error('First name and date of birth are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean),
      };
      if (editingId) {
        const updated = await childrenApi.update(editingId, payload);
        setChildren(prev => prev.map(c => c.id === editingId ? updated : c));
        toast.success('Child profile updated');
      } else {
        const created = await childrenApi.create(payload);
        setChildren(prev => [...prev, created]);
        toast.success('Child profile added');
      }
      setDialogOpen(false);
    } catch { toast.error('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

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
          <h1 className="text-xl font-display font-bold text-foreground">{selectedChild.firstName} {selectedChild.lastName}</h1>
          <p className="text-muted-foreground text-sm">{age} years old · {selectedChild.gender}</p>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-card"><CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1"><Droplets className="w-4 h-4 text-destructive" /><span className="text-sm font-medium">Blood Type</span></div>
              <p className="text-sm text-muted-foreground">{selectedChild.bloodType || 'Unknown'}</p>
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Weight / Height</span></div>
              <p className="text-sm text-muted-foreground">
                {selectedChild.weight ? `${selectedChild.weight} kg` : '—'} / {selectedChild.height ? `${selectedChild.height} cm` : '—'}
              </p>
            </CardContent></Card>
          </div>

          <Card className="shadow-card"><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Allergies</span></div>
            {(selectedChild.allergies ?? []).length > 0
              ? <div className="flex flex-wrap gap-2">{selectedChild.allergies.map(a => <span key={a} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">{a}</span>)}</div>
              : <p className="text-sm text-muted-foreground">None reported</p>}
          </CardContent></Card>

          <Card className="shadow-card"><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Syringe className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Vaccinations</span></div>
            {(selectedChild.vaccinationHistory ?? []).length > 0
              ? <div className="flex flex-wrap gap-2">{selectedChild.vaccinationHistory.map((v, i) => <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{v.vaccine}</span>)}</div>
              : <p className="text-sm text-muted-foreground">No vaccination records</p>}
          </CardContent></Card>

          {records.length > 0 && (
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Recent Medical Records</p>
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id} className="text-xs border-l-2 border-primary pl-3">
                    <p className="font-medium text-foreground">{r.visitDate} — {r.chiefComplaint}</p>
                    <p className="text-muted-foreground">{(r.diagnoses ?? []).map(d => d.description).join(', ') || 'No diagnosis recorded'}</p>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          )}

          {selectedChild.notes && (
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{selectedChild.notes}</p>
            </CardContent></Card>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Child Profile</DialogTitle></DialogHeader>
            <ChildFormFields form={form} setForm={setForm} onSave={handleSave} saving={saving} />
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
                    <p className="font-medium text-foreground">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-muted-foreground">{age} yr · {child.gender} · {child.bloodType || 'Blood type N/A'}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.preventDefault(); openEdit(child); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {children.length === 0 && (
          <Card className="shadow-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">No children added yet</CardContent></Card>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Child Profile</DialogTitle></DialogHeader>
          <ChildFormFields form={form} setForm={setForm} onSave={handleSave} saving={saving} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ChildFormFields = ({ form, setForm, onSave, saving }: { form: ChildForm; setForm: (f: ChildForm) => void; onSave: () => void; saving: boolean }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name" /></div>
      <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" /></div>
    </div>
    <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
    <div><Label>Gender</Label>
      <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v as 'male' | 'female' | 'other' })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
      </Select>
    </div>
    <div><Label>Blood Type</Label>
      <Select value={form.bloodType} onValueChange={v => setForm({ ...form, bloodType: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'].map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    <div><Label>Allergies (comma separated)</Label><Input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Nuts" /></div>
    <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." /></div>
    <Button onClick={onSave} className="w-full" disabled={saving}>
      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save
    </Button>
  </div>
);

export default ChildProfiles;
