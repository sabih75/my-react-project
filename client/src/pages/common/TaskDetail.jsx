import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { AppBar } from "@/components/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText } from "lucide-react";
import StudentLayout from "../student/StudentLayout";
import axios from "axios";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function TaskDetail() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/students/tasks/${taskId}`);
      const t = res.data;

      setTask(t);
    } catch (err) {
      console.error("Task detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ STATUS COLOR
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-400";

    const s = status.toLowerCase();

    if (s === "completed") return "bg-green-500 text-white";
    if (s === "pending") return "bg-yellow-500 text-white";
    if (s === "in progress") return "bg-blue-500 text-white";

    return "bg-red-500 text-white";
  };

  if (loading) {
    return (
      <StudentLayout>
        <AppBar title="Task Details" showBack />
        <div className="p-4">Loading...</div>
      </StudentLayout>
    );
  }

  if (!task) {
    return (
      <StudentLayout>
        <AppBar title="Task Details" showBack />
        <div className="p-4 text-center text-muted-foreground">
          Task not found
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <AppBar title="Task Details" showBack />

      <div className="p-4 space-y-4">

        {/* HEADER */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-semibold">{task.title}</h2>

            <Badge className={getStatusColor(task.taskStatus)}>
              {task.taskStatus}
            </Badge>
          </div>

          <div className="space-y-3">

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Due:{" "}
                {task.dueDate
                  ? new Date(task.dueDate).toDateString()
                  : "No due date"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Assigned:{" "}
                {task.assignDate
                  ? new Date(task.assignDate).toDateString()
                  : "-"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Assigned Type: {task.AssignedType}
              </span>
            </div>

          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {task.taskDescription || "No description"}
          </p>
        </div>

        {/* PROGRESS */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Progress</h3>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${task.progress || 0}%` }}
            ></div>
          </div>

          <p className="text-xs mt-2 text-muted-foreground">
            {task.progress || 0}% completed
          </p>
        </div>

        {/* REMARKS */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />

            <div className="flex-1">
              <h3 className="font-semibold mb-1">Remarks</h3>

              <p className="text-sm text-muted-foreground">
                {task.remarks || "No remarks"}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <Button className="w-full">
          Upload Submission
        </Button>

      </div>
    </StudentLayout>
  );
}