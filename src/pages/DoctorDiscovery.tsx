import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDoctors } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Video, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const specialties = ['All', ...new Set(mockDoctors.map(d => d.specialty))];
const locations = ['All', ...new Set(mockDoctors.map(d => d.location))];

const DoctorDiscovery = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [location, setLocation] = useState('All');

  const filtered = mockDoctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === 'All' || d.specialty === specialty;
    const matchLoc = location === 'All' || d.location === location;
    return matchSearch && matchSpec && matchLoc;
  });

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
            <SelectContent>{specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{doc.name}</p>
                        <p className="text-xs text-primary font-medium">{doc.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        <span className="text-xs font-medium text-foreground">{doc.rating}</span>
                        <span className="text-xs text-muted-foreground">({doc.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doc.experience}y exp</span>
                      {doc.acceptsVirtual && <span className="flex items-center gap-1 text-info"><Video className="w-3 h-3" />Virtual</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-foreground">${doc.consultationFee}</span>
                      <Button size="sm" onClick={() => navigate(`/book/${doc.id}`)}>Book Now</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <Card className="shadow-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">No doctors found matching your criteria</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default DoctorDiscovery;
