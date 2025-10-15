import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, FileText, Gavel, MessageSquare, Wallet, Settings, LogOut, Archive, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CompanyOverview from "@/components/dashboard/CompanyOverview";
import ProposalsView from "@/components/dashboard/ProposalsView";
import ArbitrationView from "@/components/dashboard/ArbitrationView";
import ChatView from "@/components/dashboard/ChatView";
import TreasuryView from "@/components/dashboard/TreasuryView";
import AdminView from "@/components/dashboard/AdminView";
import DecisionsView from "@/components/dashboard/DecisionsView";

type View = "overview" | "proposals" | "arbitration" | "chat" | "treasury" | "decisions" | "admin" | "settings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, walletAddress, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>("overview");

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">GPO DAO</h1>
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
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentView(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
