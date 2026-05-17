import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function MidTaskEvaluation() {
  const [, setLocation] = useLocation();

  // ================= MOCK AUTH =================
  const loggedInSupervisorId = "SUP-01";
  const loggedInSupervisorName = "Sir Umer";

  // ================= TODAY =================
  const today = new Date().toISOString().split("T")[0];

  // ================= MOCK SUPERVISORS =================
  const supervisors = [
    { id: "SUP-01", name: "Sir Umer" },
    { id: "SUP-02", name: "Sir Zahid" },
    { id: "SUP-03", name: "Sir Ali" },
  ];

  // ================= MOCK MEETINGS =================
  const meetingsToday = [
    {
      groupId: "G-101",
      groupName: "FYP Group 4",
      supervisorId: "SUP-01",
      program: "FYP-2",
      meetingDate: today,
      members: [
        { id: "S1", name: "Rida Iqbal" },
        { id: "S2", name: "Sana Khan" },
      ],
    },
  ];

  // ================= PERMISSION =================
  const allowedGroups = meetingsToday.filter(
    (m) =>
      m.supervisorId === loggedInSupervisorId &&
      m.program === "FYP-2" &&
      m.meetingDate === today
  );

  const supervisorHasMeetingToday = allowedGroups.length > 0;

  // ================= STATE =================
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState({});
  const [evaluators, setEvaluators] = useState({});

  const handleSubmit = (group) => {
    const results = group.members.map((m) => {
      const score = Number(marks[m.id] || 0);
      return {
        studentId: m.id,
        studentName: m.name,
        evaluatedBy: evaluators[m.id],
        score,
        remarks: remarks[m.id] || "",
        status: score >= 15 ? "PASS" : "FAIL",
        finalAllowed: score >= 15,
      };
    });

    const invalid = results.some(
      (r) => !r.evaluatedBy || r.score === 0
    );

    if (invalid) {
      alert("Please assign evaluator & marks for all students ❌");
      return;
    }

    console.log("MID TASK EVALUATION:", {
      groupId: group.groupId,
      evaluations: results,
    });

    alert("Mid Task Evaluation Submitted Successfully ✅");
  };

  // ================= ACCESS DENIED =================
  if (!supervisorHasMeetingToday) {
    return (
      <MobileLayout>
        <AppBar title="Mid Task Evaluation (FYP-2)" />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
          <ShieldAlert className="w-14 h-14 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You have no scheduled meeting today.
          </p>
        </div>
      </MobileLayout>
    );
  }

  // ================= MAIN =================
  return (
    <MobileLayout>
      <AppBar title="Mid Task Evaluation (FYP-2)">
        <button
          onClick={() => setLocation("/supervisor")}
          className="px-3 py-1 text-sm bg-muted rounded-lg"
        >
          Back
        </button>
      </AppBar>

      <div className="p-4 space-y-6">
        {allowedGroups.map((group) => (
          <div
            key={group.groupId}
            className="bg-card border rounded-xl p-4 space-y-4"
          >
            {/* HEADER */}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">{group.groupName}</h2>
            </div>

            {/* RULE */}
            <div className="flex gap-2 text-sm bg-muted p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
              <p>
                Mid Task is <b>30%</b>. Below <b>15</b> → ❌ Final Not Allowed.
              </p>
            </div>

            {/* STUDENTS */}
            <div className="space-y-4">
              {group.members.map((m) => {
                const score = Number(marks[m.id] || 0);
                const failed = score > 0 && score < 15;

                return (
                  <div
                    key={m.id}
                    className="border rounded-lg p-3 space-y-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{m.name}</span>
                      {failed && (
                        <span className="text-xs text-red-500">
                          ❌ Final Not Allowed
                        </span>
                      )}
                    </div>

                    {/* EVALUATOR */}
                    <div className="flex items-center gap-3">
                      <select
                        value={evaluators[m.id] || ""}
                        onChange={(e) =>
                          setEvaluators({
                            ...evaluators,
                            [m.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Evaluator</option>
                        {supervisors.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <UserCheck className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* MARKS */}
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        placeholder="Marks / 30"
                        value={marks[m.id] || ""}
                        onChange={(e) =>
                          setMarks({ ...marks, [m.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* REMARKS */}
                    <div className="flex gap-3">
                      <textarea
                        rows={2}
                        placeholder="Supervisor remarks..."
                        value={remarks[m.id] || ""}
                        onChange={(e) =>
                          setRemarks({
                            ...remarks,
                            [m.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                      />
                      <MessageSquare className="w-5 h-5 text-muted-foreground mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleSubmit(group)}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Submit Mid Task Evaluation
            </button>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}