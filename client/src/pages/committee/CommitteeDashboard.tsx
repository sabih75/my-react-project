import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, UserCheck, TrendingUp, CheckSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function CommitteeDashboard() {
  const [, setLocation] = useLocation();

  const quickActions = [
    { label: "Student Selection", path: "/committee/student-selection", icon: GraduationCap },
    { label: "Allocate Supervisors", path: "/committee/allocation", icon: UserCheck },
    { label: "View Groups", path: "/committee/groups", icon: Users },
    { label: "Mark Attendance", path: "/committee/attendance", icon: CheckSquare },
  ];

  return (
    <MobileLayout>
      <AppBar title="Committee Dashboard" />
      
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">System Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Total Groups" value={15} />
            <StatCard icon={GraduationCap} label="Students" value={45} color="bg-chart-2" />
            <StatCard icon={UserCheck} label="Supervisors" value={8} color="bg-chart-3" />
            <StatCard icon={TrendingUp} label="Avg Progress" value="62%" color="bg-chart-4" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => setLocation(action.path)}
                  className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2 text-left"
                  data-testid={`button-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-chart-2 mt-1.5" />
              <div className="flex-1">
                <p className="text-sm">New group registered: Group Omega</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-chart-3 mt-1.5" />
              <div className="flex-1">
                <p className="text-sm">Supervisor assigned to Group Delta</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div className="flex-1">
                <p className="text-sm">Meeting scheduled for Group Alpha</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
