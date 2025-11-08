import { useState } from 'react';
import { gaslessPaymentService } from '@/integrations/payments/gaslessPayment';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Wallet, CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  description: string;
  onSuccess: (txHash: string) => void;
}

export function PaymentDialog({ open, onOpenChange, amount, description, onSuccess }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'connect' | 'approve' | 'pay' | 'success'>('connect');
  const [balance, setBalance] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      await gaslessPaymentService.initialize();
      const address = await gaslessPaymentService.getWalletAddress();
      setWalletAddress(address);
      
      const bal = await gaslessPaymentService.getBalance(address);
      setBalance(bal);
      
      if (parseFloat(bal) < parseFloat(amount)) {
        toast({
          title: 'Insufficient Balance',
          description: `You need at least ${amount} USDT. Current balance: ${bal} USDT`,
          variant: 'destructive'
        });
        return;
      }
      
      setStep('pay');
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const receiverAddress = import.meta.env.VITE_PAYMENT_RECEIVER_ADDRESS;
      
      if (!receiverAddress) {
        throw new Error('Payment receiver address not configured');
      }

      const result = await gaslessPaymentService.transferUSDT({
        recipientAddress: receiverAddress,
        amount,
        description
      });

      if (result.success) {
        setStep('success');
        toast({
          title: 'Payment Successful',
          description: `Transaction: ${result.txHash.slice(0, 10)}...`
        });
        onSuccess(result.txHash);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay with USDT</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount to Pay</span>
              <span className="text-2xl font-bold">{amount} USDT</span>
            </div>
            {walletAddress && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Your Balance</span>
                <span className="text-sm font-medium">{balance} USDT</span>
              </div>
            )}
          </div>

          {step === 'connect' && (
            <Button onClick={handleConnect} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}

          {step === 'pay' && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
              </div>
              <Button onClick={handlePayment} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${amount} USDT`
                )}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed. The application will be updated shortly.
              </p>
              <Button onClick={() => onOpenChange(false)} className="mt-4">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
