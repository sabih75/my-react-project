import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { StatCard } from "@/components/StatCard";
import { TaskCard } from "@/components/TaskCard";
import { CheckSquare, Calendar, TrendingUp, Award } from "lucide-react";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();

  const recentTasks = [
    { title: "Complete Chapter 3 - Methodology", dueDate: "Due: Dec 20, 2024", status: "pending" as const, priority: "high" as const },
    { title: "Submit Progress Report", dueDate: "Due: Dec 18, 2024", status: "pending" as const, priority: "medium" as const },
    { title: "Review Literature Citations", dueDate: "Completed: Dec 10, 2024", status: "completed" as const, priority: "low" as const },
  ];

  return (
    <MobileLayout>
      <AppBar title="Student Dashboard" />
      
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={CheckSquare} label="Active Tasks" value={8} />
            <StatCard icon={Calendar} label="Meetings" value={3} color="bg-chart-2" />
            <StatCard icon={TrendingUp} label="Progress" value="72%" color="bg-chart-3" />
            <StatCard icon={Award} label="Grade" value="A" color="bg-chart-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <button
              onClick={() => setLocation("/student/tasks")}
              className="text-sm text-primary font-medium"
              data-testid="link-view-all-tasks"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentTasks.map((task, index) => (
              <TaskCard
                key={index}
                {...task}
                onClick={() => setLocation("/student/task-detail")}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
          <h3 className="font-semibold mb-1">Next Meeting</h3>
          <p className="text-sm opacity-90">Progress Review</p>
          <p className="text-xs opacity-75 mt-1">Tomorrow, 10:00 AM</p>
        </div>
      </div>
    </MobileLayout>
  );
}
