import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import { Group, Clock, Users, Calendar, AlertTriangle, CheckCircle2, PlayCircle, Filter, ArrowUpDown } from "lucide-react";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function QueueDashboard() {
  const [, setLocation] = useLocation();
  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [groupDetails, setGroupDetails] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupAttended, setGroupAttended] = useState(false);
  const [isProjectAllocated, setIsProjectAllocated] = useState(false);
  const [isSupervisorAllocated, setIsSupervisorAllocated] = useState(false);
  const [activeMeetingType, setActiveMeetingType] = useState(null);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: new Date().toISOString().split("T")[0],
    newStartTime: "10:00",
    newEndTime: "14:00",
    venue: ""
  });

  const [now, setNow] = useState(new Date());

  const meetingTypes = meetings && Array.isArray(meetings) ? [...new Set(meetings.map(m => m.MeetingTitle))] : [];

  useEffect(() => {
    fetchMeetings(activeFYP);
  }, [activeFYP]);

  // Update 'now' every minute to refresh countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto update backend dynamic times every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await axios.post(`${API_BASE}/committee-meetings/update-meeting-times-dynamic`);
        if (res.data.message === "Dynamic average timing applied") {
          fetchMeetings(activeFYP);
        }
      } catch (error) {
        console.error("Auto update failed:", error);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [activeFYP]);

  const calculateMinutesRemaining = (meetingTime) => {
    if (!meetingTime) return null;
    const [hours, minutes] = meetingTime.split(":").map(Number);
    const meetingDate = new Date();
    meetingDate.setHours(hours, minutes, 0, 0);

    const diffMs = meetingDate - now;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  /**
   * Generates the visual time label for each meeting card.
   * Logic:
   * 1. If Completed -> Show "Done"
   * 2. If In-Progress -> Show "Live Now"
   * 3. If Waiting -> Calculate minutes remaining and show: "In X min (Clock Time)"
   */
  const getTimeDisplay = (meeting) => {
    // Check if the meeting is already finished
    if (meeting.Status === "Completed") return "Done";

    // Check if the meeting is currently happening
    if (meeting.Status === "In-Progress") return "Live Now";

    // Calculate minutes between 'Now' and the scheduled 'MeetingTime'
    const mins = calculateMinutesRemaining(meeting.MeetingTime);

    // Safety check for invalid time data
    if (mins === null) return "--:--";

    // Get the clean clock time (HH:MM) from the database string
    const clockTime = meeting.MeetingTime.substring(0, 5);

    // If the meeting time has arrived but they haven't started yet
    if (mins <= 0) return `Due now (${clockTime})`;

    // PRO LOGIC: Show BOTH the countdown and the scheduled clock time
    // Example: "In 45 min (14:15)"
    return `In ${mins} min (${clockTime})`;
  };

  const fetchMeetings = async (fypType) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/committee-meetings/today-meetings/${fypType}`);
      setMeetings(res.data);
      if (!activeMeetingType && res.data.length > 0) {
        setActiveMeetingType(res.data[0].MeetingTitle);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
    }
    setLoading(false);
  };

  const handleMergeMeeting = async () => {
    if (!selectedMeeting) return alert("Select a meeting first");
    try {
      const res = await axios.post(`${API_BASE}/committee-meetings/handle-delay`, {
        meetingId: selectedMeeting,
        action: "merge"
      });
      alert("Remaining groups merged into next scheduled meeting.");
      fetchMeetings(activeFYP);
      setShowDelayOptions(false);
    } catch (err) {
      console.error(err);
      alert("Failed to merge meetings");
    }
  };

  const handleCreateNewMeeting = async () => {
    if (!selectedMeeting) return alert("Select a meeting first");
    try {
      const res = await axios.post(`${API_BASE}/committee-meetings/handle-delay`, {
        meetingId: selectedMeeting,
        action: "new",
        newDate: rescheduleData.newDate,
        newStartTime: rescheduleData.newStartTime + ":00",
        newEndTime: rescheduleData.newEndTime + ":00",
        venue: rescheduleData.venue || meetingDetails?.venue || "TBD",
        sessionID: 1
      });
      alert("New meeting created for remaining groups.");
      fetchMeetings(activeFYP);
      setShowDelayOptions(false);
    } catch (err) {
      console.error(err);
      alert("Failed to reschedule");
    }
  };

  /**
   * Handles Priority Sorting (Gender or Supervisor).
   * Logic:
   * 1. Fetches the prioritized list from the specialized backend endpoint.
   * 2. PRO STEP: Immediately sends the resulting order BACK to the 'update-queue-order' sync endpoint.
   *    This ensures that the Student and Committee dashboards are instantly updated to match.
   */
  /**
   * Handles Priority Sorting (Gender or Supervisor).
   * UPDATED: Now uses the specific Meeting ID of the active tab to prevent mixing panels.
   */
  const handlePrioritySort = async (sortType) => {
    // Identify which meeting room we are currently managing
    const currentMeetingId = filteredMeetings[0]?.id;
    if (!currentMeetingId) {
      alert("No active meeting found for this room.");
      return;
    }

    setLoading(true);
    try {
      // Step A: Call the ISOLATED sorting endpoint for this specific meeting
      const endpoint = sortType === "gender"
        ? `today-meetings-priority/${currentMeetingId}`
        : `today-meetings-supervisor-priority/${currentMeetingId}`;

      const res = await axios.get(`${API_BASE}/committee-meetings/${endpoint}`);
      const sortedData = res.data;

      // Update local state (The backend already re-indexed this specific meeting)
      setMeetings(sortedData);

      // Step B: GLOBAL SYNC (Lock the order for Students/Committee)
      const orderedIds = sortedData.map(m => m.scheduleId);
      await axios.post(`${API_BASE}/committee-meetings/update-queue-order`, orderedIds);

      console.log(`Isolated sync completed for Meeting #${currentMeetingId}`);
    } catch (error) {
      console.error("Sorting sync failed:", error);
    }
    setLoading(false);
  };

  const fetchMeetingDetails = async (meeting) => {
    try {
      const meetingRes = await axios.get(`${API_BASE}/committee-meetings/meetings/${meeting.id}`);
      const meetingData = meetingRes.data[0];
      setMeetingDetails(meetingData);
      setSelectedMeeting(meeting.id);
      setSelectedGroup(meeting.GroupIDs);
      setRescheduleData(prev => ({ ...prev, venue: meetingData.venue }));

      const groupRes = await axios.get(`${API_BASE}/committee-meetings/getSpecificGroup/${meeting.GroupIDs}`);
      setGroupDetails(groupRes.data);

      const resCheck = await axios.get(`${API_BASE}/committee-meetings/get-group-attendance?groupId=${meeting.GroupIDs}&meetingId=${meeting.id}`);
      setGroupAttended(resCheck.data.IsAttend);

      const projectRes = await axios.get(`${API_BASE}/committee-meetings/IsProjectAllocate/${meeting.GroupIDs}`);
      const supervisorRes = await axios.get(`${API_BASE}/committee-meetings/IsSupervisorAllocate/${meeting.GroupIDs}`);
      setIsProjectAllocated(projectRes.data);
      setIsSupervisorAllocated(supervisorRes.data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleGroupAttendanceChange = async () => {
    const nextState = !groupAttended;
    setGroupAttended(nextState);
    try {
      await axios.post(`${API_BASE}/committee-meetings/update-group-attendance`, {
        GroupId: selectedGroup,
        MeetingId: selectedMeeting,
        IsAttended: nextState
      });
      fetchMeetings(activeFYP);
    } catch (error) {
      console.error("Attendance update failed:", error);
      setGroupAttended(!nextState);
    }
  };

  const handleCompleteMeeting = async () => {
    try {
      await axios.post(`${API_BASE}/committee-meetings/update-group-status`, {
        GroupId: selectedGroup,
        MeetingId: selectedMeeting,
        Status: "Completed"
      });
      setMeetingDetails(null);
      fetchMeetings(activeFYP);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const filteredMeetings = activeMeetingType
    ? meetings.filter(m =>
      m.MeetingTitle === activeMeetingType &&
      m.Status !== "Completed"
    )
    : [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Queue Handler Dashboard</h1>
            <p style={styles.subtitle}>Manage student evaluation queues and meeting schedules</p>
          </div>

          <div style={styles.tabContainer}>
            {["FYP-1", "FYP-2"].map((phase) => (
              <button
                key={phase}
                onClick={() => {
                  setActiveFYP(phase);
                  setMeetingDetails(null);
                  fetchMeetings(phase);
                }}
                style={{
                  ...styles.tabButton,
                  ...(activeFYP === phase ? styles.activeTab : {})
                }}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.actionBar}>
          <div style={styles.filterSection}>
            <span style={styles.label}>Meeting Type:</span>
            <div style={styles.typeButtons}>
              {meetingTypes.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveMeetingType(type);
                    setMeetingDetails(null);
                  }}
                  style={{
                    ...styles.typeBtn,
                    ...(activeMeetingType === type ? styles.activeTypeBtn : {})
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.sortButtons}>
            <button onClick={() => handlePrioritySort("gender")} style={styles.genderSortBtn}>
              Sort by Gender
            </button>
            <button onClick={() => handlePrioritySort("supervisor")} style={styles.supervisorSortBtn}>
              Sort by Supervisor
            </button>
          </div>
        </div>

        {selectedMeeting && (
          <div style={styles.delayCard}>
            <div style={styles.delayHeader}>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <AlertTriangle color="#d97706" size={24} />
                <div>
                  <h3 style={{ margin: 0, color: "#92400e" }}>Delay Management</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#b45309" }}>Handle delays for current meeting type</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDelayOptions(!showDelayOptions)} style={styles.delayOptionBtn}>
                  {showDelayOptions ? "Hide Options" : "Manage Delay"}
                </button>
                <button onClick={handleMergeMeeting} style={styles.mergeBtn}>
                  Merge into Next
                </button>
              </div>
            </div>

            {showDelayOptions && (
              <div style={styles.delayForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>New Date</label>
                  <input
                    type="date"
                    value={rescheduleData.newDate}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Start Time</label>
                  <input
                    type="time"
                    value={rescheduleData.newStartTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newStartTime: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Venue</label>
                  <input
                    type="text"
                    value={rescheduleData.venue}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, venue: e.target.value })}
                    placeholder="Enter Venue"
                    style={styles.input}
                  />
                </div>
                <button onClick={handleCreateNewMeeting} style={styles.confirmBtn}>
                  Confirm Reschedule
                </button>
              </div>
            )}
          </div>
        )}

        <div style={styles.mainLayout}>

          <div style={{ flex: 1 }}>
            <h3 style={styles.sectionTitle}>Current Queue ({filteredMeetings.length})</h3>
            <div style={styles.cardGrid}>
              {loading ? <p>Loading...</p> :
                (meetings && Array.isArray(meetings)) && filteredMeetings.map((meeting) => (
                  <div
                    key={`${meeting.scheduleId}`}
                    onClick={() => fetchMeetingDetails(meeting)}
                    style={{
                      ...styles.meetingCard,
                      ...(selectedMeeting === meeting.id && selectedGroup === meeting.GroupIDs ? styles.selectedCard : {})
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.groupLabel}>Group {meeting.GroupIDs}</span>
                      <span style={{
                        ...styles.statusBadge,
                        ...(meeting.Status === "Completed" ? styles.statusDone :
                          meeting.Status === "In-Progress" ? styles.statusActive : {})
                      }}>
                        {meeting.Status}
                      </span>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                        <Users size={14} color="#64748b" />
                        <span style={{ fontSize: "13px", color: "#475569" }}>{meeting.SupervisorName || "No Supervisor"}</span>
                      </div>
                      <div style={styles.cardFooter}>
                        <Clock size={14} color="#2563eb" />
                        <span style={{ fontWeight: "bold", color: "#2563eb" }}>
                          {getTimeDisplay(meeting)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {meetingDetails && (
            <div style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <h3 style={{ margin: 0 }}>Group {selectedGroup} Details</h3>
                <button onClick={() => setMeetingDetails(null)} style={styles.closeBtn}>✖</button>
              </div>

              <div style={styles.sidebarContent}>
                <div style={styles.infoRow}>
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>Project</span>
                    <span style={styles.infoValue}>{isProjectAllocated ? "Allocated ✅" : "Pending ❌"}</span>
                  </div>
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>Supervisor</span>
                    <span style={styles.infoValue}>{isSupervisorAllocated ? "Allocated ✅" : "Pending ❌"}</span>
                  </div>
                </div>

                <div style={styles.attendanceSection}>
                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={groupAttended}
                      onChange={handleGroupAttendanceChange}
                    />
                    Mark Group Attended
                  </label>

                  <div style={styles.studentList}>
                    {groupDetails.map((s, i) => (
                      <div key={i} style={styles.studentItem}>
                        <div>
                          <div style={{ fontWeight: "bold" }}>{s.studentName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>ID: {s.studentID}</div>
                        </div>
                        {groupAttended && <CheckCircle2 size={16} color="#22c55e" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleCompleteMeeting} style={styles.completeMeetingBtn}>
                  Mark Session Completed
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },
  title: { margin: 0, fontSize: "28px", color: "#0f172a" },
  subtitle: { margin: "5px 0 0 0", color: "#64748b" },
  tabContainer: {
    display: "flex",
    backgroundColor: "#e2e8f0",
    padding: "4px",
    borderRadius: "8px"
  },
  tabButton: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "transparent",
    color: "#475569"
  },
  activeTab: {
    backgroundColor: "white",
    color: "#2563eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px"
  },
  filterSection: { display: "flex", alignItems: "center", gap: "10px" },
  label: { fontWeight: "bold", color: "#475569", fontSize: "14px" },
  typeButtons: { display: "flex", gap: "8px" },
  typeBtn: {
    padding: "6px 15px",
    borderRadius: "20px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px"
  },
  activeTypeBtn: {
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    borderColor: "#2563eb",
    fontWeight: "bold"
  },
  sortButtons: { display: "flex", gap: "10px" },
  genderSortBtn: {
    padding: "8px 15px",
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  supervisorSortBtn: {
    padding: "8px 15px",
    backgroundColor: "#ea580c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  delayCard: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "30px"
  },
  delayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  delayOptionBtn: {
    padding: "8px 16px",
    backgroundColor: "#d97706",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  mergeBtn: {
    padding: "8px 16px",
    backgroundColor: "white",
    color: "#92400e",
    border: "1px solid #d97706",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  delayForm: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    padding: "15px",
    backgroundColor: "white",
    borderRadius: "8px"
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  inputLabel: { fontSize: "12px", fontWeight: "bold", color: "#64748b" },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" },
  confirmBtn: {
    alignSelf: "flex-end",
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  mainLayout: { display: "flex", gap: "30px" },
  sectionTitle: { fontSize: "18px", color: "#334155", marginBottom: "15px" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "15px"
  },
  meetingCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "15px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "0.2s"
  },
  selectedCard: { borderColor: "#2563eb", boxShadow: "0 0 0 2px #dbeafe" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  groupLabel: { fontWeight: "bold", color: "#1e293b" },
  statusBadge: { padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#f1f5f9", color: "#64748b" },
  statusActive: { backgroundColor: "#dbeafe", color: "#2563eb" },
  statusDone: { backgroundColor: "#dcfce7", color: "#15803d" },
  cardFooter: { display: "flex", alignItems: "center", gap: "5px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" },
  sidebar: {
    width: "350px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    height: "fit-content",
    position: "sticky",
    top: "20px"
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  closeBtn: { border: "none", background: "none", cursor: "pointer", fontSize: "18px" },
  sidebarContent: { padding: "20px" },
  infoRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  infoBox: { flex: 1, backgroundColor: "#f8fafc", padding: "10px", borderRadius: "8px", textAlign: "center" },
  infoLabel: { display: "block", fontSize: "10px", color: "#64748b", fontWeight: "bold", marginBottom: "4px" },
  infoValue: { fontSize: "12px", fontWeight: "bold", color: "#1e293b" },
  attendanceSection: { marginBottom: "20px" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#334155", cursor: "pointer", marginBottom: "15px" },
  studentList: { display: "flex", flexDirection: "column", gap: "10px" },
  studentItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "8px" },
  completeMeetingBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
