import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, AlertCircle, MessageSquare, CheckCheck } from 'lucide-react';
import { Notification } from '@/types';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  appointment: Calendar,
  reminder: Bell,
  system: AlertCircle,
  message: MessageSquare,
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter(n => n.userId === (user?.id || 'p1'))
  );

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unread = notifications.filter(n => !n.read).length;

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
          const Icon = iconMap[n.type] || Bell;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`shadow-card transition-colors ${!n.read ? 'border-l-2 border-l-primary' : ''}`}>
                <CardContent className="p-4 flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
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
