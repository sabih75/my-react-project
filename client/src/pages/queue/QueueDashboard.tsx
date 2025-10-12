import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { StatCard } from "@/components/StatCard";
import { ListOrdered, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function QueueDashboard() {
  const [, setLocation] = useLocation();

  const queueItems = [
    { id: 1, type: "Task Assignment", group: "Group Alpha", priority: "high", status: "pending" },
    { id: 2, type: "Meeting Approval", group: "Group Beta", priority: "medium", status: "pending" },
    { id: 3, type: "Grade Review", group: "Group Gamma", priority: "low", status: "processing" },
  ];

  const priorityColors = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-chart-3 text-white",
    low: "bg-chart-2 text-white",
  };

  return (
    <MobileLayout>
      <AppBar title="Queue Dashboard" />
      
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Queue Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={ListOrdered} label="Total Items" value={24} />
            <StatCard icon={Clock} label="Pending" value={12} color="bg-chart-3" />
            <StatCard icon={CheckCircle} label="Completed" value={156} color="bg-chart-2" />
            <StatCard icon={AlertCircle} label="Avg Time" value="2.5h" color="bg-chart-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Priority Queue</h2>
            <button
              onClick={() => setLocation("/queue/analytics")}
              className="text-sm text-primary font-medium"
              data-testid="link-view-analytics"
            >
              Analytics
            </button>
          </div>
          <div className="space-y-2">
            {queueItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLocation("/queue/detail")}
                className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-queue-${item.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.type}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.group}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setLocation("/queue/assignment")}
          className="w-full p-4 rounded-lg bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2"
          data-testid="button-assign-queue-item"
        >
          Assign Queue Item
        </button>
      </div>
    </MobileLayout>
  );
}
