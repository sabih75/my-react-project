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
      };

      statusMap[t.Id] = status;

      if (!t.StudentId) grouped[t.GroupId].groupTask = task;
      else grouped[t.GroupId].individualTasks.push(task);
    });

    setGroups(Object.values(grouped));
    setTaskStatus(statusMap);
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
                <p>{task.title}</p>

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

                <input
                  type="number"
                  placeholder="Score (optional)"
                  className="w-full mt-2 border rounded p-2"
                  value={scores[task.id] || ""}
                  onChange={(e) =>
                    setScores((p) => ({
                      ...p,
                      [task.id]: e.target.value,
                    }))
                  }
                />

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