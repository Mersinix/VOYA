import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile, AuthResponse } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Wire the auth token into every API request via the custom-fetch layer
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("accessToken"));
    return () => {
      setAuthTokenGetter(null);
    };
  }, []);

  const { data: user, isLoading: isUserLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      // Token is invalid
      logout();
    }
  }, [isError]);

  const login = (data: AuthResponse) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setToken(data.accessToken);
    queryClient.setQueryData(getGetMeQueryKey(), data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    setLocation("/login");
  };

  // Wait for initial token validation if token exists
  const isLoading = !!token && isUserLoading;

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
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

export function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType<any>, allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to correct dashboard based on role
      setLocation(`/${user.role}`);
    }
  }, [isLoading, isAuthenticated, setLocation, allowedRoles, user]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <Component />;
}
