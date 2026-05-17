import { useState } from "react";
import { useLocation } from "wouter";
import { AppBar } from "@/components/AppBar";
import { MobileLayout } from "@/components/MobileLayout";
import { ClipboardList, CheckCircle, User } from "lucide-react";

export default function MidTaskAllocation() {
  const [, setLocation] = useLocation();

  // ---------------- SAMPLE FYP-2 MID TASK DATA (SUPERVISOR) ----------------
  const groups = [
    {
      id: "g2",
      name: "Group 2",
      supervisor: "Sir Zahid",
      fypPhase: "FYP-2",
      description: "IoT Smart Farming Platform",
      meetingDate: "2025-03-10",
      remarks: "Backend completed. Need sensor data optimization.",
      midTask: "",
    },
    {
      id: "g3",
      name: "Group 3",
      supervisor: "Sir Umar",
      fypPhase: "FYP-2",
      description: "Blockchain Document Verification",
      meetingDate: "2025-03-10",
      remarks: "Smart contracts finalized. UI pending.",
      midTask: "",
    },
    {
      id: "g7",
      name: "Group 7",
      supervisor: "Dr. Hassan",
      fypPhase: "FYP-2",
      description: "AI-Powered Smart Hostel Management",
      meetingDate: "2025-03-10",
      remarks: "AI model accuracy needs improvement.",
      midTask: "",
    },
  ];

  const [taskData, setTaskData] = useState(() =>
    groups.reduce((acc, grp) => {
      acc[grp.id] = grp.midTask || "";
      return acc;
    }, {})
  );

  const handleTaskChange = (groupId, value) => {
    setTaskData({ ...taskData, [groupId]: value });
  };

  const handleSaveTask = (groupId) => {
    const savedTask = taskData[groupId];

    if (!savedTask.trim()) {
      alert("Please enter a mid task before saving.");
      return;
    }

    alert(`Mid Task Assigned Successfully:\n${savedTask}`);
  };

  return (
    <MobileLayout>
      <AppBar title="Assign Mid Task (FYP-2)">
        <button
          onClick={() => setLocation("/supervisor")}
          className="p-2 rounded-lg bg-muted"
        >
          Back
        </button>
      </AppBar>

      <div className="p-4 space-y-6">
        {/* ---------------- PAGE TITLE ---------------- */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Mid Task Allocation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisor assigns mid-semester tasks to FYP-2 groups
          </p>
        </div>

        {/* ---------------- GROUP LIST ---------------- */}
        {groups.map((grp) => (
          <div
            key={grp.id}
            className="bg-card border rounded-xl p-4 space-y-3 shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{grp.name}</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {grp.meetingDate}
              </span>
            </div>

            {/* SUPERVISOR */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              Supervisor: <span className="font-medium">{grp.supervisor}</span>
            </div>

            <p className="text-sm text-muted-foreground">{grp.description}</p>

            {/* REMARKS */}
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Previous Remarks:</p>
              <p className="text-muted-foreground">{grp.remarks}</p>
            </div>

            {/* MID TASK INPUT */}
            <div>
              <label className="text-sm font-medium">Assign Mid Task</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                rows={3}
                value={taskData[grp.id]}
                onChange={(e) =>
                  handleTaskChange(grp.id, e.target.value)
                }
                placeholder="Write mid-semester task assigned by supervisor..."
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={() => handleSaveTask(grp.id)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Save Mid Task
            </button>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}