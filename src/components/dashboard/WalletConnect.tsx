import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function WalletConnect() {
  const { user, updateWallet } = useAuth();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState('');
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load current wallet on mount
  useState(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.wallet_address) {
            setCurrentWallet(data.wallet_address);
          }
        });
    }
  });

  const handleWalletConnect = async () => {
    if (!walletAddress.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid wallet',
        description: 'Please enter a valid wallet address',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateWallet(walletAddress);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: error.message,
        });
      } else {
        setCurrentWallet(walletAddress);
        setOpen(false);
        toast({
          title: 'Wallet connected!',
          description: 'Your wallet address has been updated.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentWallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected Wallet
          </CardTitle>
          <CardDescription>Your blockchain wallet address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <code className="text-sm bg-muted px-3 py-2 rounded">
              {currentWallet.slice(0, 6)}...{currentWallet.slice(-4)}
            </code>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Update</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Wallet Address</DialogTitle>
                  <DialogDescription>
                    Enter your new wallet address to update your profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleWalletConnect} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Wallet'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your blockchain wallet to participate in governance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Your Wallet</DialogTitle>
              <DialogDescription>
                Enter your wallet address to connect it to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleWalletConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
