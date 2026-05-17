"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorMeetings() {
  const [location, setLocation] = useLocation();

  const [activeFYP, setActiveFYP] = useState("FYP-1");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [meetingsData, setMeetingsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchSupervisorMeetings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/getSupervisorMeetings/${supervisorId}/${activeFYP}`
      );
      setMeetingsData(res.data || []);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      setMeetingsData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (supervisorId) fetchSupervisorMeetings();
  }, [activeFYP, supervisorId]);

  // ================= DATE PARSER =================
  const parseMeetingDateTime = (meeting) => {
    try {
      if (meeting.Date?.includes("T")) {
        return new Date(meeting.Date);
      }
      return new Date(`${meeting.Date}T${meeting.Time || "00:00:00"}`);
    } catch {
      return null;
    }
  };

  // ================= SEARCH FILTER =================
  const filteredMeetings = useMemo(() => {
    return meetingsData.filter((m) =>
      `${m.GroupId || ""} ${m.memberName || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [meetingsData, searchTerm]);

  // ================= CATEGORIZATION =================
  const categorized = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = {
      today: [],
      upcoming: [],
      past: [],
    };

    filteredMeetings.forEach((meeting) => {
      const dt = parseMeetingDateTime(meeting);

      if (!dt || isNaN(dt)) {
        result.past.push(meeting);
        return;
      }

      const meetingDate = new Date(dt);
      meetingDate.setHours(0, 0, 0, 0);

      if (meetingDate.getTime() === today.getTime()) {
        result.today.push(meeting);
      } else if (meetingDate > today) {
        result.upcoming.push(meeting);
      } else {
        result.past.push(meeting);
      }
    });

    return result;
  }, [filteredMeetings]);

  // ================= FORMAT DISPLAY =================
  const formatDateTime = (meeting) => {
    const dt = parseMeetingDateTime(meeting);
    if (!dt) return `${meeting.Date} — ${meeting.Time || ""}`;
    return dt.toLocaleString();
  };

  // ================= UI SECTION =================
  const renderSection = (title, list) => {
    if (!loading && list.length === 0) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>

        {list.map((meeting) => (
          <div
            key={meeting.Id}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-base text-primary">
                  {meeting.memberId
                    ? `Individual Meeting — ${meeting.memberName || meeting.memberId}`
                    : `Group Meeting — Group ${meeting.GroupId}`}
                </h3>
                <p className="text-sm font-medium mt-1">
                  {meeting.Title}
                </p>
                <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                  {meeting.Description || "No description provided."}
                </p>
              </div>

              <div className="text-right whitespace-nowrap ml-4">
                <p className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full inline-block">
                  {formatDateTime(meeting)}
                </p>
                <p
                  className={`text-xs font-semibold mt-2 uppercase tracking-wide ${
                    meeting.status === "Completed"
                      ? "text-emerald-600"
                      : "text-blue-600"
                  }`}
                >
                  {meeting.status || "Pending"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setLocation(
                    `/supervisor/meeting-details?meetingId=${meeting.Id}`
                  )
                }
              >
                View Details
              </Button>

              <Button
                variant="default"
                className="flex-1"
                onClick={() =>
                  setLocation(
                    `/supervisor/assign-task?groupId=${meeting.GroupId}&meetingId=${meeting.Id}`
                  )
                }
              >
                Assign Task
              </Button>

              <Button
                variant="secondary"
                className="flex-none px-6"
                onClick={() =>
                  setLocation(
                    `/supervisor/edit-meeting?meetingId=${meeting.Id}`
                  )
                }
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ================= UI =================
  return (
    <SupervisorLayout>
      <AppBar
        title="Supervisor Meetings"
        actions={
          <button
            className="text-primary text-sm font-medium hover:underline"
            onClick={() => setLocation("/supervisor/dashboard")}
          >
            Back to Dashboard
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">

        {/* TOP CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* FYP TOGGLE */}
          <div className="flex bg-muted rounded-lg p-1 w-full sm:w-64">
            <button
              onClick={() => setActiveFYP("FYP-1")}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${
                activeFYP === "FYP-1"
                  ? "bg-background shadow-sm text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FYP-1
            </button>
            <button
              onClick={() => setActiveFYP("FYP-2")}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${
                activeFYP === "FYP-2"
                  ? "bg-background shadow-sm text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FYP-2
            </button>
          </div>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search by Group or Member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Loading your {activeFYP} meetings...
          </div>
        )}

        {!loading && meetingsData.length === 0 && (
           <div className="py-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            <p>You have no {activeFYP} meetings scheduled right now.</p>
          </div>
        )}

        {/* SECTIONS */}
        {!loading && meetingsData.length > 0 && (
          <div className="space-y-8">
            {renderSection("📅 Today's Meetings", categorized.today)}
            {renderSection("⏳ Upcoming Meetings", categorized.upcoming)}
            {renderSection("📁 Past Meetings", categorized.past)}
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
}