import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { user, sendSignInLink, signInWithLink } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
      const emailForSignIn = window.localStorage.getItem("emailForSignIn");
      if(user) {
        navigate("/dashboard");
      }
      else if(emailForSignIn) {
          signInWithLink(emailForSignIn, window.location.href)
            .then(() => {
                window.localStorage.removeItem("emailForSignIn");
                navigate("/dashboard");
            })
            .catch(err => {
                toast({
                    title: "Login Failed",
                    description: err.message,
                    variant: "destructive"
                })
            })
      }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendSignInLink(email);
      toast({ title: "Login link sent", description: "Check your email for the login link." });
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message,
        variant: "destructive" 
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
          onClick={() => navigate("/")}
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending link..." : "Login with Email"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
