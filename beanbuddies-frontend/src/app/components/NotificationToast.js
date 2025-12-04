"use client";

import { useWebSocket } from '../context/WebSocketContext';

export default function NotificationToast() {
  const { notifications } = useWebSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px', 
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          style={{
            background: '#333',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'fadeIn 0.3s ease-in-out',
            minWidth: '250px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{fontSize: '1.2rem'}}>🔔</span> 
          {notif.message}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}