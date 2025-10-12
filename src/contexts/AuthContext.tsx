
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { connectWallet as web3Connect } from '@/lib/web3';

interface AuthContextType {
  walletAddress: string | null;
  loading: boolean;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  signOut: () => void;
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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress(null);
    router.push('/Auth');
  };

  const connectWallet = async () => {
    const { address } = await web3Connect();
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
    // You can add logic here to sign a message and authenticate with a backend if needed
    return address;
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress(null);
  };

  const value = {
    walletAddress,
    loading,
    connectWallet,
    disconnectWallet,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
