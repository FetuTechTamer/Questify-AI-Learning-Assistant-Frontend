import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "@/services/api";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: any;
}

export interface Session {
  access_token: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setSession({ access_token: token });
        try {
          const profile = await API.getUserProfile();
          setUser(profile);
          setIsAdmin(profile?.role === 'admin');
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem('token');
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await API.login(email, password);
      // Handle different possible backend token structures
      const token = data?.access_token || data?.token || (typeof data === 'string' ? data : null);
      
      if (token) {
        localStorage.setItem('token', token);
        setSession({ access_token: token });
        const profile = await API.getUserProfile();
        setUser(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        throw new Error('No token received from login');
      }
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error };
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      await API.register(fullName || '', email, password);
      // Auto-login after successful registration
      return await login(email, password);
    } catch (error: any) {
      console.error('Register error:', error);
      return { error };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  // Aliases to maintain compatibility with existing codebase
  const signIn = login;
  const signUp = register;
  const signOut = logout;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      login,
      register,
      logout,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}