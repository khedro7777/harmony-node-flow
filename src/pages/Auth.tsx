
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const router = useRouter();
  const { walletAddress, connectWallet } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      router.push("/Dashboard");
    }
  }, [walletAddress, router]);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      await connectWallet();
      toast({ title: "Wallet Connected", description: "You are now logged in." });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to GPO DAO</h1>
            <p className="text-muted-foreground">
              Decentralized governance & arbitration platform
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <Button onClick={handleConnectWallet} className="w-full" disabled={loading}>
              <Wallet className="h-4 w-4 mr-2" />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
