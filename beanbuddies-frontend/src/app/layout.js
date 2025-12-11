import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Header from "./components/Header"; // <--- IMPORT THIS
import NotificationToast from "./components/NotificationToast";
import GlobalChatWrapper from "./components/GlobalChatWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BeanBuddies",
  description: "Learn and Grow Together",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WebSocketProvider>
            {/* Header goes here so it appears on all pages */}
            <Header /> 
            
            <main>
              {children}
            </main>

            <NotificationToast />
            <GlobalChatWrapper />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}