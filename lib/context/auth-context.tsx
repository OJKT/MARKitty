"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { AuthState, UserProfile } from "@/lib/types/cover-sheet";

const mockUser: UserProfile = {
  id: "mock-user-1",
  name: "John Doe",
  email: "john.doe@university.edu",
  institution: "Sample University"
};

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null
  });

  const login = useCallback(() => {
    setAuthState({
      isLoggedIn: true,
      user: mockUser
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isLoggedIn: false,
      user: null
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 