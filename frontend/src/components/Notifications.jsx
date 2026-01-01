import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { initSocket, joinUserRoom, onNotification } from '../services/socket';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Load notifs error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // init socket and join user room
    const sock = initSocket('http://localhost:5001');
    if (user?.id) joinUserRoom(user.id);

    // listen realtime
    onNotification((payload) => {
      // prepend new notification
      setNotifications(prev => [{
        notification_id: Date.now(), // temp id if backend not returned yet
        title: payload.title,
        message: payload.message,
        created_at: (new Date()).toISOString(),
        is_read: false
      }, ...prev]);
    });

    return () => {
      // no explicit disconnect to keep socket for other components
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleMarkRead = async (notifId) => {
    try {
      await notificationService.markRead(notifId);
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await notificationService.markRead(n.notification_id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ padding: 20 }}>
      <h2>Notifications</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={markAllRead} disabled={unreadCount === 0}>Mark all as read</button>
        <span style={{ marginLeft: 12 }}>{unreadCount} unread</span>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.notification_id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 6, background: n.is_read ? '#fff' : '#f0fdfa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                {!n.is_read && <button onClick={() => handleMarkRead(n.notification_id)}>Mark read</button>}
              </div>
              <div style={{ color: '#555', marginTop: 6 }}>{n.message}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
