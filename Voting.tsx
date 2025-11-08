import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import LoomioVoting from '@/components/LoomioVoting';
import { loomioService, LoomioProposal } from '@/integrations/loomio/loomioAPI';
import { useToast } from '@/components/ui/use-toast';

export default function Voting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<LoomioProposal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    options: ['', '', ''],
    deadline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load proposals from Loomio API
  useEffect(() => {
    const loadProposals = async () => {
      try {
        setLoading(true);
        const groups = await loomioService.getGroups();
        
        if (groups.length === 0) {
          toast({
            title: 'No Groups Found',
            description: 'Please create a group in Loomio first.',
            variant: 'default',
          });
          setProposals([]);
          return;
        }

        // Load proposals from the first group
        const groupProposals = await loomioService.getGroupProposals(groups[0].id);
        setProposals(groupProposals);
      } catch (error) {
        console.error('Failed to load proposals:', error);
        toast({
          title: 'Error Loading Proposals',
          description: 'Failed to load proposals from Loomio. Make sure the server is running.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [toast]);

  const handleCreateProposal = async () => {
    if (!newProposal.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a proposal title',
        variant: 'destructive',
      });
      return;
    }

    const validOptions = newProposal.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least 2 voting options',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const groups = await loomioService.getGroups();
      
      if (groups.length === 0) {
        toast({
          title: 'Error',
          description: 'No groups found. Please create a group in Loomio first.',
          variant: 'destructive',
        });
        return;
      }

      const deadline = newProposal.deadline ? new Date(newProposal.deadline) : undefined;
      
      const proposal = await loomioService.createProposal(
        groups[0].id,
        newProposal.title,
        newProposal.description,
        validOptions,
        deadline
      );

      setProposals([proposal, ...proposals]);
      setNewProposal({
        title: '',
        description: '',
        options: ['', '', ''],
        deadline: '',
      });
      setIsCreating(false);

      toast({
        title: 'Success',
        description: 'Proposal created successfully!',
      });
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create proposal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (proposalId: string, optionId: string) => {
    try {
      // In a real scenario, you would get the current user ID from auth context
      const userId = 'current-user-id';
      
      await loomioService.castVote(optionId, userId);

      // Refresh proposals to show updated vote counts
      const groups = await loomioService.getGroups();
      if (groups.length > 0) {
        const updatedProposals = await loomioService.getGroupProposals(groups[0].id);
        setProposals(updatedProposals);
      }

      toast({
        title: 'Success',
        description: 'Your vote has been recorded!',
      });
    } catch (error) {
      console.error('Failed to cast vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to cast vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Voting & Decisions</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Collaborate on important decisions with your team using Loomio
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            New Proposal
          </Button>
        </div>

        {/* Create Proposal Form */}
        {isCreating && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>
                Create a new proposal for your team to vote on using Loomio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Proposal Title</label>
                <Input
                  placeholder="e.g., Should we adopt a new tech stack?"
                  value={newProposal.title}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Textarea
                  placeholder="Provide context for this proposal..."
                  value={newProposal.description}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Voting Options</label>
                <div className="space-y-3">
                  {newProposal.options.map((option, idx) => (
                    <Input
                      key={idx}
                      placeholder={`Option ${idx + 1}`}
                      value={option}
                      onChange={(e) => {
                        const updated = [...newProposal.options];
                        updated[idx] = e.target.value;
                        setNewProposal({ ...newProposal, options: updated });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newProposal.deadline}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, deadline: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProposal}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Proposal'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        {loading ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-muted-foreground">Loading proposals...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="closed">Closed Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 mt-6">
              {proposals
                .filter((p) => p.status === 'open')
                .map((proposal) => (
                  <LoomioVoting
                    key={proposal.id}
                    proposalId={proposal.id}
                    title={proposal.title}
                    description={proposal.description}
                    options={proposal.pollOptions.map((opt) => ({
                      id: opt.id,
                      title: opt.name,
                      description: opt.description,
                      votes: opt.voteCount,
                      voters: [],
                    }))}
                    isActive={proposal.status === 'open'}
                    deadline={proposal.closingAt}
                    onVote={(optionId) => handleVote(proposal.id, optionId)}
                  />
                ))}
              {proposals.filter((p) => p.status === 'open').length === 0 && (
                <Card>
                  <CardContent className="pt-8 text-center">
                    <p className="text-muted-foreground">No active proposals yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-6 mt-6">
              {proposals
                .filter((p) => p.status === 'closed')
                .map((proposal) => (
                  <LoomioVoting
                    key={proposal.id}
                    proposalId={proposal.id}
                    title={proposal.title}
                    description={proposal.description}
                    options={proposal.pollOptions.map((opt) => ({
                      id: opt.id,
                      title: opt.name,
                      description: opt.description,
                      votes: opt.voteCount,
                      voters: [],
                    }))}
                    isActive={false}
                    deadline={proposal.closingAt}
                    onVote={(optionId) => handleVote(proposal.id, optionId)}
                  />
                ))}
              {proposals.filter((p) => p.status === 'closed').length === 0 && (
                <Card>
                  <CardContent className="pt-8 text-center">
                    <p className="text-muted-foreground">No closed proposals yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
