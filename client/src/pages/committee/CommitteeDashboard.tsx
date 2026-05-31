import { AppBar } from "@/components/AppBar";
import {
  Bell,
  Users,
  GraduationCap,
  UserCheck,
  CheckSquare,
  Shuffle,
  CalendarPlus,
  FolderGit2,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import CommitteeLayout from "./CommitteeLayout";

export default function CommitteeDashboard() {
  const [, setLocation] = useLocation();
  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const isAlsoSupervisor = true;

  const allQuickActions = [
    { label: "Student Selection", path: "/committee/student-selection", icon: GraduationCap, fyp: ["FYP-1", "FYP-2"] },
    { label: "Allocate Supervisors", path: "/committee/supervisor-allocation", icon: UserCheck, fyp: ["FYP-1"] },
    { label: "View Groups", path: `/committee/groups/${activeFYP}`, icon: Users, fyp: ["FYP-1", "FYP-2"] },
    { label: "Schedule Meeting", path: "/committee/schedule-meeting", icon: CalendarPlus, fyp: ["FYP-1", "FYP-2"] },
    { label: "My Meetings", path: "/committee/my-meetings", icon: CalendarPlus, fyp: ["FYP-1", "FYP-2"] },
    { label: "Pre Schedule Meeting", path: "/committee/preschedule-meeting", icon: CalendarPlus, fyp: ["FYP-1", "FYP-2"] },
    { label: "Allocate Projects", path: "/committee/allocate-projects", icon: FolderGit2, fyp: ["FYP-1"] },
    { label: "Meeting Queue", path: "/committee/meeting-queue", icon: Clock, fyp: ["FYP-1", "FYP-2"] },
    { label: "Create Semester Agenda", path: "/committee/create-semester-agenda", icon: CalendarPlus, fyp: ["FYP-1", "FYP-2"] },
    { label: "Final Task Evaluation", path: "/committee/final-evaluation", icon: CheckSquare, fyp: ["FYP-2"] },
    { label: "General Task Eval", path: "/committee/general-task-evaluation", icon: CheckSquare, fyp: ["FYP-2"] },
  ];

  const groups = [
    {
      id: "grp1",
      name: "Group 1",
      description: "AI-Based Student Management System",
      supervisor: "Sir Zahid",
      allocated: true,
      members: [
        { name: "Ali Hassan", regNo: "22-ARID-3210", technology: "Flutter", cgpa: "3.45" },
        { name: "Bilal Ahmed", regNo: "22-ARID-3256", technology: "Node.js", cgpa: "3.67" },
        { name: "Usman Tariq", regNo: "22-ARID-3312", technology: "React", cgpa: "3.59" },
      ],
    },
    {
      id: "grp2",
      name: "Group 2",
      description: "E-Learning Platform with Gamification",
      supervisor: "Dr. Kamran Malik",
      allocated: true,
      members: [
        { name: "Hina Aslam", regNo: "22-ARID-3298", technology: "Flutter", cgpa: "3.78" },
        { name: "Zain Abbas", regNo: "22-ARID-3301", technology: "Firebase", cgpa: "3.65" },
        { name: "Sana Iqbal", regNo: "22-ARID-3355", technology: "React Native", cgpa: "3.70" },
      ],
    },
    {
      id: "grp3",
      name: "Group 3",
      description: "Blockchain-based Voting App",
      supervisor: "Not Allocated",
      allocated: false,
      members: [
        { name: "Asad Ali", regNo: "22-ARID-3270", technology: "MERN", cgpa: "3.60" },
        { name: "Taha Ahmed", regNo: "22-ARID-3221", technology: "React", cgpa: "3.55" },
      ],
    },
  ];

  const notifications = [
    { id: 1, message: "Meeting scheduled with Group Alpha tomorrow at 10:00 AM" },
    { id: 2, message: "Task reminder: Allocate projects for FYP-2 by Friday" },
  ];
  useEffect(()=>{
// localStorage.setItem("type",JSON.stringify("FYP-1"));
  });

  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "All"
        ? true
        : filterType === "Allocated"
        ? g.allocated
        : !g.allocated;
    return matchesSearch && matchesFilter;
  });

  const quickActions = allQuickActions.filter((a) => a.fyp.includes(activeFYP));

  return (
    <CommitteeLayout>
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <AppBar title="Committee Dashboard" />

      {/* FYP Toggle */}
      <div className="flex justify-center gap-4 mt-4">
        {["FYP-1", "FYP-2"].map((fyp) => (
          <button
            key={fyp}
            onClick={() => {setActiveFYP(fyp)
              localStorage.setItem("type",JSON.stringify(fyp));}
            }
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFYP === fyp ? "bg-primary text-white" : "bg-muted text-foreground"
            }`}
          >
            {fyp}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => setLocation(action.path)}
                  className="p-4 rounded-lg bg-card border hover-elevate text-left transition-all"
                >
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </button>
              );
            })}

            {isAlsoSupervisor && (
              <button
                onClick={() => setLocation("/supervisor/dashboard")}
                className="p-4 rounded-lg bg-primary text-white hover:bg-primary/90 flex flex-col items-start"
              >
                <Shuffle className="w-5 h-5 mb-2" />
                <p className="text-sm font-medium">Switch to Supervisor Dashboard</p>
              </button>
            )}
          </div>
        </div>

        {/* Groups Section (unchanged logic) */}
        {/* Notifications Drawer stays SAME */}
      </div>
    </div>
    </CommitteeLayout>
  );
}
