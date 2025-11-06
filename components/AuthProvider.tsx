'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      setUser(user);
      if (user) {
        console.log('👤 Fetching user profile for:', user.uid);
        const profile = await getUserProfile(user.uid);
        console.log('👤 User profile loaded:', profile);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sign in successful');
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('🔐 Attempting sign up for:', email);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User account created:', user.uid);
    await createUserProfile(user.uid, name, email);
    console.log('✅ Sign up process completed');
  };

  const logout = async () => {
    console.log('🚪 Logging out user');
    await signOut(auth);
    console.log('✅ User logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}