import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { TaskCard } from "@/components/TaskCard";
import { useLocation } from "wouter";

export default function FYP1Tasks() {
  const [, setLocation] = useLocation();

  const fyp1Tasks = [
    { title: "Problem Statement", dueDate: "Completed: Sep 15, 2024", status: "completed" as const, priority: "high" as const },
    { title: "Literature Review", dueDate: "Completed: Oct 10, 2024", status: "completed" as const, priority: "high" as const },
    { title: "Research Methodology", dueDate: "Due: Dec 20, 2024", status: "pending" as const, priority: "high" as const },
    { title: "System Design", dueDate: "Due: Dec 25, 2024", status: "pending" as const, priority: "medium" as const },
  ];

  return (
    <MobileLayout>
      <AppBar title="FYP-1 Tasks" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h2 className="font-semibold mb-2">FYP-1 (Semester 1)</h2>
          <p className="text-sm text-muted-foreground">
            Research and planning phase tasks
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {fyp1Tasks.map((task, index) => (
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
