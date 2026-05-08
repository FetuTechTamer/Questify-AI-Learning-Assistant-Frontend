import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

export interface User {
  user_id: string;
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  avatarUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchAvatar = async () => {
    try {
      const blobUrl = await authService.getAvatar();
      setAvatarUrl(blobUrl);
    } catch (error) {
      console.error("Failed to fetch avatar blob:", error);
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const [profile] = await Promise.all([
        authService.getProfile(),
        fetchAvatar()
      ]);
      console.log('User profile and avatar refreshed');
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setSession({ access_token: token });
        try {
          const [profile] = await Promise.all([
            authService.getProfile(),
            fetchAvatar()
          ]);
          console.log('User profile and avatar loaded on mount');
          setUser(profile);
          setIsAdmin(profile?.role === 'admin');
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem('access_token');
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
      const data = await authService.login(email, password);
      const token = data?.access_token || localStorage.getItem('access_token');
      
      if (token) {
        setSession({ access_token: token });
        const [profile] = await Promise.all([
          authService.getProfile(),
          fetchAvatar()
        ]);
        setUser(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        throw new Error('No token received from login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      await authService.register(fullName || '', email, password);
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    authService.logout();
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
      refreshProfile,
      avatarUrl,
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
