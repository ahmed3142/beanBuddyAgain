"use client";
import { useWebSocket } from "../context/WebSocketContext";

export default function InboxList({ onSelectUser }) {
  const { inboxPartners } = useWebSocket();
  const partners = inboxPartners || [];

  return (
    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
      {partners.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--text-soft)",
            fontSize: "0.9rem",
          }}
        >
          No messages yet.
        </div>
      ) : (
        partners.map((user) => {
          const unread = user.unreadCount || 0;
          const unreadLabel =
            unread > 0
              ? `${unread} unread message${unread > 1 ? "s" : ""}`
              : "All caught up";

          const baseBg =
            unread > 0 ? "rgba(30,64,175,0.55)" : "transparent";

          return (
            <div
              key={user.username}
              onClick={() => onSelectUser && onSelectUser(user.username)}
              style={{
                padding: "12px 15px",
                borderBottom: "1px solid rgba(31,41,55,0.95)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.2s, transform 0.08s",
                backgroundColor: baseBg,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(30,64,175,0.7)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = baseBg;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(148,163,184,0.5)",
                    color: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#e5e7eb",
                    }}
                  >
                    {user.username}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-soft)",
                    }}
                  >
                    {unreadLabel}
                  </div>
                </div>
              </div>

              {unread > 0 && (
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background:
                      "radial-gradient(circle, #38bdf8, #0ea5e9)",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px rgba(56,189,248,0.9)",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
