import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, FileCheck, Gavel, DollarSign, Activity } from "lucide-react";

const CompanyOverview = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6 gradient-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-10 w-10 rounded-lg gradient-primary flex items-center justify-center`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
              {metric.trend && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  +{metric.trend}%
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted animate-smooth">
                <div className={`h-10 w-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                <Badge variant={activity.status === "Approved" ? "default" : "outline"}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Company Stats</h2>
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-semibold">{stat.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 animate-smooth">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">{event.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const metrics = [
  {
    label: "Total Shareholders",
    value: "24",
    trend: 12,
    icon: Users,
  },
  {
    label: "Active Proposals",
    value: "5",
    trend: null,
    icon: FileCheck,
  },
  {
    label: "Open Disputes",
    value: "2",
    trend: null,
    icon: Gavel,
  },
  {
    label: "Treasury Balance",
    value: "$2.4M",
    trend: 8,
    icon: DollarSign,
  },
];

const activities = [
  {
    title: "Proposal #42 Approved",
    description: "Q1 Budget Allocation passed with 85% approval",
    time: "2 hours ago",
    status: "Approved",
    icon: FileCheck,
    color: "bg-success",
  },
  {
    title: "New Arbitration Case Filed",
    description: "Case CB-2025-00042: Contract dispute initiated",
    time: "5 hours ago",
    status: "Pending",
    icon: Gavel,
    color: "bg-warning",
  },
  {
    title: "Shareholder Vote Completed",
    description: "Board election results finalized",
    time: "1 day ago",
    status: "Approved",
    icon: Users,
    color: "bg-primary",
  },
];

const stats = [
  {
    label: "Voting Participation",
    value: "87%",
    percentage: 87,
  },
  {
    label: "Proposal Success Rate",
    value: "76%",
    percentage: 76,
  },
  {
    label: "Treasury Utilization",
    value: "45%",
    percentage: 45,
  },
];

const events = [
  {
    date: "15",
    title: "Board Meeting",
    time: "Feb 15, 2025 • 2:00 PM EST",
    description: "Quarterly review and strategic planning session",
  },
  {
    date: "18",
    title: "Proposal Deadline",
    time: "Feb 18, 2025 • 11:59 PM EST",
    description: "Last day to submit Q2 proposals",
  },
  {
    date: "20",
    title: "Arbitration Hearing",
    time: "Feb 20, 2025 • 10:00 AM EST",
    description: "Case CB-2025-00042 review session",
  },
];

export default CompanyOverview;
