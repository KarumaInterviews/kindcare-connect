import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Mic, MicOff, Phone, Send, Paperclip, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Telemedicine = () => {
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'doctor', text: 'Hello! How can I help you today?', time: '10:00 AM' },
    { id: '2', sender: 'parent', text: 'Hi Doctor, I wanted to discuss Liam\'s recent symptoms.', time: '10:01 AM' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState<'video' | 'chat'>('video');

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { id: `m_${Date.now()}`, sender: 'parent', text: newMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMsg('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-display font-bold text-foreground">Telemedicine</h1>

      {/* Toggle */}
      <div className="flex gap-2">
        <Button variant={tab === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setTab('video')} className="flex-1 gap-1">
          <Video className="w-4 h-4" /> Video Call
        </Button>
        <Button variant={tab === 'chat' ? 'default' : 'outline'} size="sm" onClick={() => setTab('chat')} className="flex-1 gap-1">
          <MessageSquare className="w-4 h-4" /> Chat
        </Button>
      </div>

      {tab === 'video' && (
        <Card className="shadow-card overflow-hidden">
          <div className="aspect-video bg-foreground/5 relative flex items-center justify-center">
            {inCall ? (
              <>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🩺</span>
                  </div>
                  <p className="text-foreground font-medium">Dr. Emily Chen</p>
                  <p className="text-xs text-muted-foreground animate-pulse-soft">Connected · 02:34</p>
                </div>
                {/* Self view */}
                <div className="absolute bottom-3 right-3 w-24 h-18 rounded-lg bg-foreground/10 flex items-center justify-center text-xs text-muted-foreground">
                  {videoOn ? 'You' : <VideoOff className="w-4 h-4" />}
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Start a video consultation</p>
                <Button className="mt-4" onClick={() => { setInCall(true); toast.success('Connected to Dr. Chen'); }}>
                  Start Call
                </Button>
              </div>
            )}
          </div>
          {inCall && (
            <div className="flex justify-center gap-4 p-4 bg-card border-t">
              <Button variant={micOn ? 'outline' : 'destructive'} size="icon" className="rounded-full" onClick={() => setMicOn(!micOn)}>
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button variant={videoOn ? 'outline' : 'destructive'} size="icon" className="rounded-full" onClick={() => setVideoOn(!videoOn)}>
                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full" onClick={() => { setInCall(false); toast.info('Call ended'); }}>
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {tab === 'chat' && (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.sender === 'parent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.sender === 'parent' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => toast.info('File upload coming soon')}>
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1" />
              <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Telemedicine;
