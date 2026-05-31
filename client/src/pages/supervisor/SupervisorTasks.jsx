import { useState, useEffect } from "react";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import SupervisorLayout from "./SupervisorLayout";
import axios from "axios";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

// 🔁 status mapper
const mapToBackendStatus = (status) => {
  if (status === "initial") return "Initial";
  if (status === "partial") return "Partial";
  if (status === "complete") return "Complete";
  return "Initial";
};

export default function SupervisorTasks() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");

  const [selectedFYP, setSelectedFYP] = useState(params.get("fyp") || "FYP-1");
  const supervisorId =
    JSON.parse(localStorage.getItem("user") || "{}")?.id || "S001";

  const [view, setView] = useState("group-list");
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [tab, setTab] = useState("uncompleted");

  const [taskStatus, setTaskStatus] = useState({});
  const [remarks, setRemarks] = useState({});
  const [scores, setScores] = useState({});

  // ================= LOAD TASKS =================
  useEffect(() => {
    loadTasks();
  }, [selectedFYP]);

  const loadTasks = async () => {
    const res = await axios.get(
      `${API_BASE}/supervisor/getAllTasks/${supervisorId}/${selectedFYP}`
    );

    const grouped = {};
    const statusMap = {};
    const remarksMap = {};
    const scoresMap = {};

    (res.data || []).forEach((t) => {
      if (!grouped[t.GroupId]) {
        grouped[t.GroupId] = {
          groupId: t.GroupId,
          groupName: `Group ${t.GroupId}`,
          groupTask: null,
          individualTasks: [],
        };
      }

      const status =
        t.TaskStatus?.toLowerCase().includes("complete")
          ? "complete"
          : t.TaskStatus?.toLowerCase().includes("progress")
          ? "partial"
          : "initial";

      const task = {
        id: t.Id,
        title: t.Title,
        dueDate: t.DueDate,
        status,
        studentName: t.StudentName,
        isPptRequired: t.IsPptRequired,
        submissionFilePath: t.SubmissionFilePath,
      };

      statusMap[t.Id] = status;
      remarksMap[t.Id] = t.Remarks || "";
      scoresMap[t.Id] = t.Score !== undefined && t.Score !== null ? t.Score.toString() : "";

      if (!t.StudentId) grouped[t.GroupId].groupTask = task;
      else grouped[t.GroupId].individualTasks.push(task);
    });

    setGroups(Object.values(grouped));
    setTaskStatus(statusMap);
    setRemarks(remarksMap);
    setScores(scoresMap);
  };

  // ================= SAVE EVALUATION =================
  const submitEvaluation = async (taskId) => {
    try {
      await axios.post(`${API_BASE}/supervisor/evaluate-task`, {
        taskId,
        progressStatus: mapToBackendStatus(taskStatus[taskId]),
        remarks: remarks[taskId] || "",
        score: scores[taskId] ? Number(scores[taskId]) : null,
      });

      alert("Evaluation saved ✅");
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to save evaluation ❌");
    }
  };

  // ================= STATUS UI =================
  const StatusRadios = ({ id }) => (
    <div className="flex gap-3 mt-2">
      {["initial", "partial", "complete"].map((v) => (
        <label key={v} className="flex items-center gap-1 text-sm capitalize">
          <input
            type="radio"
            checked={taskStatus[id] === v}
            onChange={() =>
              setTaskStatus((p) => ({ ...p, [id]: v }))
            }
          />
          {v}
        </label>
      ))}
    </div>
  );

  // ================= FILTER =================
  const visibleGroups = groups.filter((g) => {
    const all = [g.groupTask, ...g.individualTasks].filter(Boolean);
    return tab === "completed"
      ? all.every((t) => taskStatus[t.id] === "complete")
      : all.some((t) => taskStatus[t.id] !== "complete");
  });

  return (
    <SupervisorLayout>
      <AppBar
        title={
          view === "group-list"
            ? `Assigned Tasks (${selectedFYP})`
            : activeGroup?.groupName
        }
      />

      {/* FYP Toggle */}
      <div className="flex justify-center gap-3 mt-3">
        {["FYP-1", "FYP-2"].map((fyp) => (
          <button
            key={fyp}
            onClick={() => setSelectedFYP(fyp)}
            className={`px-4 py-1 rounded-full border ${
              selectedFYP === fyp ? "bg-primary text-white" : ""
            }`}
          >
            {fyp}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-around mt-3 border-b">
        {["uncompleted", "completed"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 ${
              tab === t && "border-b-2 border-primary font-semibold"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Group List */}
      {view === "group-list" && (
        <div className="p-4 space-y-3">
          {visibleGroups.map((g) => (
            <div
              key={g.groupId}
              onClick={() => {
                setActiveGroup(g);
                setView("group-details");
              }}
              className="border p-4 rounded-xl cursor-pointer"
            >
              <p className="font-semibold">{g.groupName}</p>
              <p className="text-sm text-muted-foreground">
                {g.groupTask?.title}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Group Details */}
      {view === "group-details" && activeGroup && (
        <div className="p-4 space-y-6">
          {[activeGroup.groupTask, ...activeGroup.individualTasks]
            .filter(Boolean)
            .map((task) => (
              <div key={task.id} className="border rounded-xl p-4">
                <p className="font-semibold">
                  {task.studentName || "Group Task"}
                </p>
                <p className="text-sm font-semibold">{task.title}</p>

                {task.isPptRequired && (
                  <div className="mt-3 p-3 bg-muted/40 rounded-lg border text-xs space-y-2">
                    <span className="font-bold text-muted-foreground uppercase tracking-wider block">PPT Presentation:</span>
                    {task.submissionFilePath ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✅ Submitted Presentation PPT
                        </span>
                        <a
                          href={`http://localhost/ProgressMonitoringProject${task.submissionFilePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded text-[11px] transition shadow-sm"
                        >
                          View / Download PPT
                        </a>
                      </div>
                    ) : (
                      <span className="text-amber-600 italic">
                        ⏳ Student has not uploaded the PPT yet.
                      </span>
                    )}
                  </div>
                )}

                <StatusRadios id={task.id} />

                <textarea
                  placeholder="Supervisor remarks"
                  className="w-full mt-2 border rounded p-2"
                  value={remarks[task.id] || ""}
                  onChange={(e) =>
                    setRemarks((p) => ({
                      ...p,
                      [task.id]: e.target.value,
                    }))
                  }
                />

                <div className="mt-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Obtained Score (Out of 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Score (0 - 100)"
                    className="w-full border rounded p-2"
                    value={scores[task.id] || ""}
                    onChange={(e) =>
                      setScores((p) => ({
                        ...p,
                        [task.id]: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  className="w-full mt-3"
                  onClick={() => submitEvaluation(task.id)}
                >
                  Save Evaluation
                </Button>
              </div>
            ))}
        </div>
      )}
    </SupervisorLayout>
  );
}