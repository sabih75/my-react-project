import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function AttendanceGroupDetails() {
  const [groups, setGroups] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = user?.id;

  const params = new URLSearchParams(window.location.search);
  const selectedFYP = params.get("fyp") || "FYP-1";

  useEffect(() => {
    if (supervisorId) loadGroups();
  }, [supervisorId, selectedFYP]);

  // ================= LOAD GROUPS + ATTENDANCE =================
  const loadGroups = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/getAllGroups/${selectedFYP}/${supervisorId}`
      );

      const groupsData = res.data || [];

      // 🔥 Attach attendance per group
      const updatedGroups = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const attendanceRes = await axios.get(
              `${API_BASE}/supervisor/get-group-members-attendance/${group.groupName}`
            );

            const attendanceList = attendanceRes.data || [];

            // 🔥 merge attendance with members
            const updatedMembers = group.members.map((m) => {
              const found = attendanceList.find(
                (a) => a.name === m.studentName
              );

              return {
                ...m,
                attendancePercentage: found?.attendancePercentage || 0,
              };
            });

            return {
              ...group,
              members: updatedMembers,
            };
          } catch {
            return group;
          }
        })
      );

      setGroups(updatedGroups);
    } catch (err) {
      console.error(err);
      setGroups([]);
    }
  };

  return (
    <SupervisorLayout>
      <AppBar title={`Attendance (${selectedFYP})`}>
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </AppBar>

      <div className="p-4 space-y-6">

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No groups found.
          </p>
        ) : (
          groups.map((group, i) => (
            <div
              key={i}
              className="bg-card border rounded-xl p-4"
            >
              {/* GROUP */}
              <h3 className="font-semibold text-lg">
                Group {group.groupName}
              </h3>

              <p className="text-xs text-muted-foreground mb-3">
                {group.projectTitle || "No Project Title"}
              </p>

              {/* MEMBERS */}
              <div className="space-y-3">
                {group.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-muted/20 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{m.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        Reg: {m.studentRegNum} | CGPA: {m.Cgpa}
                      </p>
                    </div>

                    {/* ATTENDANCE */}
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {m.attendancePercentage}%
                      </p>

                      <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{
                            width: `${m.attendancePercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </SupervisorLayout>
  );
}