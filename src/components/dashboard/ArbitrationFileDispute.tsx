import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Lock, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ArbitrationFileDisputeProps {
  onBack: () => void;
}

const ArbitrationFileDispute = ({ onBack }: ArbitrationFileDisputeProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    complainant: "",
    defendant: "",
    category: "",
    title: "",
    description: "",
    confidential: false,
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate case ID
    const caseId = `CB-2025-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    
    toast({
      title: "Dispute Filed Successfully",
      description: `Your case ${caseId} has been submitted and is pending arbitrator assignment.`,
    });
    
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">File New Dispute</h2>
          <p className="text-muted-foreground">Submit a case for arbitration review</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-primary">Important Information</p>
            <p className="text-sm text-muted-foreground">
              All evidence files will be encrypted and stored securely on IPFS. A unique case ID will be generated upon submission. 
              Filing fee: $250 (deducted from company treasury).
            </p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Parties Involved</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="complainant">Complainant *</Label>
              <Input
                id="complainant"
                placeholder="Your name"
                value={formData.complainant}
                onChange={(e) => setFormData({ ...formData, complainant: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defendant">Defendant *</Label>
              <Input
                id="defendant"
                placeholder="Name of the other party"
                value={formData.defendant}
                onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Case Details</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dispute category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="governance">Governance Violation</SelectItem>
                  <SelectItem value="funds">Misuse of Funds</SelectItem>
                  <SelectItem value="contract">Contract Breach</SelectItem>
                  <SelectItem value="procedural">Procedural Error</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Brief title describing the dispute"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a comprehensive description of the dispute, including relevant dates, amounts, and circumstances..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as detailed as possible. This will help the arbitrator understand your case.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Evidence Upload</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-2">Upload Evidence Files</p>
              <p className="text-xs text-muted-foreground mb-4">
                PDF, images, spreadsheets, or documents (max 20MB per file)
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files:</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Encryption & Privacy</p>
                <p className="text-muted-foreground">
                  All files are encrypted client-side before upload. Only authorized parties and the assigned arbitrator can access them.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Confidentiality</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="confidential"
                checked={formData.confidential}
                onChange={(e) => setFormData({ ...formData, confidential: e.target.checked })}
                className="mt-1"
              />
              <div>
                <Label htmlFor="confidential" className="cursor-pointer">
                  Mark this case as confidential
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Only parties involved and the arbitrator will be able to view case details. Public case summaries will be redacted.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Filing fee: $250</p>
            <Button type="submit" className="shadow-glow">
              Submit Dispute
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArbitrationFileDispute;
