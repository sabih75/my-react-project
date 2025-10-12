import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { TaskCard } from "@/components/TaskCard";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TaskList() {
  const [, setLocation] = useLocation();

  const pendingTasks = [
    { title: "Complete Chapter 3 - Methodology", dueDate: "Due: Dec 20, 2024", status: "pending" as const, priority: "high" as const },
    { title: "Submit Progress Report", dueDate: "Due: Dec 18, 2024", status: "pending" as const, priority: "medium" as const },
    { title: "Prepare Presentation Slides", dueDate: "Due: Dec 22, 2024", status: "pending" as const, priority: "low" as const },
  ];

  const completedTasks = [
    { title: "Review Literature Citations", dueDate: "Completed: Dec 10, 2024", status: "completed" as const, priority: "medium" as const },
    { title: "Design Database Schema", dueDate: "Completed: Dec 5, 2024", status: "completed" as const, priority: "high" as const },
  ];

  return (
    <MobileLayout>
      <AppBar
        title="All Tasks"
        actions={
          <Button size="icon" variant="ghost" data-testid="button-filter">
            <Filter className="w-5 h-5" />
          </Button>
        }
      />
      
      <div className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-2">
            {pendingTasks.map((task, index) => (
              <TaskCard
                key={index}
                {...task}
                onClick={() => setLocation("/student/task-detail")}
              />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-2">
            {completedTasks.map((task, index) => (
              <TaskCard
                key={index}
                {...task}
                onClick={() => setLocation("/student/task-detail")}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
