import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User as ApiUser } from '../lib/api';

interface User extends ApiUser {
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withAvatar(user: ApiUser): User {
  return {
    ...user,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('api_token');

    if (!storedUser || !token) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('api_token');
    }

    api.me()
      .then(({ data }) => {
        const nextUser = withAvatar(data);
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
      })
      .catch(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('api_token');
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      const nextUser = withAvatar(response.data.user);
      localStorage.setItem('api_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.register(name, email, password);
      const nextUser = withAvatar(response.data.user);
      localStorage.setItem('api_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    api.logout().catch(() => undefined);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('api_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
