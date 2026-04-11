import { useState, useEffect } from 'react';
import { notificationsApi, type Notification } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, AlertCircle, MessageSquare, CheckCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const iconMap: Record<string, React.ElementType> = {
  appointment_confirmed: Calendar,
  appointment_reminder: Bell,
  appointment_cancelled: AlertCircle,
  appointment_completed: Calendar,
  record_added: AlertCircle,
  message_received: MessageSquare,
  system: AlertCircle,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list({ limit: 50 })
      .then(r => setNotifications(r.data ?? []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { toast.error('Failed to mark as read'); }
  };

  const markOne = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Notifications</h1>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type] ?? Bell;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card
                className={`shadow-card transition-colors cursor-pointer ${!n.isRead ? 'border-l-2 border-l-primary' : ''}`}
                onClick={() => !n.isRead && markOne(n.id)}
              >
                <CardContent className="p-4 flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
