import { useState, useEffect } from "react";
import { Bell, CheckSquare, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { TaskCard } from "@/components/TaskCard";
import { useLocation } from "wouter";
import { AppBar } from "@/components/AppBar";
import StudentLayout from "./StudentLayout";
import axios from "axios";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [supervisorMeetings, setSupervisorMeetings] = useState([]);
  const [activeMeetingTab, setActiveMeetingTab] = useState("Committee");
  const [groupId, setGroupId] = useState(null);

  const studentData = localStorage.getItem("user");
  const studentId = studentData ? JSON.parse(studentData).id : null;

  useEffect(() => {
    if (!studentId) return;
    fetchStudentData();
  }, [studentId]);

  // ✅ MAIN DATA FETCH
  const fetchStudentData = async () => {
    try {
      // 1️⃣ Get student info
      const studentRes = await axios.get(`${API}/students/${studentId}`);
      const student = studentRes.data;

      setGroupId(student.GroupId);

      // 2️⃣ Fetch upcoming committee meetings
      const meetingRes = await axios.get(
        `${API}/committee-meetings/meetings`,
        {
          params: {
            type: student.FypType,
            groupId: student.GroupId,
            filter: "upcoming",
            studentId: studentId
          },
        }
      );
      setUpcoming(meetingRes.data || []);

      // 3️⃣ Fetch upcoming supervisor meetings
      if (student.GroupId) {
        const supMeetingRes = await axios.get(
          `${API}/supervisor/group-meetings/${student.GroupId}`
        );
        
        // Filter out past meetings to only show upcoming ones
        const now = new Date();
        const upcomingSupMeetings = (supMeetingRes.data || []).filter(m => new Date(m.Date) >= now);
        setSupervisorMeetings(upcomingSupMeetings);
      }

      // 4️⃣ Fetch tasks
      const taskRes = await axios.get(
        `${API}/supervisor/StudentTasks/${student.GroupId}/${studentId}`
      );

      const formattedTasks = taskRes.data
  .filter((t) => t.taskStatus?.toLowerCase() !== "completed") // ✅ only pending
  .map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate
      ? new Date(t.dueDate).toDateString()
      : "No due date",

    status: "pending",
    priority: "medium",
  }));

      // ✅ only recent 3 tasks
      setRecentTasks(formattedTasks.slice(0, 3));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };



  return (
    <StudentLayout>
      <div className="p-6 min-h-screen bg-muted/40">
        <AppBar title="Student Dashboard" />

        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* 📊 STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <StatCard
              icon={CheckSquare}
              label="Active Tasks"
              value={recentTasks.length}
            />

            <StatCard
              icon={Calendar}
              label="Upcoming Meetings"
              value={upcoming.length}
            />

            <div onClick={() => setLocation(`/student/group-details`)}>
              <StatCard
                icon={TrendingUp}
                label={`Group ${groupId ?? "-"}`}
                value="Details"
              />
            </div>
          </div>

          {/* 📌 RECENT TASKS */}
          <div>
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>

              <button
  onClick={() => setLocation(`/student/tasks/${groupId}`)}
  className="text-primary text-sm"
>
  View All
</button>
            </div>

            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">
                No recent tasks
              </p>
            ) : (
              recentTasks.map((task) => (
  <TaskCard
    key={task.id}
    {...task}
    onClick={() => setLocation(`/student/task-detail/${task.id}`)}
  />
))
            )}
          </div>

          {/* 📅 UPCOMING MEETINGS PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Next Upcoming Meeting
              </h2>
              
              {/* Meeting Type Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setActiveMeetingTab("Committee")}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    activeMeetingTab === "Committee"
                      ? "bg-background shadow-sm text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Committee
                </button>
                <button
                  onClick={() => setActiveMeetingTab("Supervisor")}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    activeMeetingTab === "Supervisor"
                      ? "bg-background shadow-sm text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Supervisor
                </button>
              </div>
            </div>

            {activeMeetingTab === "Committee" ? (
              upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming committee meetings
                </p>
              ) : (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base">
                        {upcoming[0]?.title || "Committee Meeting"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(upcoming[0]?.date).toDateString()}
                      </div>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      Committee
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              supervisorMeetings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming supervisor meetings
                </p>
              ) : (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base">
                        {supervisorMeetings[0]?.Title || "Supervisor Meeting"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(supervisorMeetings[0]?.Date).toDateString()} at {supervisorMeetings[0]?.Time || "TBD"}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      Supervisor
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}