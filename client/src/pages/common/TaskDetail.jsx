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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("file", selectedFile);

      await axios.post(`${API}/supervisor/upload-task-ppt`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Task file uploaded successfully! 🎉");
      setSelectedFile(null);
      fetchTask();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload task PPT presentation.");
    } finally {
      setUploading(false);
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

        {/* PRESENTATION PPT REQUIREMENT & UPLOAD BLOCK */}
        {task.isPptRequired ? (
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" /> PPT Presentation Submission
            </h3>
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-semibold">
              ⚠️ Your supervisor has marked a PowerPoint Presentation (PPT) as required for this task.
            </p>

            {task.submissionFilePath ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                  <span>✅ Presentation PPT Uploaded</span>
                </div>
                <a
                  href={`http://localhost/ProgressMonitoringProject${task.submissionFilePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg transition"
                >
                  Download / View Uploaded PPT
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-muted/30 px-3 py-2 rounded-lg">
                No submission file uploaded yet.
              </p>
            )}

            <div className="pt-3 border-t border-border/60 space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {task.submissionFilePath ? "Update / Re-upload PPT File" : "Select PPT Presentation File"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {selectedFile && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm text-xs shrink-0"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-4 text-center text-xs text-muted-foreground">
            ℹ️ No PPT Presentation upload required for this task.
          </div>
        )}

      </div>
    </StudentLayout>
  );
}