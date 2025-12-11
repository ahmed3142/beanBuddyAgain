"use client";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";

export default function NotificationDropdown({ onClose }) {
  const { session } = useAuth();
  const {
    setActiveChatUser,
    lastNotification,
    notificationsList,
    refreshNotifications,
  } = useWebSocket();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const isProduction = process.env.NODE_ENV === "production";
  const BACKEND_URL = isProduction
    ? "https://beanbuddyagain.onrender.com"
    : "http://localhost:8081";

  const notifications = useMemo(() => {
    const base = Array.isArray(notificationsList) ? notificationsList : [];

    if (!lastNotification || !lastNotification.id) return base;

    const exists = base.some((n) => n.id === lastNotification.id);
    return exists ? base : [lastNotification, ...base];
  }, [notificationsList, lastNotification]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownEl = dropdownRef.current;
      if (!dropdownEl) return;

      const clickedInsideDropdown = dropdownEl.contains(event.target);
      const clickedOnHeaderIcon = event.target.closest(".icon-btn-container");

      if (!clickedInsideDropdown && !clickedOnHeaderIcon) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleNotificationClick = async (notif) => {
    console.log("🔔 CLICKED NOTIFICATION:", notif);

    if (!notif.read && notif.id && session) {
      try {
        await fetch(`${BACKEND_URL}/api/v1/notifications/${notif.id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (typeof refreshNotifications === "function") {
          refreshNotifications();
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    const type = notif.type ?? notif.notificationType ?? notif.kind;
    const refId =
      notif.referenceId ?? notif.refId ?? notif.targetId ?? null;

    if (type === "MESSAGE") {
      const chatUser =
        refId ??
        notif.senderUsername ??
        notif.senderId ??
        null;

      if (chatUser) {
        setActiveChatUser(chatUser);
        onClose?.();
      } else {
        console.warn(
          "Message notification missing sender / referenceId",
          notif
        );
      }
    } else if (type === "COURSE" || type === "LESSON") {
      if (refId) {
        onClose?.();
        router.push(`/course/${refId}`);
      } else {
        console.warn(
          "Course/Lesson notification missing referenceId",
          notif
        );
      }
    } else {
      console.log("Notification clicked with no redirect type:", type);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="notification-dropdown animate-blob-down"
    >
      <div className="notification-dropdown-header">Notifications</div>

      <div className="notification-dropdown-list">
        {(!notifications || notifications.length === 0) && (
          <div className="notification-empty">No notifications yet</div>
        )}

        {notifications.map((notif) => (
          <div
            key={notif.id ?? `${notif.message}-${notif.createdAt}`}
            className={`notification-item ${
              notif.read ? "notification-read" : ""
            }`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div className="notification-message">{notif.message}</div>
            <div className="notification-meta">
              {notif.createdAt
                ? new Date(notif.createdAt).toLocaleString()
                : "Just now"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
