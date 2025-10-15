import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, FileText, AlertCircle, CheckCircle, Clock, Upload, User, Calendar, Hash } from "lucide-react";
import ArbitrationFileDispute from "./ArbitrationFileDispute";
import ArbitrationCaseDetail from "./ArbitrationCaseDetail";

const ArbitrationView = () => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showFileDispute, setShowFileDispute] = useState(false);

  if (showFileDispute) {
    return <ArbitrationFileDispute onBack={() => setShowFileDispute(false)} />;
  }

  if (selectedCase) {
    const caseData = cases.find(c => c.id === selectedCase);
    if (caseData) {
      return <ArbitrationCaseDetail case={caseData} onBack={() => setSelectedCase(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Arbitration Center</h2>
          <p className="text-muted-foreground">Dispute resolution with transparency and fairness</p>
        </div>
        <Button onClick={() => setShowFileDispute(true)} className="shadow-glow">
          <FileText className="h-4 w-4 mr-2" />
          File New Dispute
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cases List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Cases</TabsTrigger>
          <TabsTrigger value="pending">Pending Assignment</TabsTrigger>
          <TabsTrigger value="closed">Closed Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {cases.filter(c => c.status === "In Hearing" || c.status === "Under Review").map((case_) => (
            <CaseCard key={case_.id} case={case_} onClick={() => setSelectedCase(case_.id)} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {cases.filter(c => c.status === "Submitted").map((case_) => (
            <CaseCard key={case_.id} case={case_} onClick={() => setSelectedCase(case_.id)} />
          ))}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {cases.filter(c => c.status === "Ruling" || c.status === "Closed").map((case_) => (
            <CaseCard key={case_.id} case={case_} onClick={() => setSelectedCase(case_.id)} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface Case {
  id: string;
  caseId: string;
  title: string;
  category: string;
  complainant: string;
  defendant: string;
  status: string;
  priority: string;
  filed: string;
  lastUpdate: string;
  evidenceCount: number;
  arbitrator?: string;
  description?: string;
  timeline?: Array<{ date: string; event: string; description: string }>;
  evidence?: Array<{ name: string; type: string; uploadedBy: string; date: string }>;
  ruling?: string;
}

const CaseCard = ({ case: case_, onClick }: { case: Case; onClick: () => void }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Submitted": "bg-warning/10 text-warning border-warning/20",
      "Under Review": "bg-primary/10 text-primary border-primary/20",
      "In Hearing": "bg-accent/10 text-accent border-accent/20",
      "Ruling": "bg-success/10 text-success border-success/20",
      "Closed": "bg-muted text-muted-foreground border-border",
    };
    return colors[status] || colors["Closed"];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      "High": "bg-destructive/10 text-destructive border-destructive/20",
      "Medium": "bg-warning/10 text-warning border-warning/20",
      "Low": "bg-success/10 text-success border-success/20",
    };
    return colors[priority] || colors["Low"];
  };

  return (
    <Card 
      className="p-6 hover:shadow-md animate-smooth cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm text-muted-foreground">{case_.caseId}</span>
            <Badge variant="outline" className={getPriorityColor(case_.priority)}>
              {case_.priority} Priority
            </Badge>
            <Badge variant="outline" className={getStatusColor(case_.status)}>
              {case_.status}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">{case_.title}</h3>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Complainant: {case_.complainant}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Defendant: {case_.defendant}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Badge variant="secondary">{case_.category}</Badge>
            <span className="text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              Filed: {case_.filed}
            </span>
            <span className="text-muted-foreground">
              <Upload className="h-3 w-3 inline mr-1" />
              {case_.evidenceCount} evidence files
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          View Case
        </Button>
      </div>
      
      {case_.arbitrator && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Gavel className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Arbitrator:</span>
            <span className="font-medium">{case_.arbitrator}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

const stats = [
  {
    label: "Active Cases",
    value: "2",
    icon: AlertCircle,
    color: "bg-warning",
  },
  {
    label: "Under Review",
    value: "3",
    icon: Clock,
    color: "bg-primary",
  },
  {
    label: "Resolved",
    value: "12",
    icon: CheckCircle,
    color: "bg-success",
  },
  {
    label: "Total Cases",
    value: "17",
    icon: Gavel,
    color: "gradient-primary",
  },
];

export const cases: Case[] = [
  {
    id: "1",
    caseId: "CB-2025-00042",
    title: "Smart Contract Breach - Unauthorized Fund Transfer",
    category: "Contract Breach",
    complainant: "Alice Thompson",
    defendant: "Bob Martinez",
    status: "In Hearing",
    priority: "High",
    filed: "Feb 5, 2025",
    lastUpdate: "Feb 10, 2025",
    evidenceCount: 5,
    arbitrator: "Dr. Emily Chen, Esq.",
    description: "Complainant alleges that defendant executed a smart contract function without proper authorization from the governance process, resulting in transfer of $50,000 from the company treasury.",
    timeline: [
      { date: "Feb 5, 2025", event: "Case Filed", description: "Initial complaint submitted with evidence" },
      { date: "Feb 6, 2025", event: "Arbitrator Assigned", description: "Dr. Emily Chen accepted the case" },
      { date: "Feb 8, 2025", event: "Evidence Review", description: "Arbitrator requested additional documentation" },
      { date: "Feb 10, 2025", event: "Hearing Scheduled", description: "Virtual hearing set for Feb 20, 2025" },
    ],
    evidence: [
      { name: "transaction_logs.pdf", type: "PDF", uploadedBy: "Alice Thompson", date: "Feb 5, 2025" },
      { name: "smart_contract_code.sol", type: "Code", uploadedBy: "Alice Thompson", date: "Feb 5, 2025" },
      { name: "authorization_records.xlsx", type: "Spreadsheet", uploadedBy: "Alice Thompson", date: "Feb 6, 2025" },
      { name: "witness_statement.pdf", type: "PDF", uploadedBy: "Alice Thompson", date: "Feb 7, 2025" },
      { name: "defense_response.pdf", type: "PDF", uploadedBy: "Bob Martinez", date: "Feb 9, 2025" },
    ],
  },
  {
    id: "2",
    caseId: "CB-2025-00041",
    title: "Governance Violation - Vote Manipulation",
    category: "Governance Violation",
    complainant: "Carol White",
    defendant: "David Lee",
    status: "Under Review",
    priority: "Medium",
    filed: "Feb 8, 2025",
    lastUpdate: "Feb 9, 2025",
    evidenceCount: 3,
    arbitrator: "Prof. James Rodriguez",
    description: "Allegation of vote manipulation through creation of multiple wallet addresses to increase voting power beyond authorized share ownership.",
    timeline: [
      { date: "Feb 8, 2025", event: "Case Filed", description: "Complaint submitted with blockchain evidence" },
      { date: "Feb 9, 2025", event: "Under Review", description: "Evidence being verified by arbitrator" },
    ],
    evidence: [
      { name: "blockchain_analysis.pdf", type: "PDF", uploadedBy: "Carol White", date: "Feb 8, 2025" },
      { name: "voting_records.json", type: "Data", uploadedBy: "Carol White", date: "Feb 8, 2025" },
      { name: "wallet_connections.png", type: "Image", uploadedBy: "Carol White", date: "Feb 8, 2025" },
    ],
  },
  {
    id: "3",
    caseId: "CB-2025-00040",
    title: "Procedural Error - Meeting Notice Violation",
    category: "Procedural Error",
    complainant: "Frank Johnson",
    defendant: "Grace Miller",
    status: "Submitted",
    priority: "Low",
    filed: "Feb 10, 2025",
    lastUpdate: "Feb 10, 2025",
    evidenceCount: 2,
    description: "Complaint regarding insufficient notice period for emergency board meeting that resulted in major decisions.",
  },
  {
    id: "4",
    caseId: "CB-2025-00035",
    title: "Misuse of Funds - Unauthorized Expense",
    category: "Misuse of Funds",
    complainant: "Henry Davis",
    defendant: "Irene Kim",
    status: "Ruling",
    priority: "High",
    filed: "Jan 28, 2025",
    lastUpdate: "Feb 9, 2025",
    evidenceCount: 8,
    arbitrator: "Hon. Michael Brown",
    ruling: "After reviewing all evidence and hearing testimonies, the arbitrator finds in favor of the complainant. The defendant is ordered to return $25,000 to the company treasury within 30 days. Additionally, the defendant's signature authority is suspended pending board review.",
  },
  {
    id: "5",
    caseId: "CB-2025-00030",
    title: "Contract Dispute - Service Agreement",
    category: "Contract Breach",
    complainant: "Jack Wilson",
    defendant: "Kate Anderson",
    status: "Closed",
    priority: "Medium",
    filed: "Jan 15, 2025",
    lastUpdate: "Jan 30, 2025",
    evidenceCount: 6,
    arbitrator: "Dr. Sarah Martinez",
    ruling: "Case resolved through mediation. Both parties agreed to revised payment terms. No penalties assessed.",
  },
];

export default ArbitrationView;
