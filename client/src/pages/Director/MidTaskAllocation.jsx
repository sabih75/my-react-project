"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function MidTaskAllocation() {
  const [location, setLocation] = useLocation();
  const groupId = location.split("/").pop();

  const [group, setGroup] = useState(null);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`${API}/fyp2-scores/groups/${groupId}`);
      setGroup(res.data);
      // Fetch midTask instead of finalTask
      setTask(res.data.midTask || "");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch group");
    }
  };

  const handleSaveTask = async () => {
    if (!task.trim()) {
      alert("Please enter MidTask description");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/fyp2-scores/assign-task`, {
        groupId: groupId,
        taskDescription: task,
        taskTitle: "MidTask" // Passing the taskTitle parameter as "MidTask"
      });

      alert("✅ MidTask Saved Successfully");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const openStudentProgress = (studentId) => {
    setLocation(`/student-progress/${studentId}/FYP-2`);
  };

  if (!group) {
    return (
      <CommitteeHeadLayout>
        <div className="p-6 text-center">Loading...</div>
      </CommitteeHeadLayout>
    );
  }

  return (
    <CommitteeHeadLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLocation(-1)}
            className="text-sm bg-gray-200 px-3 py-1 rounded"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">MidTask Allocation</h1>
          <div />
        </div>

        {/* GROUP CARD */}
        <div className="border rounded-2xl p-5 bg-white shadow-sm space-y-5">
          {/* TOP */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  FYP-2 MidTask
                </span>
              </div>

              <div className="mt-3 bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">Assigned Project</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {group.projectName || "No Project Assigned"}
                </h3>
                {group.projectDescription && (
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {group.projectDescription}
                  </p>
                )}
              </div>
            </div>

            {group.meetingDate && (
              <div className="bg-gray-100 border text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 h-fit">
                🗓️ {group.meetingDate.split("T")[0]}
              </div>
            )}
          </div>

          {/* REMARKS */}
          <div>
            <p className="font-medium text-sm mb-2">Previous Meeting Remarks</p>
            <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-700">
              {group.remarks || "No remarks available"}
            </div>
          </div>

          {/* MEMBERS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-sm">Group Members</p>
              <span className="text-xs text-gray-500">
                {group.members?.length || 0} Students
              </span>
            </div>

            <div className="space-y-3">
              {group.members?.map((m) => (
                <div
                  key={m.regNum}
                  className="border rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.regNum}</p>
                    {m.cgpa && (
                      <p className="text-xs text-gray-400">CGPA: {m.cgpa}</p>
                    )}
                  </div>

                  <button
                    onClick={() => openStudentProgress(m.regNum)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg"
                  >
                    View Progress
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TASK */}
          <div>
            <p className="font-medium text-sm mb-2">Assign MidTask</p>
            <textarea
              rows={5}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Write MidTask description here..."
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveTask}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium"
          >
            {loading ? "Saving..." : "🔄 Save MidTask"}
          </button>
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}
