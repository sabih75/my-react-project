"use client";

import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import axios from "axios";
import { 
  Users, 
  Search, 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import CommitteeLayout from "./CommitteeLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function CommitteeMeetingGroups() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/committee/meeting-groups/:meetingId");
  const meetingId = params?.meetingId;

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (meetingId) {
      fetchGroups();
    }
  }, [meetingId]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/committee-meetings/meeting-groups/${meetingId}`);
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching meeting groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.GroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.groupID?.toString().includes(searchTerm) ||
    g.Supervisor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CommitteeLayout>
      <div style={styles.container}>
        {/* Navigation Header */}
        <div style={styles.navHeader}>
          <button onClick={() => setLocation("/committee/my-meetings")} style={styles.backBtn}>
            <ArrowLeft size={18} />
            Back to Meetings
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>Assigned Groups</h1>
            <p style={styles.subtitle}>Meeting ID: #{meetingId} • {groups.length} Groups Total</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search by group name, ID, or supervisor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
            <p>Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} color="#94a3b8" />
            <h3>No Groups Found</h3>
            <p>{searchTerm ? "Try a different search term" : "No groups are assigned to this meeting yet."}</p>
          </div>
        ) : (
          <div style={styles.groupGrid}>
            {filteredGroups.map((group) => (
              <div key={group.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.groupIcon}>
                    <Users size={20} color="#2563eb" />
                  </div>
                  <div style={styles.nameSection}>
                    <h3 style={styles.groupName}>{group.GroupName || `Group ${group.groupID}`}</h3>
                    <span style={styles.groupId}>ID: #{group.groupID}</span>
                  </div>
                  <div style={{...styles.statusBadge, 
                    backgroundColor: group.Status === "Completed" ? "#ecfdf5" : "#eff6ff",
                    color: group.Status === "Completed" ? "#059669" : "#2563eb"
                  }}>
                    {group.Status || "Upcoming"}
                  </div>
                </div>

                <div style={styles.infoSection}>
                  <div style={styles.infoRow}>
                    <ShieldCheck size={16} color="#64748b" />
                    <span style={styles.infoLabel}>Supervisor:</span>
                    <span style={styles.infoValue}>{group.Supervisor || "Not Assigned"}</span>
                  </div>
                </div>

                <div style={styles.membersList}>
                  <p style={styles.sectionLabel}>Team Members</p>
                  {group.Members?.map((member, idx) => (
                    <div key={idx} style={styles.memberItem}>
                      <User size={14} color="#94a3b8" />
                      <span style={styles.memberName}>{member.Name}</span>
                      <span style={styles.memberId}>({member.studentID})</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setLocation(`/committee/allocation/${group.groupID}`)}
                  style={styles.actionBtn}
                >
                  Manage Allocation
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
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
  navHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "30px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    width: "fit-content",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  searchContainer: {
    marginBottom: "30px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#ffffff",
    padding: "12px 20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "15px",
    color: "#1e293b",
  },
  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },
  groupIcon: {
    padding: "10px",
    backgroundColor: "#eff6ff",
    borderRadius: "12px",
  },
  nameSection: {
    flex: 1,
  },
  groupName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
    lineHeight: "1.2",
  },
  groupId: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoSection: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  infoLabel: {
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    color: "#1e293b",
    fontWeight: "600",
  },
  membersList: {
    marginBottom: "24px",
  },
  sectionLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    marginBottom: "10px",
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  memberName: {
    fontSize: "14px",
    color: "#334155",
    fontWeight: "500",
  },
  memberId: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  actionBtn: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    borderRadius: "12px",
    border: "1px solid #2563eb",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
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
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  }
};
