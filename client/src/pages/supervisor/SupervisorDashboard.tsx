import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { StatCard } from "@/components/StatCard";
import { GroupCard } from "@/components/GroupCard";
import { Users, CheckSquare, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function SupervisorDashboard() {
  const [, setLocation] = useLocation();

  const myGroups = [
    {
      groupName: "Group Alpha",
      projectTitle: "AI-Based Student Management System",
      members: ["Ali Hassan", "Ahmed Khan", "Sara Ahmad"],
      progress: 68,
    },
    {
      groupName: "Group Beta",
      projectTitle: "Real-time Traffic Monitoring using IoT",
      members: ["Usman Ali", "Fatima Noor"],
      progress: 45,
    },
  ];

  return (
    <MobileLayout>
      <AppBar title="Supervisor Dashboard" />
      
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="My Groups" value={2} />
            <StatCard icon={CheckSquare} label="Pending Tasks" value={12} color="bg-chart-3" />
            <StatCard icon={Calendar} label="Meetings" value={5} color="bg-chart-2" />
            <StatCard icon={TrendingUp} label="Avg Progress" value="56%" color="bg-chart-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Groups</h2>
            <button
              onClick={() => setLocation("/supervisor/groups")}
              className="text-sm text-primary font-medium"
              data-testid="link-view-all-groups"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {myGroups.map((group, index) => (
              <GroupCard
                key={index}
                {...group}
                supervisor="You"
                onClick={() => setLocation("/supervisor/group-detail")}
              />
            ))}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLocation("/supervisor/assign-task")}
              className="p-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-elevate active-elevate-2"
              data-testid="button-assign-task"
            >
              Assign Task
            </button>
            <button
              onClick={() => setLocation("/supervisor/meetings")}
              className="p-3 rounded-lg border border-primary text-primary text-sm font-medium hover-elevate active-elevate-2"
              data-testid="button-schedule-meeting"
            >
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
