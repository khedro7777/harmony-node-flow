
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { connectWallet as web3Connect } from '@/lib/web3';
import jwt_decode from 'jwt-decode';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  walletAddress: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwt_decode(token);
      setUser({ id: decoded.userId, email: decoded.email, roles: decoded.roles });
    }
    setLoading(false);

    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('token', token);
      const decoded: any = jwt_decode(token);
      setUser({ id: decoded.userId, email: decoded.email, roles: decoded.roles });
      router.push('/');
    } else {
      throw new Error('Login failed');
    }
  };

  const signUp = async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/auth'); // Redirect to login page after successful registration
    } else {
      throw new Error('Registration failed');
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    router.push('/auth');
  };

  const connectWallet = async () => {
    const { address } = await web3Connect();
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
    return address;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
  };

  const value = {
    user,
    walletAddress,
    loading,
    signIn,
    signUp,
    signOut,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
