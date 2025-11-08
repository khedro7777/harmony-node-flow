import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck, Clock, CheckCircle2, XCircle, Users, Calendar } from "lucide-react";
import { ProposalCreateDialog } from './ProposalCreateDialog';
import { VoteDialog } from './VoteDialog';
import { toast } from '@/hooks/use-toast';

const ProposalsView = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, approved: 0, rejected: 0, total: 0 });
  const [userCompanies, setUserCompanies] = useState<string[]>([]);
  const [votingPowers, setVotingPowers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (userCompanies.length > 0) {
      loadProposals();
      subscribeToProposals();
    }
  }, [userCompanies]);

  const loadUserCompanies = async () => {
    const { data } = await supabase
      .from('shareholders')
      .select('company_id, voting_power')
      .eq('user_id', user!.id);
    
    if (data) {
      const companyIds = data.map(s => s.company_id);
      setUserCompanies(companyIds);
      
      const powers: Record<string, number> = {};
      data.forEach(s => {
        powers[s.company_id] = Number(s.voting_power);
      });
      setVotingPowers(powers);
    }
  };

  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        companies(name),
        profiles!proposals_created_by_fkey(display_name)
      `)
      .in('company_id', userCompanies)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading proposals',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    if (data) {
      // Load votes for each proposal
      const proposalsWithVotes = await Promise.all(
        data.map(async (proposal) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('choice, voting_power')
            .eq('proposal_id', proposal.id);

          const voteStats = {
            for: votes?.filter(v => v.choice === 'for').reduce((sum, v) => sum + parseFloat(v.voting_power.toString()), 0) || 0,
            against: votes?.filter(v => v.choice === 'against').reduce((sum, v) => sum + parseFloat(v.voting_power.toString()), 0) || 0,
            abstain: votes?.filter(v => v.choice === 'abstain').reduce((sum, v) => sum + parseFloat(v.voting_power.toString()), 0) || 0,
            total: votes?.length || 0
          };

          return { ...proposal, votes: voteStats };
        })
      );

      setProposals(proposalsWithVotes);
      
      // Calculate stats
      const active = proposalsWithVotes.filter(p => p.status === 'active').length;
      const passed = proposalsWithVotes.filter(p => p.status === 'passed').length;
      const rejected = proposalsWithVotes.filter(p => p.status === 'rejected').length;
      setStats({ active, approved: passed, rejected, total: proposalsWithVotes.length });
    }
    
    setLoading(false);
  };

  const subscribeToProposals = () => {
    const channel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => loadProposals()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => loadProposals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading proposals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive flex items-center justify-center">
              <XCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Proposals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Active Proposals</h2>
          {userCompanies.length > 0 && (
            <ProposalCreateDialog 
              companyId={userCompanies[0]} 
              onProposalCreated={loadProposals}
            />
          )}
        </div>
        <div className="space-y-4">
          {proposals.filter(p => p.status === "active").length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No active proposals</p>
            </Card>
          ) : (
            proposals.filter(p => p.status === "active").map((proposal) => (
              <Card key={proposal.id} className="p-6 hover:shadow-md animate-smooth">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{proposal.title}</h3>
                      <Badge variant={proposal.proposal_type === "governance" ? "default" : "outline"}>
                        {proposal.proposal_type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{proposal.description}</p>
                    
                    {/* Voting Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Voting Progress</span>
                        <span className="font-medium">{proposal.votes.total} votes cast</span>
                      </div>
                      <Progress value={Math.min(100, (proposal.votes.for + proposal.votes.against) / 100 * 100)} />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-success">
                            <CheckCircle2 className="h-4 w-4 inline mr-1" />
                            {proposal.votes.for.toFixed(1)}% For
                          </span>
                          <span className="text-destructive">
                            <XCircle className="h-4 w-4 inline mr-1" />
                            {proposal.votes.against.toFixed(1)}% Against
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {getTimeLeft(proposal.voting_ends_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{proposal.profiles?.display_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VoteDialog 
                      proposal={proposal}
                      votingPower={votingPowers[proposal.company_id] || 0}
                      onVoteCast={loadProposals}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Past Proposals */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Proposals</h2>
        <div className="space-y-4">
          {proposals.filter(p => p.status !== "active").length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No past proposals</p>
            </Card>
          ) : (
            proposals.filter(p => p.status !== "active").map((proposal) => (
              <Card key={proposal.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{proposal.title}</h3>
                      <Badge variant={proposal.status === "passed" || proposal.status === "executed" ? "default" : "destructive"}>
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{proposal.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-success">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        {proposal.votes.for.toFixed(1)}% For
                      </span>
                      <span className="text-destructive">
                        <XCircle className="h-4 w-4 inline mr-1" />
                        {proposal.votes.against.toFixed(1)}% Against
                      </span>
                      <span className="text-muted-foreground">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsView;
