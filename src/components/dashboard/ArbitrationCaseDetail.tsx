import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, Hash, FileText, Clock, Gavel, CheckCircle, Download } from "lucide-react";

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

interface ArbitrationCaseDetailProps {
  case: Case;
  onBack: () => void;
}

const ArbitrationCaseDetail = ({ case: caseData, onBack }: ArbitrationCaseDetailProps) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span className="font-mono text-lg text-muted-foreground">{caseData.caseId}</span>
              <Badge variant="outline" className={getStatusColor(caseData.status)}>
                {caseData.status}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold mb-2">{caseData.title}</h2>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Complainant: <strong>{caseData.complainant}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Defendant: <strong>{caseData.defendant}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Filed: {caseData.filed}</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Case
        </Button>
      </div>

      {/* Case Overview Card */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Category</p>
            <Badge variant="secondary">{caseData.category}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Priority</p>
            <Badge variant="outline" className={
              caseData.priority === "High" ? "bg-destructive/10 text-destructive border-destructive/20" :
              caseData.priority === "Medium" ? "bg-warning/10 text-warning border-warning/20" :
              "bg-success/10 text-success border-success/20"
            }>
              {caseData.priority} Priority
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="font-medium">{caseData.lastUpdate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Evidence Files</p>
            <p className="font-medium">{caseData.evidenceCount} files</p>
          </div>
        </div>
      </Card>

      {/* Arbitrator Info (if assigned) */}
      {caseData.arbitrator && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assigned Arbitrator</p>
              <p className="font-semibold text-lg">{caseData.arbitrator}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs for Details */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({caseData.evidenceCount})</TabsTrigger>
          {caseData.ruling && <TabsTrigger value="ruling">Ruling</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Case Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {caseData.description || "No description available."}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Case Timeline</h3>
            <div className="space-y-6">
              {caseData.timeline && caseData.timeline.length > 0 ? (
                caseData.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {index === caseData.timeline!.length - 1 ? (
                          <Clock className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                      </div>
                      {index < caseData.timeline!.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{item.event}</h4>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No timeline events yet.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Evidence Files</h3>
            <div className="space-y-3">
              {caseData.evidence && caseData.evidence.length > 0 ? (
                caseData.evidence.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted animate-smooth">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Uploaded by: {file.uploadedBy}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                          <span>•</span>
                          <Badge variant="outline">{file.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No evidence files uploaded.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {caseData.ruling && (
          <TabsContent value="ruling">
            <Card className="p-6 bg-success/5 border-success/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Gavel className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Final Ruling</h3>
                  <p className="text-sm text-muted-foreground">Issued by {caseData.arbitrator}</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">{caseData.ruling}</p>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Actions */}
      {!caseData.ruling && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need to add more information or respond to this case?
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
              <Button>Submit Response</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ArbitrationCaseDetail;
