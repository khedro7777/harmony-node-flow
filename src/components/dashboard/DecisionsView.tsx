import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Download, ExternalLink } from "lucide-react";

const DecisionsView = () => {
  const decisions = [
    {
      id: "1",
      title: "Q4 Marketing Budget Allocation",
      cid: "Qm...abc123",
      date: "2025-10-05",
      votes: { for: 85, against: 15 },
      outcome: "approved",
      txHash: "0x1234...5678"
    },
    {
      id: "2",
      title: "New Smart Contract Deployment",
      cid: "Qm...def456",
      date: "2025-10-01",
      votes: { for: 92, against: 8 },
      outcome: "approved",
      txHash: "0xabcd...efgh"
    },
    {
      id: "3",
      title: "Change Voting Quorum to 60%",
      cid: "Qm...ghi789",
      date: "2025-09-28",
      votes: { for: 45, against: 55 },
      outcome: "rejected",
      txHash: "0x9876...5432"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Decisions Archive</h2>
          <p className="text-muted-foreground">Immutable record of all governance decisions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              className="p-6 rounded-lg border hover:bg-muted/30 animate-smooth"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{decision.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{decision.date}</span>
                      <span>•</span>
                      <span className="font-mono">IPFS: {decision.cid}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    decision.outcome === "approved"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {decision.outcome}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votes For</p>
                  <p className="text-2xl font-bold text-success">{decision.votes.for}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votes Against</p>
                  <p className="text-2xl font-bold text-destructive">{decision.votes.against}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction</p>
                  <p className="font-mono text-sm">{decision.txHash}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on IPFS
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DecisionsView;
