import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  FileCheck, 
  Gavel, 
  Users, 
  Wallet, 
  MessageSquare,
  Shield,
  Menu,
  Bell,
  Search,
  Plus,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnect } from "@/components/dashboard/WalletConnect";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CompanyOverview from "@/components/dashboard/CompanyOverview";
import ProposalsView from "@/components/dashboard/ProposalsView";
import ArbitrationView from "@/components/dashboard/ArbitrationView";
import CompanyApplications from "@/components/dashboard/CompanyApplications";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold">GPO DAO Board</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Avatar>
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Acme Corporation</h1>
            <p className="text-muted-foreground">Delaware C-Corp • Founded Jan 2025</p>
          </div>
          <Button className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="arbitration" className="gap-2">
              <Gavel className="h-4 w-4" />
              Arbitration
            </TabsTrigger>
            <TabsTrigger value="shareholders" className="gap-2">
              <Users className="h-4 w-4" />
              Shareholders
            </TabsTrigger>
            <TabsTrigger value="treasury" className="gap-2">
              <Wallet className="h-4 w-4" />
              Treasury
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="mb-6">
            <WalletConnect />
          </div>
          <CompanyApplications />
          <CompanyOverview />
        </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <ProposalsView />
          </TabsContent>

          <TabsContent value="arbitration" className="space-y-6">
            <ArbitrationView />
          </TabsContent>

          <TabsContent value="shareholders" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Shareholders</h2>
              <p className="text-muted-foreground">Shareholder management coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Treasury</h2>
              <p className="text-muted-foreground">Treasury management coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
              <p className="text-muted-foreground">Chat functionality coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
