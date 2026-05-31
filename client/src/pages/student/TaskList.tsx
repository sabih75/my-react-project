import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskCard } from "@/components/TaskCard";
import { AppBar } from "@/components/AppBar";
import StudentLayout from "./StudentLayout";
import { useLocation, useParams, useSearch } from "wouter";
import axios from "axios";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

// Types
type TaskStatus = "pending" | "completed" | "overdue";
type TaskPriority = "high" | "medium" | "low";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress?:number; // ✅ optional if API doesn't provide;
  assignedType?: string;
}

export default function TaskList() {
  const [selectedTab, setSelectedTab] = useState("individual");
  const [, setLocation] = useLocation();

  const [individualTasks, setIndividualTasks] = useState<Task[]>([]);
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;

 const {  groupId } = useParams();
  useEffect(() => {
    if (groupId && studentId) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/supervisor/StudentTasks/${groupId}/${studentId}`
      );

      const data = res.data;

      const formatted: Task[] = data.map((t: any) => {
        // ✅ Determine task status
        let status: TaskStatus = "pending";

        if (t.taskStatus?.toLowerCase() === "completed") {
          status = "completed";
        } else if (t.dueDate && new Date(t.dueDate) < new Date()) {
          status = "overdue";
        }

        return {
          id: t.id,
          title: t.title,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toDateString()
            : "No due date",

          status,
          priority: "medium",

          // ✅ Correct fields from API
          progress: t.progress,
          assignedType: t.AssignedType,
        };
      });

      // ✅ Split tasks
      setIndividualTasks(
        formatted.filter((t) => t.assignedType === "Individual")
      );

      setGroupTasks(
        formatted.filter((t) => t.assignedType === "Group")
      );

    } catch (err) {
      console.error("Task fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (task: Task) => {
    setLocation(`/student/task-detail/${task.id}`);
  };

  return (
    <StudentLayout>
      <AppBar title="Tasks" />

      <div className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="individual">Individual Tasks</TabsTrigger>
            <TabsTrigger value="group">Group Tasks</TabsTrigger>
          </TabsList>

          {/* INDIVIDUAL TASKS */}
          <TabsContent value="individual">
            <div className="space-y-3">
              {loading ? (
                <p>Loading...</p>
              ) : individualTasks.length === 0 ? (
                <p>No individual tasks found</p>
              ) : (
                individualTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    dueDate={task.dueDate}
                    status={task.status}
                    priority={task.priority}
                    onClick={() => handleCardClick(task)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* GROUP TASKS */}
          <TabsContent value="group">
            <div className="space-y-3">
              {loading ? (
                <p>Loading...</p>
              ) : groupTasks.length === 0 ? (
                <p>No group tasks found</p>
              ) : (
                groupTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    dueDate={task.dueDate}
                    status={task.status}
                    priority={task.priority}
                    onClick={() => handleCardClick(task)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}