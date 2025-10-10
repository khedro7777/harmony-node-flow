import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Transaction {
  id: string;
  type: "incoming" | "outgoing" | "pending";
  amount: string;
  from?: string;
  to?: string;
  date: string;
  status: "completed" | "pending";
  approvals?: string;
}

const TreasuryView = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalBalance: "$0",
    totalInflow: "$0",
    totalOutflow: "$0",
    inflowChange: "+0%",
    outflowChange: "-0%",
  });

  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        const transactionsCollection = collection(db, "transactions");
        const transactionSnapshot = await getDocs(transactionsCollection);
        const transactionsList = transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(transactionsList);

        // Calculate stats (simplified)
        const totalInflow = transactionsList
          .filter(tx => tx.type === 'incoming')
          .reduce((acc, tx) => acc + parseFloat(tx.amount.replace(/[^0-9.-]+/g, "")), 0);
        
        const totalOutflow = transactionsList
          .filter(tx => tx.type === 'outgoing')
          .reduce((acc, tx) => acc + parseFloat(tx.amount.replace(/[^0-9.-]+/g, "")), 0);

        const totalBalance = totalInflow - totalOutflow;

        setStats({
          totalBalance: `$${totalBalance.toLocaleString()}`,
          totalInflow: `$${totalInflow.toLocaleString()}`,
          totalOutflow: `$${totalOutflow.toLocaleString()}`,
          inflowChange: "+12.5%", // Dummy data
          outflowChange: "-8.3%", // Dummy data
        });

      } catch (error) {
        console.error("Error fetching treasury data: ", error);
        // Fallback to dummy data
        setTransactions(dummyTransactions);
        setStats({
            totalBalance: "$125,450",
            totalInflow: "$45,230",
            totalOutflow: "$12,780",
            inflowChange: "+12.5%",
            outflowChange: "-8.3%",
        });
      }
    };

    fetchTreasuryData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Treasury</h2>
          <p className="text-muted-foreground">Manage organization funds</p>
        </div>
        <Button className="shadow-glow">
          <Wallet className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 gradient-primary text-white">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Multi-sig
            </Badge>
          </div>
          <p className="text-sm opacity-90 mb-2">Total Balance</p>
          <p className="text-3xl font-bold">{stats.totalBalance}</p>
          <p className="text-sm opacity-75 mt-2">≈ {stats.totalBalance.replace("$", "")} USDC</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-success" />
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {stats.inflowChange}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Total Inflow</p>
          <p className="text-3xl font-bold">{stats.totalInflow}</p>
          <p className="text-sm text-muted-foreground mt-2">This month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <ArrowDownRight className="h-8 w-8 text-destructive" />
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {stats.outflowChange}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Total Outflow</p>
          <p className="text-3xl font-bold">{stats.totalOutflow}</p>
          <p className="text-sm text-muted-foreground mt-2">This month</p>
        </Card>
      </div>

      {/* Multi-sig Info */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
            7/10
          </div>
          <div>
            <h3 className="font-semibold mb-1">Multi-Signature Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Transactions require approval from 7 out of 10 signatories (70% threshold).
              Current signatories are elected board members holding ≥5% shares.
            </p>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 animate-smooth"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tx.type === "incoming"
                      ? "bg-success/10 text-success"
                      : tx.type === "outgoing"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {tx.type === "incoming" ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : tx.type === "outgoing" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{tx.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === "incoming" ? `From: ${tx.from}` : `To: ${tx.to}`}
                  </p>
                  {tx.approvals && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Approvals: {tx.approvals}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={
                    tx.status === "completed"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }
                >
                  {tx.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const dummyTransactions: Transaction[] = [
    {
      id: "1",
      type: "incoming",
      amount: "5,000 USDC",
      from: "Investor Round A",
      date: "2025-10-08",
      status: "completed"
    },
    {
      id: "2",
      type: "outgoing",
      amount: "1,500 USDC",
      to: "Marketing Budget",
      date: "2025-10-07",
      status: "completed",
      approvals: "8/10"
    },
    {
      id: "3",
      type: "pending",
      amount: "2,000 USDC",
      to: "Development Team",
      date: "2025-10-06",
      status: "pending",
      approvals: "5/10"
    }
  ];

export default TreasuryView;
