import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsApi, type Doctor } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Video, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SPECIALTIES = [
  'All','general_pediatrics','neonatology','pediatric_cardiology','pediatric_neurology',
  'pediatric_oncology','pediatric_surgery','pediatric_orthopedics','pediatric_dermatology',
  'pediatric_endocrinology','pediatric_gastroenterology','pediatric_pulmonology',
  'pediatric_nephrology','child_psychiatry','other',
];

const DoctorDiscovery = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [location, setLocation] = useState('All');
  const [locations, setLocations] = useState<string[]>(['All']);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 50, isAvailable: true };
      if (specialty !== 'All') params.specialty = specialty;
      const res = await doctorsApi.list(params);
      const rows = res.rows ?? [];
      setDoctors(rows);
      const locs = Array.from(new Set(rows.map(d => d.location).filter(Boolean))) as string[];
      setLocations(['All', ...locs]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [specialty]);

  useEffect(() => { load(); }, [load]);

  const filtered = doctors.filter(d => {
    const name = d.user ? `${d.user.firstName} ${d.user.lastName}` : '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchLoc = location === 'All' || d.location === location;
    return matchSearch && matchLoc;
  });

  const formatSpecialty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Find a Doctor</h1>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or specialty" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Specialty" /></SelectTrigger>
            <SelectContent>{SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s === 'All' ? 'All Specialties' : formatSpecialty(s)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((doc, i) => {
            const name = doc.user ? `Dr. ${doc.user.firstName} ${doc.user.lastName}` : `Doctor #${doc.id}`;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl">🩺</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{name}</p>
                            <p className="text-xs text-primary font-medium">{formatSpecialty(doc.specialty)}</p>
                            {doc.clinicName && <p className="text-xs text-muted-foreground">{doc.clinicName}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                            <span className="text-xs font-medium text-foreground">{Number(doc.averageRating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({doc.totalReviews})</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          {doc.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.location}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doc.yearsOfExperience}y exp</span>
                          <span className="flex items-center gap-1 text-info"><Video className="w-3 h-3" />Virtual available</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-foreground">KES {Number(doc.consultationFee).toLocaleString()}</span>
                          <Button size="sm" onClick={() => navigate(`/book/${doc.id}`)}>Book Now</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground text-sm">No doctors found matching your criteria</CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDiscovery;
