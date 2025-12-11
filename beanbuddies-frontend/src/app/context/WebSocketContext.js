"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

const LAST_SEEN_KEY = "beanbuddies_last_notification_seen_at";

export const WebSocketProvider = ({ children }) => {
  const { session, profile } = useAuth();

  const [stompClient, setStompClient] = useState(null);

  // Toast notifications (bottom-left, auto-hide)
  const [notifications, setNotifications] = useState([]);

  // Latest notification (for dropdown live prepend)
  const [lastNotification, setLastNotification] = useState(null);

  // Last chat message payload (if you want preview somewhere)
  const [lastChatMessage, setLastChatMessage] = useState(null);

  // ✅ Inbox cache (for fast dropdown)
  const [inboxPartners, setInboxPartners] = useState([]);

  // ✅ Notification list cache (for fast notification dropdown)
  const [notificationsList, setNotificationsList] = useState([]);

  // Currently opened chat user (used by GlobalChatWrapper)
  const [activeChatUser, setActiveChatUserState] = useState(null);

  // Refs to avoid stale values inside WebSocket callbacks
  const activeChatUserRef = useRef(null);
  const profileRef = useRef(null);

  const isProduction = process.env.NODE_ENV === "production";
  const BACKEND_BASE_URL = isProduction
    ? "https://beanbuddyagain.onrender.com"
    : "http://localhost:8081";

  // keep profile in ref for use inside callbacks
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const setActiveChatUser = (username) => {
    setActiveChatUserState(username);
    activeChatUserRef.current = username;
    console.log("Selected user for chat:", username);
  };

  // ---------------- NORMALISED NOTIFICATION CREATOR (TOAST) ---------------- //

  const showNotification = (message, fullData = {}) => {
    const richNotif = {
      id: fullData.id ?? Date.now() + Math.random(),
      message: fullData.message ?? message,

      // The logical type: "MESSAGE", "COURSE", "LESSON", "GLOBAL", ...
      type:
        fullData.type ??
        fullData.notificationType ??
        fullData.kind ??
        null,

      // The thing we use to redirect (courseId, senderUsername, etc.)
      referenceId:
        fullData.referenceId ??
        fullData.refId ??
        fullData.targetId ??
        null,

      createdAt:
        fullData.createdAt ??
        fullData.created_at ??
        new Date().toISOString(),

      read: fullData.read ?? fullData.isRead ?? false,
      recipientUsername:
        fullData.recipientUsername ??
        fullData.recipient ??
        null,
    };

    // 1) Toast list for popup
    setNotifications((prev) => [...prev, richNotif]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== richNotif.id)
      );
    }, 8000);

    // 2) Dropdown can also use this as "lastNotification"
    setLastNotification(richNotif);
  };

  // ---------------- LOGIN-TIME UNREAD POPUP (for toasts) ---------------- //

  const fetchUnreadNotifications = async (token) => {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        console.warn(
          "Failed to fetch notifications, status:",
          res.status
        );
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) return;

      // Read "last seen" moment from localStorage
      let lastSeenDate = null;
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(LAST_SEEN_KEY);
        if (stored) {
          const parsed = new Date(stored);
          if (!isNaN(parsed.getTime())) lastSeenDate = parsed;
        }
      }

      let newestSeen = lastSeenDate;
      const toShow = [];

      for (const n of data) {
        if (n.read) continue;

        const created = n.createdAt ? new Date(n.createdAt) : null;

        if (created && !isNaN(created.getTime())) {
          if (!newestSeen || created > newestSeen) {
            newestSeen = created;
          }
        }

        if (!lastSeenDate) {
          toShow.push(n);
        } else if (!created) {
          toShow.push(n);
        } else if (created > lastSeenDate) {
          toShow.push(n);
        }
      }

      toShow.forEach((n) =>
        showNotification(n.message, {
          id: n.id,
          type: n.type,
          referenceId: n.referenceId,
          createdAt: n.createdAt,
          read: n.read,
          recipientUsername: n.recipientUsername,
        })
      );

      if (typeof window !== "undefined" && newestSeen) {
        window.localStorage.setItem(
          LAST_SEEN_KEY,
          newestSeen.toISOString()
        );
      }
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  };

  // ---------------- FULL NOTIFICATION LIST FETCH (for dropdown cache) ---------------- //

  const fetchAllNotifications = async (token) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        console.warn(
          "Failed to fetch notifications list",
          res.status
        );
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) return;

      // newest first
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
      setNotificationsList(sorted);
    } catch (err) {
      console.error(
        "Error fetching dropdown notifications:",
        err
      );
    }
  };

  // ---------------- INBOX FETCH (CACHED) ---------------- //

  const fetchInbox = async (token) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/chat/inbox`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        console.warn("Failed to fetch inbox, status:", res.status);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) return;

      setInboxPartners(data);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    }
  };

  // ---------------- WEBSOCKET SETUP ---------------- //

  useEffect(() => {
    if (!session) {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
      }
      return;
    }

    const token = session.access_token;

    // 1) On login: popup recent unseen unread notifications (toasts)
    fetchUnreadNotifications(token);
    // 2) Preload inbox so dropdown is instant
    fetchInbox(token);
    // 3) Preload full notification list for dropdown
    fetchAllNotifications(token);

    // 4) Connect WebSocket
    const SOCKET_URL = `${BACKEND_BASE_URL}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        // Public / global notifications
        client.subscribe("/topic/public-notifications", (msg) => {
          try {
            const body = JSON.parse(msg.body);
            showNotification(body.message ?? msg.body, body);
            // optional: if your backend also persists public notifications
            // you could refetch full list here or merge if needed
          } catch (e) {
            console.error("Failed to parse public notif", e);
            showNotification(msg.body, {});
          }
        });

        // Private notifications for this user
        client.subscribe("/user/queue/notifications", (msg) => {
          try {
            const body = JSON.parse(msg.body);

            // Toast popup
            showNotification(body.message ?? msg.body, body);

            // 🔁 Keep dropdown cache in sync (prepend, avoid dupes)
            setNotificationsList((prev) => {
              if (!body.id) {
                // if there's no id, just keep previous cache
                return prev;
              }
              const filtered = prev.filter(
                (n) => n.id !== body.id
              );
              return [body, ...filtered];
            });
          } catch (e) {
            console.error("Failed to parse user notif", e);
            showNotification(msg.body, {});
          }
        });

        // Direct chat messages
        client.subscribe("/user/queue/messages", (message) => {
          try {
            const msgData = JSON.parse(message.body);
            setLastChatMessage(msgData);

            // refresh inbox when new chat message comes
            fetchInbox(token);

            const myUsername = profileRef.current?.username;
            const openChatUser = activeChatUserRef.current;

            // Only toast if chat with that sender is NOT already open
            if (
              msgData.senderId !== myUsername &&
              msgData.senderId !== openChatUser
            ) {
              showNotification(
                `New message from ${msgData.senderId}`,
                {
                  type: "MESSAGE",
                  referenceId: msgData.senderId,
                  createdAt: new Date().toISOString(),
                }
              );
            }
          } catch (e) {
            console.error("Failed to parse message payload", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error(
          "Broker reported error:",
          frame.headers["message"]
        );
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // ---------------- CONTEXT VALUE ---------------- //

  return (
    <WebSocketContext.Provider
      value={{
        stompClient,

        // Toast notifications
        notifications,
        lastNotification,

        // Chat
        lastChatMessage,
        inboxPartners,
        refreshInbox: () =>
          session && fetchInbox(session.access_token),

        // Notification dropdown cache
        notificationsList,
        refreshNotifications: () =>
          session && fetchAllNotifications(session.access_token),

        activeChatUser,
        setActiveChatUser,
        showNotification,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
