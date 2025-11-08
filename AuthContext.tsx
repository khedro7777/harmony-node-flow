import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface WalletUser {
  address: string;
  isConnected: boolean;
  chainId?: number;
}

interface AuthContextType {
  user: WalletUser | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isWalletConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WalletUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const navigate = useNavigate();

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts && accounts.length > 0) {
            const chainId = await window.ethereum.request({
              method: 'eth_chainId',
            });

            setUser({
              address: accounts[0],
              isConnected: true,
              chainId: parseInt(chainId, 16),
            });
            setIsWalletConnected(true);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setUser({
            address: accounts[0],
            isConnected: true,
            chainId: user?.chainId,
          });
          setIsWalletConnected(true);
        } else {
          setUser(null);
          setIsWalletConnected(false);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        if (user) {
          setUser({
            ...user,
            chainId: parseInt(chainId, 16),
          });
        }
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners?.('accountsChanged');
        window.ethereum.removeAllListeners?.('chainChanged');
      }
    };
  }, [user?.chainId]);

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      setLoading(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        const walletUser: WalletUser = {
          address: accounts[0],
          isConnected: true,
          chainId: parseInt(chainId, 16),
        };

        setUser(walletUser);
        setIsWalletConnected(true);

        // Navigate to dashboard after successful connection
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setUser(null);
      setIsWalletConnected(false);
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        connectWallet,
        disconnectWallet,
        isWalletConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
