import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, FileText, Gavel, MessageSquare, Wallet, Settings, LogOut, Archive, Shield, Loader2, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CompanyOverview from "@/components/dashboard/CompanyOverview";
import ProposalsView from "@/components/dashboard/ProposalsView";
import ArbitrationView from "@/components/dashboard/ArbitrationView";
import ChatView from "@/components/dashboard/ChatView";
import TreasuryView from "@/components/dashboard/TreasuryView";
import AdminView from "@/components/dashboard/AdminView";
import DecisionsView from "@/components/dashboard/DecisionsView";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

type View = "overview" | "proposals" | "arbitration" | "chat" | "treasury" | "decisions" | "admin" | "settings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, walletAddress, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    if (!walletAddress) {
      // setError("Wallet not connected. Some features may be disabled.");
    }

    return () => clearTimeout(timer);
  }, [walletAddress]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { id: "overview" as View, label: "Overview", icon: Home },
    { id: "proposals" as View, label: "Proposals", icon: FileText },
    { id: "decisions" as View, label: "Decisions", icon: Archive },
    { id: "arbitration" as View, label: "Arbitration", icon: Gavel },
    { id: "chat" as View, label: "Chat", icon: MessageSquare },
    { id: "treasury" as View, label: "Treasury", icon: Wallet },
    { id: "admin" as View, label: "Admin", icon: Shield },
    { id: "settings" as View, label: "Settings", icon: Settings },
  ];

  const sidebarVariants = {
    hidden: { x: -250 },
    visible: { x: 0, transition: { duration: 0.5 } },
  };

  const mainVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3 } },
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <motion.aside 
        className={`w-64 border-r border-border bg-card p-6 flex-col shadow-lg fixed h-full z-20 md:relative md:flex ${isSidebarOpen ? 'flex' : 'hidden'}`}
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">GPO DAO</h1>
          <p className="text-sm text-muted-foreground mt-1">Decentralized Governance</p>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-1">{user?.email}</p>
          {walletAddress && (
            <Badge variant="outline" className="text-xs font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Badge>
          )}
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {setCurrentView(item.id); setSidebarOpen(false)}}
                disabled={loading}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </nav>

        <div className="pt-6 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        className="flex-1 overflow-auto"
        variants={mainVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center p-4">
            <div className="md:hidden">
                <Button onClick={() => setSidebarOpen(!isSidebarOpen)}><Menu /></Button>
            </div>
            <div className="flex-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
        </div>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="p-8 pt-0"
            >
              {error && <div className="text-center py-4 text-destructive">{error}</div>}
              {currentView === "overview" && <CompanyOverview />}
              {currentView === "proposals" && <ProposalsView />}
              {currentView === "decisions" && <DecisionsView />}
              {currentView === "arbitration" && <ArbitrationView />}
              {currentView === "chat" && <ChatView />}
              {currentView === "treasury" && <TreasuryView />}
              {currentView === "admin" && <AdminView />}
              {currentView === "settings" && (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">Configure your preferences here.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
