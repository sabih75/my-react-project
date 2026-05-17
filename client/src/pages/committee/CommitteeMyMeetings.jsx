"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  Filter
} from "lucide-react";
import CommitteeLayout from "./CommitteeLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function CommitteeMyMeetings() {
  const [, setLocation] = useLocation();
  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    description: "",
    venue: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    selectedDays: [],
    isGraded: false,
    pptRequired: false,
    sessionID: null
  });

  // Get logged in user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    fetchMyMeetings();
  }, [activeFYP]);

  const fetchMyMeetings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/committee-meetings/my-meetings/${userId}/${activeFYP}`);
      setMeetings(res.data);
    } catch (error) {
      console.error("Error fetching my meetings:", error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const getOccurringDaysOfWeek = (startStr, endStr) => {
    if (!startStr || !endStr) return [];
    
    const parseLocalDate = (dateStr) => {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    };

    const start = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    if (start > end) return [];

    const occurringDays = new Set();
    const current = new Date(start);

    const dayDiff = Math.round((end - start) / (1000 * 3600 * 24));
    if (dayDiff >= 7) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }

    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    while (current <= end) {
      occurringDays.add(dayMap[current.getDay()]);
      current.setDate(current.getDate() + 1);
    }

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return orderedDays.filter((d) => occurringDays.has(d));
  };

  const occurringDays = getOccurringDaysOfWeek(editForm.startDate, editForm.endDate);

  // Auto-clean selectedDays when date range changes in edit form
  useEffect(() => {
    if (showEditModal) {
      setEditForm((prev) => {
        const cleanedDays = prev.selectedDays.filter((day) => occurringDays.includes(day));
        if (JSON.stringify(cleanedDays) !== JSON.stringify(prev.selectedDays)) {
          return { ...prev, selectedDays: cleanedDays };
        }
        return prev;
      });
    }
  }, [editForm.startDate, editForm.endDate, showEditModal]);

  const toggleEditDay = (day) => {
    setEditForm((prev) => {
      const updatedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];
      return { ...prev, selectedDays: updatedDays };
    });
  };

  const handleOpenEditModal = async (meetingId) => {
    try {
      const res = await axios.get(`${API_BASE}/committee-meetings/meetings/${meetingId}`);
      if (res.data && res.data.length > 0) {
        const m = res.data[0];
        setEditForm({
          id: m.id,
          title: m.title || "",
          description: m.meetingDescription || "",
          venue: m.venue || "",
          startDate: m.startDate ? m.startDate.split("T")[0] : "",
          endDate: m.endDate ? m.endDate.split("T")[0] : "",
          startTime: m.startTime ? m.startTime.slice(0, 5) : "",
          endTime: m.endTime ? m.endTime.slice(0, 5) : "",
          selectedDays: m.days ? m.days.split(",").map((d) => d.trim()) : [],
          isGraded: m.isGraded || false,
          pptRequired: m.isFileRequired || false,
          sessionID: m.sessionID
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      alert("Failed to load meeting details.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this meeting? This will delete all schedules, queues, and attendance associated with it permanently!"
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/committee-meetings/${meetingId}`);
      alert("Meeting deleted successfully!");
      fetchMyMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete the meeting.");
    }
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE}/committee-meetings/${editForm.id}?type=${activeFYP}&userId=${userId}`,
        {
          title: editForm.title,
          meetingDescription: editForm.description,
          venue: editForm.venue,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          selectedDays: editForm.selectedDays,
          sessionID: editForm.sessionID,
          isGraded: editForm.isGraded,
          isFileRequired: editForm.pptRequired
        }
      );
      alert("Meeting updated successfully!");
      setShowEditModal(false);
      fetchMyMeetings();
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert(error.response?.data?.Message || "Failed to update meeting details.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Ongoing":
        return { bg: "#ecfdf5", text: "#059669", border: "#10b981", icon: <Activity size={14} className="animate-pulse" /> };
      case "Past":
        return { bg: "#f8fafc", text: "#64748b", border: "#cbd5e1", icon: <CheckCircle2 size={14} /> };
      case "Incoming":
        return { bg: "#eff6ff", text: "#2563eb", border: "#3b82f6", icon: <Clock size={14} /> };
      default:
        return { bg: "#f3f4f6", text: "#4b5563", border: "#9ca3af", icon: <Clock size={14} /> };
    }
  };

  return (
    <CommitteeLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Scheduled Meetings</h1>
            <p style={styles.subtitle}>Manage and monitor your evaluation sessions</p>
          </div>

          {/* FYP Toggle */}
          <div style={styles.toggleContainer}>
            <button
              onClick={() => setActiveFYP("FYP-1")}
              style={{ ...styles.toggleBtn, ...(activeFYP === "FYP-1" ? styles.activeToggle : {}) }}
            >
              FYP-1
            </button>
            <button
              onClick={() => setActiveFYP("FYP-2")}
              style={{ ...styles.toggleBtn, ...(activeFYP === "FYP-2" ? styles.activeToggle : {}) }}
            >
              FYP-2
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
            <p>Loading your meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} color="#94a3b8" />
            <h3>No Meetings Found</h3>
            <p>You haven't scheduled any {activeFYP} meetings yet.</p>
            <button
              onClick={() => setLocation("/committee/schedule")}
              style={styles.createBtn}
            >
              Schedule New Meeting
            </button>
          </div>
        ) : (
          <div style={styles.meetingGrid}>
            {meetings.map((meeting) => {
              const status = getStatusStyle(meeting.Status);
              return (
                <div key={meeting.MeetingId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
                      {status.icon}
                      <span style={{ marginLeft: "6px", fontWeight: "600", fontSize: "12px" }}>{meeting.Status}</span>
                    </div>
                    <span style={styles.meetingId}>ID: #{meeting.MeetingId}</span>
                  </div>

                  <h3 style={styles.meetingTitle}>{meeting.MeetingTitle || "Untitled Evaluation"}</h3>
                  <p style={styles.description}>{meeting.Description || "No description provided."}</p>

                  <div style={styles.detailsList}>
                    <div style={styles.detailItem}>
                      <Calendar size={16} color="#64748b" />
                      <span>{new Date(meeting.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <MapPin size={16} color="#64748b" />
                      <span>{meeting.Venue || "TBD"}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <Users size={16} color="#64748b" />
                      <span>{meeting.GroupCount} Groups Assigned</span>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      onClick={() => setLocation(`/committee/meeting-queue/${meeting.MeetingId}`)}
                      style={styles.primaryAction}
                    >
                      Manage Queue
                      <ChevronRight size={16} />
                    </button>

                    {(meeting.Status === "Incoming" || meeting.Status === "Ongoing") && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(meeting.MeetingId)}
                          style={styles.editBtn}
                          title="Edit Meeting"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.MeetingId)}
                          style={styles.deleteBtn}
                          title="Delete Meeting"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EDIT MEETING MODAL */}
        {showEditModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContainer}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit Scheduled Meeting</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={styles.closeBtn}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateMeeting} style={styles.modalForm}>
                {/* TITLE */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Meeting Title</label>
                  <input
                    type="text"
                    required
                    style={styles.input}
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter meeting title..."
                  />
                </div>

                {/* DESCRIPTION */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    required
                    style={{ ...styles.input, height: "80px", resize: "none" }}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter meeting description..."
                  />
                </div>

                {/* VENUE */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Venue</label>
                  <input
                    type="text"
                    required
                    style={styles.input}
                    value={editForm.venue}
                    onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    placeholder="Enter venue..."
                  />
                </div>

                {/* DATES */}
                <div style={styles.rowGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Date</label>
                    <input
                      type="date"
                      required
                      style={styles.input}
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Date</label>
                    <input
                      type="date"
                      required
                      style={styles.input}
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* TIMES */}
                <div style={styles.rowGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Time</label>
                    <input
                      type="time"
                      required
                      style={styles.input}
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Time</label>
                    <input
                      type="time"
                      required
                      style={styles.input}
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* DAYS OCCURRENCE SELECTOR */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Days occurring in range</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    {occurringDays.length > 0 ? (
                      occurringDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleEditDay(day)}
                          style={{
                            ...styles.dayBadge,
                            ...(editForm.selectedDays.includes(day) ? styles.activeDayBadge : {}),
                          }}
                        >
                          {day}
                        </button>
                      ))
                    ) : (
                      <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", margin: 0 }}>
                        Choose valid start and end dates first.
                      </p>
                    )}
                  </div>
                </div>

                {/* TOGGLES */}
                <div style={{ display: "flex", gap: "20px", marginTop: "12px", marginBottom: "12px" }}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.isGraded}
                      onChange={(e) => setEditForm({ ...editForm, isGraded: e.target.checked })}
                      style={{ marginRight: "8px" }}
                    />
                    Is Graded
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.pptRequired}
                      onChange={(e) => setEditForm({ ...editForm, pptRequired: e.target.checked })}
                      style={{ marginRight: "8px" }}
                    />
                    PPT Required
                  </label>
                </div>

                {/* ACTION BUTTONS */}
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CommitteeLayout>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  toggleContainer: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  toggleBtn: {
    padding: "8px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "transparent",
  },
  activeToggle: {
    backgroundColor: "#ffffff",
    color: "#2563eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  meetingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "9999px",
    border: "1px solid",
  },
  meetingId: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  meetingTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
    lineHeight: "1.4",
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    height: "40px",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#475569",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "auto",
  },
  primaryAction: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  secondaryAction: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  createBtn: {
    marginTop: "12px",
    padding: "10px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    gap: "15px",
    color: "#64748b",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  editBtn: {
    padding: "10px 16px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    padding: "10px 16px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "30px",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "750",
    color: "#1e293b",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#64748b",
    cursor: "pointer",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  rowGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s",
  },
  dayBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  activeDayBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "500",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  }
};
