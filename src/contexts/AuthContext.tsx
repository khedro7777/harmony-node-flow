import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { connectWallet as web3Connect } from '@/lib/web3';

interface AuthContextType {
  user: User | null;
  walletAddress: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  sendSignInLink: (email: string) => Promise<void>;
  signInWithLink: (email: string, url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }

    // Handle sign in with email link
    const emailLink = window.location.href;
    const email = window.localStorage.getItem('emailForSignIn');
    if (email && isSignInWithEmailLink(auth, emailLink)) {
        firebaseSignInWithEmailLink(auth, email, emailLink)
            .then(() => {
                window.localStorage.removeItem('emailForSignIn');
            })
            .catch((error) => {
                console.error("Sign in with email link error", error);
            });
    }


    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
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

  const sendSignInLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const signInWithLink = async (email: string, url: string) => {
      if (isSignInWithEmailLink(auth, url)) {
          await firebaseSignInWithEmailLink(auth, email, url)
      }
  }

  const value = {
    user,
    walletAddress,
    loading,
    signIn,
    signUp,
    signOut,
    connectWallet,
    disconnectWallet,
    sendSignInLink,
    signInWithLink
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
