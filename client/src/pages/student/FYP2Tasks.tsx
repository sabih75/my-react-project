import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { TaskCard } from "@/components/TaskCard";
import { useLocation } from "wouter";

export default function FYP2Tasks() {
  const [, setLocation] = useLocation();

  const fyp2Tasks = [
    { title: "Implementation Phase 1", dueDate: "Due: Jan 15, 2025", status: "pending" as const, priority: "high" as const },
    { title: "Testing & Debugging", dueDate: "Due: Feb 10, 2025", status: "pending" as const, priority: "high" as const },
    { title: "Documentation", dueDate: "Due: Feb 20, 2025", status: "pending" as const, priority: "medium" as const },
    { title: "Final Presentation", dueDate: "Due: Mar 1, 2025", status: "pending" as const, priority: "high" as const },
  ];

  return (
    <MobileLayout>
      <AppBar title="FYP-2 Tasks" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h2 className="font-semibold mb-2">FYP-2 (Semester 2)</h2>
          <p className="text-sm text-muted-foreground">
            Implementation and delivery phase tasks
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {fyp2Tasks.map((task, index) => (
            <TaskCard
              key={index}
              {...task}
              onClick={() => setLocation("/student/task-detail")}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
