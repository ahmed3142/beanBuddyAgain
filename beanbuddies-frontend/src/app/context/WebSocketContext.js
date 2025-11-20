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

  // --- 1. MISSING NOTIFICATIONS FETCH ---
  const fetchUnreadNotifications = async (token) => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/notifications/unread', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Database theke ana notification gulo dekhano
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

    // Connect hoar agei purono gulo niye asho
    fetchUnreadNotifications(session.access_token);

    const SOCKET_URL = 'http://localhost:8081/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${session.access_token}`,
      },
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected to WebSocket');

        client.subscribe('/topic/public-notifications', (message) => {
           showNotification(message.body);
        });

        client.subscribe('/user/queue/notifications', (message) => {
           showNotification(message.body);
        });
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

    // 8 Second por remove (Enrollment message porte time lage)
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== newNotif.id));
    }, 8000);
  };

  return (
    <WebSocketContext.Provider value={{ stompClient, notifications }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);