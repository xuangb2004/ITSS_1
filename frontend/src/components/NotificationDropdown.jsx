import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/api';

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Load thông báo
  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      // Đếm số lượng chưa đọc (is_read = 0 hoặc false)
      const count = data.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi load thông báo", error);
    }
  };

  // Load lần đầu và thiết lập interval để tự động check thông báo mới mỗi 30s
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s check 1 lần
    return () => clearInterval(interval);
  }, []);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
       // Khi mở ra thì load lại cho mới nhất
       loadNotifications();
    }
  };

  const handleMarkRead = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.notification_id);
        // Cập nhật UI local ngay lập tức
        setNotifications(prev => prev.map(n => 
          n.notification_id === notif.notification_id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="nav-icon" 
        onClick={handleToggle}
        style={{ position: 'relative' }}
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#ef4444', color: 'white', fontSize: '10px',
            width: '18px', height: '18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu" style={{
          position: 'absolute', top: '100%', right: '0', width: '300px',
          background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
          borderRadius: '8px', zIndex: 1000, marginTop: '10px',
          maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee'
        }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>通知</div>
          
          {notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>通知はありません</div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.notification_id} 
                onClick={() => handleMarkRead(notif)}
                style={{
                  padding: '15px', borderBottom: '1px solid #f5f5f5',
                  background: notif.is_read ? 'white' : '#f0fdfa', // Chưa đọc thì màu xanh nhạt
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { if(notif.is_read) e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={(e) => { if(notif.is_read) e.currentTarget.style.background = 'white' }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  {notif.title}
                  {!notif.is_read && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#14b8a6', borderRadius: '50%', marginLeft: '8px' }}></span>}
                </div>
                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;