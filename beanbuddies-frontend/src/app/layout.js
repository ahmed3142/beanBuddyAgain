// app/layout.js
import './globals.css'
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';

export const metadata = {
  title: 'BeanBuddies',
  description: 'Your new favorite course platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <body> tag is styled by globals.css */}
      <body>
        <AuthProvider>
          <Header />
          {/* <main> tag is styled by globals.css */}
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}