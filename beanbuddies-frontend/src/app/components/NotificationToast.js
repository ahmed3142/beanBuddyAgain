"use client";

import { useRouter } from "next/navigation";
import { useWebSocket } from "../context/WebSocketContext";

const containerStyle = {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  zIndex: 1100,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const baseToastStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: "260px",
  maxWidth: "360px",
  background: "var(--surface-glass)",
  color: "var(--text-main)",
  padding: "10px 14px",
  borderRadius: "14px",
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.95), 0 0 0 1px rgba(148,163,184,0.38)",
  cursor: "pointer",
  transition:
    "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease",
};

const iconWrapperStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(148,163,184,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const messageStyle = {
  fontWeight: 600,
  fontSize: "0.9rem",
  marginBottom: 2,
};

const metaStyle = {
  fontSize: "0.75rem",
  opacity: 0.7,
};

export default function NotificationToast() {
  const { notifications, setActiveChatUser } = useWebSocket();
  const router = useRouter();

  if (!notifications || notifications.length === 0) return null;

  const handleClick = (notif) => {
    console.log("🔥 Toast clicked:", notif);

    const rawType = notif.type ?? notif.notificationType ?? notif.kind;
    const type = rawType ? String(rawType).toUpperCase() : null;
    const refId =
      notif.referenceId ?? notif.refId ?? notif.targetId ?? null;

    if (type === "MESSAGE") {
      const chatUser =
        refId ??
        notif.senderUsername ??
        notif.senderId ??
        null;

      if (!chatUser) return;
      setActiveChatUser(chatUser);
      return;
    }

    if (type === "COURSE" || type === "LESSON") {
      if (!refId) return;
      router.push(`/course/${refId}`);
      return;
    }
  };

  return (
    <div style={containerStyle}>
      {notifications.map((notif, index) => {
        const rawType = notif.type ?? notif.notificationType ?? notif.kind;
        const type = rawType ? String(rawType).toUpperCase() : null;

        const borderColor =
          type === "MESSAGE"
            ? "#38bdf8"
            : type === "COURSE" || type === "LESSON"
            ? "#22c55e"
            : "#a855f7";

        const toastStyle = {
          ...baseToastStyle,
          borderLeft: `4px solid ${borderColor}`,
          opacity: notif.read ? 0.9 : 1,
        };

        return (
          <div
            key={notif.id ?? index}
            onClick={() => handleClick(notif)}
            className="toast-fade-in"
            style={toastStyle}
          >
            <div style={iconWrapperStyle}>
              <span style={{ fontSize: "1.1rem" }}>
                {type === "MESSAGE"
                  ? "💬"
                  : type === "COURSE" || type === "LESSON"
                  ? "📚"
                  : "🔔"}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={messageStyle}>{notif.message}</div>
              <div style={metaStyle}>
                {notif.createdAt
                  ? new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .toast-fade-in {
          animation: toastFadeIn 0.2s ease-out;
        }
        @keyframes toastFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
