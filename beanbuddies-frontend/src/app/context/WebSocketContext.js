"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { session } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastChatMessage, setLastChatMessage] = useState(null); // Chat Feature er jonno

  // --- DYNAMIC URL LOGIC ---
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Apnar Ngrok URL (application.properties theke neya)
  const PROD_URL = 'https://georgiann-unbribing-elderly.ngrok-free.dev'; 
  const DEV_URL = 'http://localhost:8081';

  // Vercel e thakle Ngrok, Local e thakle Localhost use korbe
  const BACKEND_BASE_URL = isProduction ? PROD_URL : DEV_URL;
  // ------------------------

  // 1. Fetch missing notifications
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

    // 2. WebSocket URL setup
    const SOCKET_URL = `${BACKEND_BASE_URL}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${session.access_token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected to WebSocket at', SOCKET_URL);

        // Public Notifications
        client.subscribe('/topic/public-notifications', (message) => {
           showNotification(message.body);
        });

        // Private Notifications
        client.subscribe('/user/queue/notifications', (message) => {
           showNotification(message.body);
        });

        // Chat Messages
        client.subscribe('/user/queue/messages', (message) => {
          console.log("📩 Chat Message Received:", message.body);
          setLastChatMessage(JSON.parse(message.body));
        });
      },
      
      onStompError: (frame) => {
        console.error('❌ Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
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

    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== newNotif.id));
    }, 8000);
  };

  return (
    <WebSocketContext.Provider value={{ stompClient, notifications, lastChatMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);