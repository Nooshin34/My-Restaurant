import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, TOKEN_KEY } from "../api/client.ts";
import type { AuthResponse, User } from "../api/types.ts";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }

    api
      .get<User>("/api/auth/me")
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true));
  }, []);

  const persist = (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.token);
    setUser(auth.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
    persist(data);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/api/auth/register", { fullName, email, password });
    persist(data);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
