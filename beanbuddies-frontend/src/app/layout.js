// app/layout.js
import './globals.css'
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext'; // <-- IMPORT ADDED
import Header from './components/Header';
import NotificationToast from './components/NotificationToast'; // <-- IMPORT ADDED

export const metadata = {
  title: 'BeanBuddies',
  description: 'Your new favorite course platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* WebSocket Provider AuthProvider-er bhitore thaka lagbe */}
          <WebSocketProvider> 
            <Header />
            
            <main>
              {children}
            </main>

            {/* Global Notification Container */}
            <NotificationToast /> 
            
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}