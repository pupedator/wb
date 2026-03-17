import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authApi, setAuthTokens, clearAuthTokens, isAuthenticated, handleApiError } from '../services/api';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await authApi.getProfile();
          if (response.data.success) {
            setUser(response.data.data!.user);
          } else {
            clearAuthTokens();
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          clearAuthTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data!;
        setAuthTokens(tokens);
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password);
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data!;
        setAuthTokens(tokens);
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        throw new Error(response.data.error?.message || 'Registration failed');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const logout = async () => {
    try {
      if (isAuthenticated()) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthTokens();
      localStorage.removeItem('userData');
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for protected routes
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading };
};

// Hook for admin routes
export const useRequireAdmin = () => {
  const { user, loading, isAdmin } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/login';
      } else if (!isAdmin) {
        window.location.href = '/';
      }
    }
  }, [user, loading, isAdmin]);

  return { user, loading, isAdmin };
};
