import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import CodeGraph from './CodeGraph';

const ArbitrationView = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [newDispute, setNewDispute] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/disputes');
      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }
      const data = await response.json();
      setDisputes(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not fetch disputes.', variant: 'destructive' });
    }
  };

  const handleCreateDispute = async () => {
    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newDispute, id: uuidv4(), status: 'open' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dispute');
      }

      const result = await response.json();
      toast({ title: 'Dispute Created', description: `Dispute ID: ${result.disputeId}` });
      fetchDisputes(); // Refresh the list of disputes
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not create dispute.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arbitration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Create a New Dispute</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="dispute-title">Dispute Title</Label>
                        <Input id="dispute-title" placeholder="e.g., Contract Violation" onChange={e => setNewDispute({...newDispute, title: e.target.value})} />
                    </div>
                    <div>
                        <Label htmlFor="dispute-description">Description</Label>
                        <Textarea id="dispute-description" placeholder="Describe the dispute in detail" onChange={e => setNewDispute({...newDispute, description: e.target.value})} />
                    </div>
                    <Button onClick={handleCreateDispute}>Create Dispute</Button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Open Disputes</h2>
                <div className="space-y-4">
                    {disputes.map(d => (
                        <Card key={d._id}>
                            <CardHeader>
                                <CardTitle>{d.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='mb-3'>{d.description}</p>
                                <Button>View Details</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
        <div className="mt-8">
            <CodeGraph />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrationView;
