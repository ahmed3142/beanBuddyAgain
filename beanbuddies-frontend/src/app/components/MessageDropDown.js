"use client";
import { useEffect, useRef } from "react";
import InboxList from "./InboxList";
import { useWebSocket } from "../context/WebSocketContext";

export default function MessagesDropdown({ onClose }) {
  const { setActiveChatUser } = useWebSocket();
  const dropdownRef = useRef(null);

  const handleSelectUser = (username) => {
    console.log("Selected user for chat:", username);
    if (username) {
      setActiveChatUser(username);
    }
    if (onClose) onClose();
  };

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

  return (
    <div ref={dropdownRef} className="dropdown-menu animate-blob-down">
      <div className="dropdown-header">Chats</div>

      <div className="dropdown-scroll-area">
        <InboxList onSelectUser={handleSelectUser} />
      </div>

      <div className="dropdown-footer">
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-soft)",
          }}
        >
          Select a conversation to start chatting
        </span>
      </div>
    </div>
  );
}
