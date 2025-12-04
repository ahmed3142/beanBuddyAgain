"use client";

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({ otherUser, onClose }) {
  const { stompClient, lastChatMessage, setActiveChatUser } = useWebSocket();
  const { session, profile } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // URL Helper
  const isProduction = process.env.NODE_ENV === 'production';
  const BACKEND_BASE_URL = isProduction 
    ? 'https://beanbuddyagain.onrender.com' 
    : 'http://localhost:8081';

  // 1. Set Active User Globally & Mark as Read
  useEffect(() => {
    setActiveChatUser(otherUser);
    
    // Mark previous messages as read
    const markRead = async () => {
        try {
            await fetch(`${BACKEND_BASE_URL}/api/v1/chat/read/${otherUser}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
        } catch (e) {
            console.error("Failed to mark read:", e);
        }
    };
    markRead();

    return () => setActiveChatUser(null); // Cleanup on close
  }, [otherUser, setActiveChatUser, session, BACKEND_BASE_URL]);

  // 2. Fetch Messages (Pagination)
  const fetchMessages = async (pageNum) => {
    if (isLoadingHistory) return;
    setIsLoadingHistory(true);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/chat/history/${otherUser}?page=${pageNum}&size=20`, {
        headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      
      if (pageNum === 0) {
        setMessages(data.messages);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 100);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }
      
      if (data.currentPage >= data.totalPages - 1) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial Load
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setMessages([]);
    fetchMessages(0);
  }, [otherUser]);

  // 3. Real-time Message Listener
  useEffect(() => {
    if (lastChatMessage) {
      const isRelated = lastChatMessage.senderId === otherUser || lastChatMessage.senderId === profile?.username;
      
      if (isRelated) {
        setMessages((prev) => {
            // Duplicate check
            if (prev.length > 0 && prev[prev.length - 1].id === lastChatMessage.id) return prev;
            return [...prev, lastChatMessage];
        });
        
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        
        // Mark read immediately since window is open
        if (lastChatMessage.senderId === otherUser) {
             fetch(`${BACKEND_BASE_URL}/api/v1/chat/read/${otherUser}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
        }
      }
    }
  }, [lastChatMessage, otherUser, profile, session, BACKEND_BASE_URL]);

  // 4. Infinite Scroll
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoadingHistory) {
      const currentHeight = e.target.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      
      fetchMessages(nextPage).then(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight - currentHeight;
        }
      });
    }
  };

  // 5. Send Message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient) return;

    const chatDto = {
      recipientId: otherUser,
      content: newMessage
    };

    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify(chatDto),
    });

    setNewMessage("");
  };

  return (
    <div style={styles.window} className="animate-blob-up">
      {/* Header */}
      <div style={styles.header} onClick={onClose}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={styles.avatar}>{otherUser.charAt(0).toUpperCase()}</div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontWeight: 'bold', fontSize: '15px', color: '#fff'}}>{otherUser}</span>
                <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.8)'}}>Active now</span>
            </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={styles.closeBtn}>✕</button>
      </div>

      {/* Body */}
      <div style={styles.body} onScroll={handleScroll} ref={chatBodyRef}>
        {hasMore && <div style={{textAlign: 'center', padding: '10px'}}><span className="spinner" style={{borderLeftColor: '#0084ff', width:'16px', height:'16px'}}></span></div>}
        
        {messages.map((msg, i) => {
            const isMe = msg.senderId === profile?.username;
            const showAvatar = !isMe && (i === messages.length - 1 || messages[i+1]?.senderId !== msg.senderId);

            return (
                <div key={i} style={{
                    ...styles.bubbleWrapper,
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '2px'
                }}>
                    {!isMe && (
                        <div style={{width: '28px', marginRight: '5px', display: 'flex', alignItems: 'flex-end'}}>
                             {showAvatar && <div style={styles.smallAvatar}>{msg.senderId.charAt(0).toUpperCase()}</div>}
                        </div>
                    )}
                    
                    <div style={{
                        ...styles.bubble,
                        backgroundColor: isMe ? '#0084ff' : '#f0f2f5',
                        color: isMe ? '#fff' : '#050505',
                        borderBottomRightRadius: isMe ? '4px' : '18px',
                        borderBottomLeftRadius: !isMe ? '4px' : '18px',
                        borderTopRightRadius: '18px',
                        borderTopLeftRadius: '18px'
                    }}>
                        {msg.content}
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <form onSubmit={sendMessage} style={styles.footer}>
        <input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Aa" 
            style={styles.input}
        />
        <button type="submit" disabled={!newMessage.trim()} style={styles.sendBtn}>➤</button>
      </form>
    </div>
  );
}

const styles = {
  window: {
    position: 'fixed', 
    bottom: '0', 
    right: '80px', // <-- MOVED TO BOTTOM RIGHT
    width: '330px', 
    height: '450px',
    backgroundColor: '#fff', 
    borderTopLeftRadius: '12px', 
    borderTopRightRadius: '12px',
    boxShadow: '0 12px 28px 0 rgba(0,0,0,0.2), 0 2px 4px 0 rgba(0,0,0,0.1)', 
    display: 'flex', 
    flexDirection: 'column', 
    zIndex: 10000,
    fontFamily: 'inherit',
    overflow: 'hidden'
  },
  header: {
    padding: '10px 12px', 
    background: 'linear-gradient(to right, #0084ff, #0099ff)',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white'
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff'
  },
  smallAvatar: {
    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#555'
  },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' },
  body: {
    flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px'
  },
  bubbleWrapper: { display: 'flex', width: '100%', alignItems: 'flex-end' },
  bubble: {
    maxWidth: '70%', padding: '8px 12px', fontSize: '14px', lineHeight: '1.4',
    wordWrap: 'break-word', boxShadow: '0 1px 0.5px rgba(0,0,0,0.05)'
  },
  footer: {
    padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', alignItems: 'center'
  },
  input: {
    flex: 1, padding: '9px 12px', borderRadius: '20px', border: 'none',
    backgroundColor: '#f0f2f5', outline: 'none', fontSize: '14px', color: '#050505'
  },
  sendBtn: {
    background: 'none', border: 'none', color: '#0084ff', fontSize: '18px', cursor: 'pointer', padding: '0 5px'
  }
};