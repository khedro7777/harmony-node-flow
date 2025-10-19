import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { snapshotService } from '@/integrations/snapshot/snapshotAPI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface VoteDialogProps {
  proposal: any;
  votingPower: number;
  onVoteCast: () => void;
}

export function VoteDialog({ proposal, votingPower, onVoteCast }: VoteDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [choice, setChoice] = useState<'for' | 'against' | 'abstain'>('for');
  const [reason, setReason] = useState('');

  const handleVote = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('proposal_id', proposal.id)
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        toast({
          title: 'Already Voted',
          description: 'You have already cast your vote on this proposal',
          variant: 'destructive'
        });
        return;
      }

      // Cast vote in Supabase
      const { error: dbError } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposal.id,
          voter_id: user.id,
          choice,
          voting_power: votingPower
        });

      if (dbError) throw dbError;

      // Cast vote on Snapshot
      if (proposal.ipfs_hash) {
        try {
          const choiceIndex = choice === 'for' ? 1 : choice === 'against' ? 2 : 3;
          await snapshotService.castVote({
            proposalId: proposal.ipfs_hash,
            choice: choiceIndex,
            reason
          });
        } catch (snapshotError) {
          console.error('Snapshot vote failed:', snapshotError);
        }
      }

      toast({
        title: 'Vote Cast Successfully',
        description: `Your vote "${choice}" has been recorded`
      });

      setOpen(false);
      onVoteCast();
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
        <Button size="sm" className="shadow-glow">Vote Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cast Your Vote</DialogTitle>
          <DialogDescription>
            Your voting power: {votingPower.toFixed(2)}%
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={choice} onValueChange={(v: any) => setChoice(v)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="for" id="for" />
              <Label htmlFor="for" className="flex items-center gap-2 cursor-pointer flex-1">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">Vote For</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="against" id="against" />
              <Label htmlFor="against" className="flex items-center gap-2 cursor-pointer flex-1">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium">Vote Against</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="abstain" id="abstain" />
              <Label htmlFor="abstain" className="flex items-center gap-2 cursor-pointer flex-1">
                <MinusCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Abstain</span>
              </Label>
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your vote (will be public on Snapshot)..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
