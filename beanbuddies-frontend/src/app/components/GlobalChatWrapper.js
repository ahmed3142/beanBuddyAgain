"use client";
import { useWebSocket } from "../context/WebSocketContext";
import ChatWindow from "./ChatWindow";

export default function GlobalChatWrapper() {
  const { activeChatUser, setActiveChatUser } = useWebSocket();

  if (!activeChatUser) return null;

  return (
    <div className="global-chat-wrapper">
      <div className="global-chat-container">
        <ChatWindow
          recipientUsername={activeChatUser}
          onClose={() => setActiveChatUser(null)}
        />
      </div>
    </div>
  );
}
