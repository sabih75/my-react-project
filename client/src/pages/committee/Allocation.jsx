import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import axios from "axios";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

function SupervisorDashboard() {
  const { groupId } = useParams();
  const [, setLocation] = useLocation();

  const [supervisors, setSupervisors] = useState([]);
  const [mode, setMode] = useState("auto");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [allocatedTo, setAllocatedTo] = useState(null);

  // Fetch supervisors count
  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/committee-meetings/group-count`
      );
      setSupervisors(res.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  // Auto Allocate (least TotalGroups)
  const autoAllocate = () => {
    if (supervisors.length === 0) return null;

    const sorted = [...supervisors].sort(
      (a, b) => a.TotalGroups - b.TotalGroups
    );

    return sorted[0];
  };

  const handleAllocation = async () => {
    let supervisorToAssign = null;

    if (mode === "auto") {
      supervisorToAssign = autoAllocate();
    } else {
      supervisorToAssign = supervisors.find(
        (s) => s.SupervisorId === selectedSupervisor
      );
    }

    if (!supervisorToAssign) {
      alert("Please select a supervisor");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/committee-meetings/allocateSupervisor`,
        {
          groupId: groupId,
          supervisorId: supervisorToAssign.SupervisorId
        }
      );

      alert("Group Allocated Successfully");
      setAllocatedTo(supervisorToAssign.SupervisorName);
      fetchSupervisors(); // refresh counts

      // Back to meeting queue after brief delay
      setTimeout(() => {
        setLocation("/committee/meeting-queue");
      }, 1500);

    } catch (error) {
      console.error("Allocation failed:", error);
      alert("Allocation failed");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Allocate Group {groupId}</h2>

      {/* Mode Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="radio"
            value="auto"
            checked={mode === "auto"}
            onChange={() => setMode("auto")}
          />
          Auto Balanced (Least Load)
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            value="manual"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          Manual
        </label>
      </div>

      {/* Supervisors List */}
      <div style={{ border: "1px solid #ccc", padding: "20px" }}>
        {supervisors.map((s) => (
          <div
            key={s.SupervisorId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee"
            }}
          >
            <div>
              <strong>{s.SupervisorName}</strong>
              <div>Total Groups: {s.TotalGroups}</div>
            </div>

            {mode === "manual" && (
              <input
                type="radio"
                name="supervisor"
                value={s.SupervisorId}
                checked={selectedSupervisor === s.SupervisorId}
                onChange={() =>
                  setSelectedSupervisor(s.SupervisorId)
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleAllocation}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Confirm Allocation
        </button>
      </div>

      {/* Success Message */}
      {allocatedTo && (
        <div style={{ marginTop: "20px", color: "green" }}>
          Allocated To: {allocatedTo}
        </div>
      )}
    </div>
  );
}

export default SupervisorDashboard;
