import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Auth() {
  const navigate = useNavigate();
  const { connectWallet, isWalletConnected, loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // If already connected, redirect to dashboard
  useEffect(() => {
    if (isWalletConnected && user?.isConnected) {
      navigate('/dashboard');
    }
  }, [isWalletConnected, user, navigate]);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      await connectWallet();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Checking wallet connection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">GPO DAO Board</CardTitle>
          <CardDescription className="text-base">
            Decentralized Governance Platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Section */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-white">How it works:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Connect your wallet to access the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>No personal data or financial information is stored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>All transactions use gasless technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Powered by Biconomy and SnapDAO</span>
                </li>
              </ul>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {isWalletConnected && user?.isConnected && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Wallet connected successfully: {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Connect Wallet Button */}
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting || isWalletConnected}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : isWalletConnected && user?.isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Connected
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          {/* Supported Wallets Info */}
          <div className="text-center text-xs text-slate-400">
            <p>Supported: MetaMask, WalletConnect, Coinbase Wallet, and more</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 text-sm text-slate-400 border-t border-slate-700 pt-4">
          <p className="text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a href="#" className="hover:text-primary transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition">Terms of Service</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
