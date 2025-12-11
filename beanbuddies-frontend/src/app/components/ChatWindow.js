"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";

// Accepts recipientUsername from GlobalChatWrapper OR otherUser prop
export default function ChatWindow({
  recipientUsername,
  otherUser: propOtherUser,
  onClose,
}) {
  const { stompClient, lastChatMessage, setActiveChatUser } = useWebSocket();
  const { session, profile } = useAuth();

  const otherUser = recipientUsername || propOtherUser || "Unknown";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  const isProduction = process.env.NODE_ENV === "production";
  const BACKEND_BASE_URL = isProduction
    ? "https://beanbuddyagain.onrender.com"
    : "http://localhost:8081";

  // 1) Set active chat + mark messages as read when opening
  useEffect(() => {
    if (!otherUser || otherUser === "Unknown") return;

    setActiveChatUser(otherUser);

    const markRead = async () => {
      try {
        await fetch(`${BACKEND_BASE_URL}/api/v1/chat/read/${otherUser}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
      } catch (e) {
        console.error("Failed to mark read:", e);
      }
    };
    markRead();

    return () => setActiveChatUser(null);
  }, [otherUser, setActiveChatUser, session, BACKEND_BASE_URL]);

  // 2) Load history with pagination
  const fetchMessages = async (pageNum, { scrollToBottom = true } = {}) => {
    if (isLoadingHistory || !otherUser) return;
    setIsLoadingHistory(true);

    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/chat/history/${otherUser}?page=${pageNum}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      const fetchedMsgs = data.messages || [];

      if (pageNum === 0) {
        setMessages(fetchedMsgs);
        if (scrollToBottom) {
          setTimeout(
            () =>
              messagesEndRef.current?.scrollIntoView({
                behavior: "auto",
              }),
            100
          );
        }
      } else {
        setMessages((prev) => [...fetchedMsgs, ...prev]);
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

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setMessages([]);
    fetchMessages(0);
  }, [otherUser]);

  // 2.5) Poll read status of last outgoing message
  useEffect(() => {
    if (!otherUser || otherUser === "Unknown" || !session || !profile?.username)
      return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/v1/chat/history/${otherUser}?page=0&size=20`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const data = await res.json();
        const fetchedMsgs = data.messages || [];

        setMessages((prev) => {
          if (!prev.length) return prev;
          const myUsername = profile.username;
          let lastMineIndex = -1;

          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].senderId === myUsername) {
              lastMineIndex = i;
              break;
            }
          }
          if (lastMineIndex === -1) return prev;

          const lastMine = prev[lastMineIndex];
          const serverVersion = fetchedMsgs.find((m) => m.id === lastMine.id);
          if (!serverVersion) return prev;

          const serverRead =
            (serverVersion.read ?? serverVersion.isRead) || false;
          const currentRead = (lastMine.read ?? lastMine.isRead) || false;

          if (serverRead === currentRead) return prev;

          const next = [...prev];
          next[lastMineIndex] = {
            ...lastMine,
            read: serverRead,
            isRead: serverRead,
          };
          return next;
        });
      } catch (e) {
        console.error("Poll read status failed", e);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [otherUser, session, BACKEND_BASE_URL, profile]);

  // 3) Listen to live messages
  useEffect(() => {
    if (!lastChatMessage) return;

    const isRelated =
      lastChatMessage.senderId === otherUser ||
      lastChatMessage.senderId === profile?.username;

    if (!isRelated) return;

    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].id === lastChatMessage.id)
        return prev;
      return [...prev, lastChatMessage];
    });

    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

    if (lastChatMessage.senderId === otherUser) {
      fetch(`${BACKEND_BASE_URL}/api/v1/chat/read/${otherUser}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }).catch((e) => console.error("Failed to mark read:", e));
    }
  }, [lastChatMessage, otherUser, profile, session, BACKEND_BASE_URL]);

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoadingHistory) {
      const currentHeight = e.target.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);

      fetchMessages(nextPage, { scrollToBottom: false }).then(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop =
            chatBodyRef.current.scrollHeight - currentHeight;
        }
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient) return;

    const chatDto = {
      recipientId: otherUser,
      content: newMessage,
    };

    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify(chatDto),
    });

    setNewMessage("");
  };

  return (
    <div style={styles.window} className="animate-blob-up">
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.avatar}>
            {otherUser?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "14px",
                color: "#e5e7eb",
              }}
            >
              {otherUser}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(148,163,184,0.85)",
              }}
            >
              
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={styles.closeBtn}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div style={styles.body} onScroll={handleScroll} ref={chatBodyRef}>
        {hasMore && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            <span
              className="spinner"
              style={{
                width: "16px",
                height: "16px",
              }}
            ></span>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === profile?.username;
          const isLast = i === messages.length - 1;
          const showAvatar =
            !isMe &&
            (i === messages.length - 1 ||
              messages[i + 1]?.senderId !== msg.senderId);

          const hasBeenRead = (msg.read ?? msg.isRead) || false;

          return (
            <div
              key={i}
              style={{
                ...styles.bubbleWrapper,
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              {!isMe && (
                <div
                  style={{
                    width: "28px",
                    marginRight: "5px",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  {showAvatar && (
                    <div style={styles.smallAvatar}>
                      {msg.senderId?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div style={{ maxWidth: "80%" }}>
                <div
                  style={{
                    ...styles.bubble,
                    background: isMe
                      ? "linear-gradient(135deg,#38bdf8,#6366f1)"
                      : "rgba(15,23,42,0.95)",
                    color: isMe ? "#0b1120" : "#e5e7eb",
                    borderBottomRightRadius: isMe ? "4px" : "18px",
                    borderBottomLeftRadius: !isMe ? "4px" : "18px",
                    borderTopRightRadius: "18px",
                    borderTopLeftRadius: "18px",
                  }}
                >
                  {msg.content}
                </div>

                {isMe && isLast && (
                  <div style={styles.statusText}>
                    {hasBeenRead ? "Seen" : "Delivered"}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER */}
      <form onSubmit={sendMessage} style={styles.footer}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Aa"
          style={styles.input}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={styles.sendBtn}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

const styles = {
  window: {
    width: "330px",
    height: "450px",
    background: "var(--surface-glass-strong)",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    boxShadow:
      "0 22px 60px rgba(15,23,42,0.98), 0 0 0 1px rgba(148,163,184,0.35)",
    display: "flex",
    flexDirection: "column",
    zIndex: 10000,
    fontFamily: "inherit",
    overflow: "hidden",
    color: "var(--text-main)",
  },
  header: {
    padding: "10px 12px",
    background:
      "linear-gradient(135deg,rgba(56,189,248,0.95),rgba(99,102,241,0.98))",
    borderBottom: "1px solid rgba(15,23,42,0.75)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 20% 0%,rgba(248,250,252,0.8),rgba(30,64,175,0.8))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#0b1120",
    boxShadow: "0 0 0 2px rgba(15,23,42,0.6)",
  },
  smallAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#e5e7eb",
  },
  closeBtn: {
    background: "rgba(15,23,42,0.3)",
    borderRadius: "999px",
    border: "none",
    fontSize: "17px",
    cursor: "pointer",
    color: "#e5e7eb",
    padding: "4px 8px",
    marginRight: "5px",
  },
  body: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background:
      "radial-gradient(circle at top,rgba(15,23,42,0.9),rgba(15,23,42,1))",
  },
  bubbleWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "flex-end",
    marginBottom: "4px",
  },
  bubble: {
    maxWidth: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    lineHeight: "1.45",
    wordWrap: "break-word",
    boxShadow: "0 4px 10px rgba(15,23,42,0.9)",
  },
  statusText: {
    fontSize: "10px",
    color: "var(--text-soft)",
    marginTop: "4px",
    textAlign: "right",
  },
  footer: {
    padding: "10px",
    borderTop: "1px solid rgba(31,41,55,0.95)",
    background: "rgba(15,23,42,0.98)",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "999px",
    border: "1px solid var(--border-subtle)",
    backgroundColor: "rgba(15,23,42,0.9)",
    outline: "none",
    fontSize: "13px",
    color: "var(--text-main)",
  },
  sendBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: "18px",
    cursor: "pointer",
    padding: "0 5px",
  },
};
