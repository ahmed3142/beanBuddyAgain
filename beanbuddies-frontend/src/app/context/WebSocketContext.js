"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { session, profile } = useAuth();
  
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastChatMessage, setLastChatMessage] = useState(null);
  
  // Refs to track state inside callback closures
  const activeChatUserRef = useRef(null); 
  const profileRef = useRef(null);

  useEffect(() => { profileRef.current = profile; }, [profile]);

  const setActiveChatUser = (user) => {
    activeChatUserRef.current = user;
  };

  // --- DYNAMIC URL LOGIC ---
  const isProduction = process.env.NODE_ENV === 'production';
  const PROD_URL = 'https://beanbuddyagain.onrender.com'; 
  const DEV_URL = 'http://localhost:8081';
  const BACKEND_BASE_URL = isProduction ? PROD_URL : DEV_URL;

  const fetchUnreadNotifications = async (token) => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/notifications/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach(n => showNotification(n.message));
      }
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  };

  useEffect(() => {
    if (!session) {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
      }
      return;
    }

    fetchUnreadNotifications(session.access_token);

    const SOCKET_URL = `${BACKEND_BASE_URL}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${session.access_token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected to WebSocket');

        client.subscribe('/topic/public-notifications', (msg) => showNotification(msg.body));
        client.subscribe('/user/queue/notifications', (msg) => showNotification(msg.body));

        client.subscribe('/user/queue/messages', (message) => {
          const msgData = JSON.parse(message.body);
          setLastChatMessage(msgData);

          // --- SMART NOTIFICATION LOGIC ---
          const myUsername = profileRef.current?.username;
          const openChatUser = activeChatUserRef.current;

          // Check: Not from me AND Not from currently open chat
          if (msgData.senderId !== myUsername && msgData.senderId !== openChatUser) {
             showNotification(`New message from ${msgData.senderId}`);
          }
        });
      },
      
      onStompError: (frame) => {
        console.error('Broker error: ' + frame.headers['message']);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [session]);

  const showNotification = (message) => {
    const newNotif = { id: Date.now() + Math.random(), message };
    setNotifications((prev) => [...prev, newNotif]);
    setTimeout(() => setNotifications((prev) => prev.filter(n => n.id !== newNotif.id)), 8000);
  };

  return (
    <WebSocketContext.Provider value={{ 
      stompClient, 
      notifications, 
      lastChatMessage, 
      activeChatUser: activeChatUserRef.current,
      setActiveChatUser,
      showNotification 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);