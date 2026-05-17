import { useState, useEffect } from "react";
import { AppBar } from "@/components/AppBar";
import { useLocation } from "wouter";
import axios from "axios";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

/* ================= TYPES ================= */

interface Member {
  studentName: string;
  Cgpa: number;
  technology?: string;
}

interface Group {
  groupName: number;
  projectTitle: string;
  members: Member[];
  progress: number;
}

/* ================= COMPONENT ================= */

export default function SupervisorDashboard() {
  const [, setLocation] = useLocation();
  const [selectedFYP, setSelectedFYP] = useState<"FYP-1" | "FYP-2">("FYP-1");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFYP]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const user = localStorage.getItem("user");
      if (!user) return;

      const supervisorId = JSON.parse(user).id;

      const res = await axios.get(
        `${API_BASE}/supervisor/getAllGroups/${selectedFYP}/${supervisorId}`
      );

      setGroups(res.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorLayout>
      <div className="bg-muted/40 min-h-screen">
        <AppBar title="Supervisor Dashboard" />

        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* ================= WELCOME & STATS ================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome Back!</h1>
              <p className="text-muted-foreground">Manage your groups and monitor their progress.</p>
            </div>

            {/* FYP Toggle Pill */}
            <div className="flex bg-card border rounded-lg p-1 shadow-sm w-fit self-start">
              {(["FYP-1", "FYP-2"] as const).map((fyp) => (
                <button
                  key={fyp}
                  onClick={() => setSelectedFYP(fyp)}
                  className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                    selectedFYP === fyp
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {fyp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground font-medium">Assigned Groups</p>
              <p className="text-3xl font-bold mt-1">{groups.length}</p>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground font-medium">Active Students</p>
              <p className="text-3xl font-bold mt-1">
                {groups.reduce((acc, g) => acc + g.members.length, 0)}
              </p>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
               <p className="text-sm text-muted-foreground font-medium">Phase</p>
               <p className="text-3xl font-bold mt-1 text-primary">{selectedFYP}</p>
            </div>
          </div>

          {/* ================= GROUPS LIST ================= */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Assigned {selectedFYP} Groups
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12 bg-card border rounded-xl border-dashed">
                <p className="text-muted-foreground">No groups assigned for {selectedFYP}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      setLocation(
                        `/supervisor/group-detail/${group.groupName}/${selectedFYP}`
                      )
                    }
                    className="group bg-card border border-border rounded-xl p-5 shadow-sm cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          Group {group.groupName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                          {group.projectTitle}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {group.groupName}
                      </div>
                    </div>

                    {/* MEMBERS MINI LIST */}
                    <div className="space-y-2 mb-6">
                      {group.members.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                          <span className="font-medium truncate flex-1">{m.studentName}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded border">
                            {m.technology || "General"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">Overall Progress</span>
                        <span className={`font-bold ${
                          group.progress >= 75 ? "text-green-600" : group.progress >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {group.progress ?? 0}%
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            group.progress >= 75
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : group.progress >= 50
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-red-400 to-red-600"
                          }`}
                          style={{
                            width: `${Math.min(Math.max(group.progress ?? 0, 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}