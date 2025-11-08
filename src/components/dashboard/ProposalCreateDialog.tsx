import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { snapshotService } from '@/integrations/snapshot/snapshotAPI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ProposalCreateDialogProps {
  companyId: string;
  onProposalCreated: () => void;
}

export function ProposalCreateDialog({ companyId, onProposalCreated }: ProposalCreateDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState('governance');
  const [votingStartDate, setVotingStartDate] = useState<Date>();
  const [votingEndDate, setVotingEndDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !votingStartDate || !votingEndDate) return;
    
    setLoading(true);
    try {
      // Create proposal in Supabase
      const { data: proposal, error: dbError } = await supabase
        .from('proposals')
        .insert({
          company_id: companyId,
          created_by: user.id,
          title,
          description,
          proposal_type: proposalType,
          voting_starts_at: votingStartDate.toISOString(),
          voting_ends_at: votingEndDate.toISOString(),
          status: 'active',
          approval_threshold: 50,
          quorum_required: 50
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create proposal on Snapshot
      try {
        const snapshotResult = await snapshotService.createProposal({
          title,
          body: description,
          choices: ['For', 'Against', 'Abstain'],
          start: Math.floor(votingStartDate.getTime() / 1000),
          end: Math.floor(votingEndDate.getTime() / 1000),
          type: 'single-choice'
        });

        // Update proposal with Snapshot hash
        await supabase
          .from('proposals')
          .update({ ipfs_hash: snapshotResult.ipfsHash })
          .eq('id', proposal.id);

        toast({
          title: 'Proposal Created',
          description: 'Your proposal has been created on Snapshot and is ready for voting'
        });
      } catch (snapshotError) {
        console.error('Snapshot creation failed:', snapshotError);
        toast({
          title: 'Proposal Created (Snapshot Sync Failed)',
          description: 'Proposal saved locally but could not sync to Snapshot. Please check wallet connection.',
          variant: 'destructive'
        });
      }

      setOpen(false);
      onProposalCreated();
      
      // Reset form
      setTitle('');
      setDescription('');
      setProposalType('governance');
      setVotingStartDate(undefined);
      setVotingEndDate(undefined);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Proposal</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a proposal for shareholders to vote on. This will be recorded on Snapshot.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q1 2025 Budget Allocation"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the proposal..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Proposal Type *</Label>
            <Select value={proposalType} onValueChange={setProposalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="contract">Smart Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Voting Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {votingStartDate ? format(votingStartDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={votingStartDate}
                    onSelect={setVotingStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Voting End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {votingEndDate ? format(votingEndDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={votingEndDate}
                    onSelect={setVotingEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
