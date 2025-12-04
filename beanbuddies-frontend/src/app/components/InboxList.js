"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

// Ekhon 'onSelectUser' prop nicche parent theke
export default function InboxList({ onSelectUser }) {
  const { session } = useAuth();
  const { lastChatMessage } = useWebSocket(); 
  
  const [partners, setPartners] = useState([]);

  const isProduction = process.env.NODE_ENV === 'production';
  const BACKEND_BASE_URL = isProduction 
    ? 'https://beanbuddyagain.onrender.com' 
    : 'http://localhost:8081';

  const fetchInbox = () => {
    if (!session) return;
    fetch(`${BACKEND_BASE_URL}/api/v1/chat/inbox`, {
        headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(res => res.json())
    .then(data => setPartners(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchInbox();
  }, [session]);

  useEffect(() => {
    if (lastChatMessage) {
        fetchInbox();
    }
  }, [lastChatMessage]);

  return (
    <div style={{maxHeight: '350px', overflowY: 'auto'}}>
        {partners.length === 0 ? 
          <div style={{padding:'20px', textAlign: 'center', color: '#777', fontSize: '0.9rem'}}>No messages yet.</div> : 
          
          partners.map((user) => (
            <div 
              key={user.username}
              // Fix: Safety check added here
              onClick={() => {
                  if (onSelectUser) {
                      onSelectUser(user.username);
                  } else {
                      console.warn("onSelectUser prop missing in InboxList");
                  }
              }}
              style={{
                padding: '12px 15px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.2s',
                backgroundColor: user.unreadCount > 0 ? '#e7f3ff' : 'transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = user.unreadCount > 0 ? '#e7f3ff' : 'transparent'}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: '#e4e6eb', color: '#050505',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold'
                }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{fontWeight: '600', fontSize: '14px', color: '#050505'}}>{user.username}</div>
                    <div style={{fontSize: '12px', color: '#65676B'}}>Student</div>
                </div>
              </div>
              
              {user.unreadCount > 0 && (
                <div style={{
                    width: '10px', height: '10px', background: '#0084ff', borderRadius: '50%'
                }}></div>
              )}
            </div>
          ))
        }
    </div>
  );
}