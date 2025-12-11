// app/context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getMyProfile } from '../lib/api'; 

// Create the context
const AuthContext = createContext();

// Create a "provider" component that will wrap our entire app
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // --- NOTUN LOGIC ---
        // Session thakle, user profile-tao fetch kore felbo
        try {
          const profileData = await getMyProfile(session.access_token);
          setProfile(profileData);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          // Ekhane token expire hole session null kore deya jete pare
          // setSession(null); 
        }
      }
      setLoading(false);
    };
    
    getSession();

    // 2. Listen for changes in auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          // User login korle, abar profile fetch korbo
          try {
            const profileData = await getMyProfile(session.access_token);
            setProfile(profileData);
          } catch (error) {
            console.error("Failed to fetch profile on auth change:", error);
          }
        } else {
          // User logout korle, profile null kore dibo
          setProfile(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // The "value" is what we make available to all our pages
  const value = {
    session,
    profile, // <-- NOTUN PROFILE EKHANE ADD HOBE
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  // We don't render anything until we've checked for a session
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to easily use the context
export function useAuth() {
  return useContext(AuthContext);
}