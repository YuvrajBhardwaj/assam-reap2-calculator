
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ApiService, LoginRequest } from '../services/adminService';

type UserRole = 'ROLE_NormalUser' | 'ROLE_ADMIN' | 'ROLE_JuniorManager' | 'ROLE_Manager' | 'ROLE_SeniorManager' | 'user';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  loginId: string | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  simpleLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loginId, setLoginId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('authToken');
    const storedLoginId = localStorage.getItem('loginId');
    const storedRole = localStorage.getItem('userRole') as UserRole;
    
    if (storedToken && storedLoginId && storedRole) {
      setToken(storedToken);
      setLoginId(storedLoginId);
      setUserRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await ApiService.login(credentials);
      setToken(response.jwt);
      setLoginId(response.loginId);
      
      // Determine role based on the roles array in the response
      let role: UserRole = 'user'; // Default role
      if (response.roles && response.roles.length > 0) {
        // Assuming the first role in the array is the primary role for display
        // You might want to implement more complex logic if a user can have multiple roles
        const primaryRole = response.roles[0];
        if (['ROLE_NormalUser', 'ROLE_ADMIN', 'ROLE_JuniorManager', 'ROLE_Manager', 'ROLE_SeniorManager'].includes(primaryRole)) {
          role = primaryRole as UserRole;
        }
      }
      
      setUserRole(role);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('authToken', response.jwt);
      localStorage.setItem('loginId', response.loginId);
      localStorage.setItem('userRole', role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const simpleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    setToken(null);
    setLoginId(null);
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginId');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      loginId, 
      token, 
      login, 
      simpleLogin,
      switchRole, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
