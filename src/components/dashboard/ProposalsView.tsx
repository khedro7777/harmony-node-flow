import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck, Clock, CheckCircle2, XCircle, Users, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Proposal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "active" | "approved" | "rejected";
  votes: { for: number; against: number };
  totalVoters: number;
  timeLeft: string;
  author: string;
  created: string;
}

const ProposalsView = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalStats, setProposalStats] = useState([
    {
      label: "Active",
      value: "0",
      icon: Clock,
      color: "bg-warning",
    },
    {
      label: "Approved",
      value: "0",
      icon: CheckCircle2,
      color: "bg-success",
    },
    {
      label: "Rejected",
      value: "0",
      icon: XCircle,
      color: "bg-destructive",
    },
    {
      label: "Total",
      value: "0",
      icon: FileCheck,
      color: "gradient-primary",
    },
  ]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const proposalsCollection = collection(db, "proposals");
        const proposalSnapshot = await getDocs(proposalsCollection);
        const proposalsList = proposalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
        setProposals(proposalsList);

        // Calculate stats
        const active = proposalsList.filter(p => p.status === 'active').length;
        const approved = proposalsList.filter(p => p.status === 'approved').length;
        const rejected = proposalsList.filter(p => p.status === 'rejected').length;
        const total = proposalsList.length;

        setProposalStats([
          {
            label: "Active",
            value: active.toString(),
            icon: Clock,
            color: "bg-warning",
          },
          {
            label: "Approved",
            value: approved.toString(),
            icon: CheckCircle2,
            color: "bg-success",
          },
          {
            label: "Rejected",
            value: rejected.toString(),
            icon: XCircle,
            color: "bg-destructive",
          },
          {
            label: "Total",
            value: total.toString(),
            icon: FileCheck,
            color: "gradient-primary",
          },
        ]);

      } catch (error) {
        console.error("Error fetching proposals: ", error);
        // Fallback to dummy data if firebase is not configured
        setProposals(dummyProposals);
        setProposalStats([
            {
                label: "Active",
                value: "5",
                icon: Clock,
                color: "bg-warning",
            },
            {
                label: "Approved",
                value: "34",
                icon: CheckCircle2,
                color: "bg-success",
            },
            {
                label: "Rejected",
                value: "8",
                icon: XCircle,
                color: "bg-destructive",
            },
            {
                label: "Total",
                value: "47",
                icon: FileCheck,
                color: "gradient-primary",
            },
        ]);
      }
    };

    fetchProposals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {proposalStats.map((stat, index) => (
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

      {/* Active Proposals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Active Proposals</h2>
          <Button>Create Proposal</Button>
        </div>
        <div className="space-y-4">
          {proposals.filter(p => p.status === "active").map((proposal) => (
            <Card key={proposal.id} className="p-6 hover:shadow-md animate-smooth">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{proposal.title}</h3>
                    <Badge variant={proposal.type === "governance" ? "default" : "outline"}>
                      {proposal.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{proposal.description}</p>
                  
                  {/* Voting Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Voting Progress</span>
                      <span className="font-medium">{proposal.votes.for + proposal.votes.against} / {proposal.totalVoters} votes</span>
                    </div>
                    <Progress value={(proposal.votes.for + proposal.votes.against) / proposal.totalVoters * 100} />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-success">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                          {proposal.votes.for} For
                        </span>
                        <span className="text-destructive">
                          <XCircle className="h-4 w-4 inline mr-1" />
                          {proposal.votes.against} Against
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {proposal.timeLeft}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{proposal.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{proposal.created}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm" className="shadow-glow">Vote Now</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Proposals */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Proposals</h2>
        <div className="space-y-4">
          {proposals.filter(p => p.status !== "active").map((proposal) => (
            <Card key={proposal.id} className="p-6 opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{proposal.title}</h3>
                    <Badge variant={proposal.status === "approved" ? "default" : "destructive"}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{proposal.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-success">
                      <CheckCircle2 className="h-4 w-4 inline mr-1" />
                      {proposal.votes.for} For ({Math.round(proposal.votes.for / (proposal.votes.for + proposal.votes.against) * 100)}%)
                    </span>
                    <span className="text-destructive">
                      <XCircle className="h-4 w-4 inline mr-1" />
                      {proposal.votes.against} Against
                    </span>
                    <span className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {proposal.created}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const dummyProposals: Proposal[] = [
    {
      id: "1",
      title: "Q1 2025 Budget Allocation",
      description: "Proposal to allocate $500K for product development and $300K for marketing initiatives in Q1.",
      type: "governance",
      status: "active",
      votes: { for: 18, against: 3 },
      totalVoters: 24,
      timeLeft: "2 days left",
      author: "Sarah Johnson",
      created: "Feb 8, 2025",
    },
    {
      id: "2",
      title: "New Board Member Nomination",
      description: "Nominate Michael Chen as a new board member with expertise in blockchain technology.",
      type: "governance",
      status: "active",
      votes: { for: 15, against: 5 },
      totalVoters: 24,
      timeLeft: "5 days left",
      author: "David Park",
      created: "Feb 7, 2025",
    },
    {
      id: "3",
      title: "Smart Contract Upgrade v2.1",
      description: "Deploy upgraded governance smart contract with improved gas optimization.",
      type: "contract",
      status: "active",
      votes: { for: 12, against: 2 },
      totalVoters: 24,
      timeLeft: "1 day left",
      author: "Tech Team",
      created: "Feb 9, 2025",
    },
    {
      id: "4",
      title: "Annual Dividend Distribution",
      description: "Approve $2M dividend distribution to shareholders based on ownership percentage.",
      type: "financial",
      status: "approved",
      votes: { for: 21, against: 2 },
      totalVoters: 24,
      timeLeft: "Ended",
      author: "Finance Team",
      created: "Jan 28, 2025",
    },
    {
      id: "5",
      title: "Office Lease Extension",
      description: "Extend current office lease for 3 years at $15K/month.",
      type: "operational",
      status: "rejected",
      votes: { for: 8, against: 15 },
      totalVoters: 24,
      timeLeft: "Ended",
      author: "Operations",
      created: "Jan 25, 2025",
    },
  ];

export default ProposalsView;
