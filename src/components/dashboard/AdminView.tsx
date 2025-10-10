import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, Shield, Search, MoreVertical } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "arbiter";
  status: "active" | "pending";
  shares: string;
}

interface ConfigSetting {
  id: string;
  key: string;
  value: string;
  description: string;
}

const AdminView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [configSettings, setConfigSettings] = useState<ConfigSetting[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);

        // Fetch config settings
        const configCollection = collection(db, "config");
        const configSnapshot = await getDocs(configCollection);
        const configList = configSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConfigSetting));
        setConfigSettings(configList);

      } catch (error) {
        console.error("Error fetching admin data: ", error);
        // Fallback to dummy data
        setUsers(dummyUsers);
        setConfigSettings(dummyConfigSettings);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          <p className="text-muted-foreground">Manage users, roles, and configuration</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Shield className="h-3 w-3 mr-1" />
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>Add User</Button>
            </div>

            <div className="space-y-4">
              {users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 animate-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {user.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : user.role === "arbiter"
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {user.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Shares: {user.shares}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {user.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Platform Configuration</h3>
            <div className="space-y-6">
              {configSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold">{setting.key}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg">{setting.value}</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const dummyUsers: User[] = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active", shares: "15%" },
    { id: "2", name: "Bob Smith", email: "bob@example.com", role: "member", status: "active", shares: "10%" },
    { id: "3", name: "Carol White", email: "carol@example.com", role: "arbiter", status: "active", shares: "8%" },
    { id: "4", name: "David Lee", email: "david@example.com", role: "member", status: "pending", shares: "5%" }
];

const dummyConfigSettings: ConfigSetting[] = [
    { id: "1", key: "Proposal Token Cost", value: "50 tokens", description: "Tokens deducted per proposal" },
    { id: "2", key: "Arbitration Filing Fee", value: "$250", description: "Fee to file a dispute case" },
    { id: "3", key: "Voting Quorum", value: "51%", description: "Minimum votes required for decisions" },
    { id: "4", key: "Multi-sig Threshold", value: "7/10", description: "Signatories required for treasury" }
];

export default AdminView;
