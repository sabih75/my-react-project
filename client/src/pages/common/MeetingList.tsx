import { useEffect, useState } from "react";
import axios from "axios";
import { AppBar } from "@/components/AppBar";
import { MeetingCard } from "@/components/MeetingCard";
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import StudentLayout from "../student/StudentLayout";
import { setMeetingData } from "./meetingStore";

export default function MeetingList() {
  const { type, groupId } = useParams();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState<"Committee" | "Supervisor">("Committee");
  const [committeeData, setCommitteeData] = useState<{ upcoming: any[]; today: any[]; past: any[] }>({ upcoming: [], today: [], past: [] });
  const [supervisorData, setSupervisorData] = useState<{ upcoming: any[]; today: any[]; past: any[] }>({ upcoming: [], today: [], past: [] });

  const studentData = localStorage.getItem("user");
  const studentId = studentData ? JSON.parse(studentData).id : "";

  useEffect(() => {
    fetchCommitteeMeetings();
    fetchSupervisorMeetings();
  }, [type, groupId]);

  const fetchCommitteeMeetings = async () => {
    try {
      const [upcomingRes, todayRes, pastRes] = await Promise.all([
        axios.get(`http://localhost/ProgressMonitoringProject/api/committee-meetings/meetings?type=${type}&groupId=${groupId}&filter=upcoming&studentId=${studentId}`),
        axios.get(`http://localhost/ProgressMonitoringProject/api/committee-meetings/meetings?type=${type}&groupId=${groupId}&filter=today&studentId=${studentId}`),
        axios.get(`http://localhost/ProgressMonitoringProject/api/committee-meetings/meetings?type=${type}&groupId=${groupId}&filter=past&studentId=${studentId}`),
      ]);

      setCommitteeData({
        upcoming: upcomingRes.data || [],
        today: todayRes.data || [],
        past: pastRes.data || [],
      });
    } catch (err) {
      console.error("Failed to fetch committee meetings:", err);
    }
  };

  const fetchSupervisorMeetings = async () => {
    try {
      if (!groupId) return;
      const res = await axios.get(`http://localhost/ProgressMonitoringProject/api/supervisor/group-meetings/${groupId}`);
      const allMeetings = res.data || [];

      const now = new Date();
      // Reset hours to compare purely by date day
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const upcoming: any[] = [];
      const today: any[] = [];
      const past: any[] = [];

      allMeetings.forEach((m: any) => {
        const mDate = new Date(m.Date);
        const mDateOnly = new Date(mDate.getFullYear(), mDate.getMonth(), mDate.getDate());

        // Map it to match the MeetingCard expected props
        const mappedMeeting = {
          scheduleId: m.Id,
          title: m.Title || "Supervisor Meeting",
          date: m.Date,
          time: m.Time,
          location: m.Venue || "TBD",
          isSupervisor: true
        };

        if (mDateOnly.getTime() === todayDate.getTime()) {
          today.push(mappedMeeting);
        } else if (mDateOnly > todayDate) {
          upcoming.push(mappedMeeting);
        } else {
          past.push(mappedMeeting);
        }
      });

      setSupervisorData({ upcoming, today, past });
    } catch (err) {
      console.error("Failed to fetch supervisor meetings:", err);
    }
  };

  const currentData = activeTab === "Committee" ? committeeData : supervisorData;

  return (
    <StudentLayout>
      <AppBar
        title="Meetings"
        actions={
          <Button size="icon" variant="ghost">
            <Filter className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
        
        {/* Meeting Type Toggle */}
        <div className="flex bg-muted rounded-lg p-1 w-full sm:w-fit mx-auto mb-6">
          <button
            onClick={() => setActiveTab("Committee")}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm rounded-md transition-all ${
              activeTab === "Committee"
                ? "bg-background shadow-sm text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Committee
          </button>
          <button
            onClick={() => setActiveTab("Supervisor")}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm rounded-md transition-all ${
              activeTab === "Supervisor"
                ? "bg-background shadow-sm text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Supervisor
          </button>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Upcoming ({currentData.upcoming.length})
          </h2>

          {currentData.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg border text-center">
              No upcoming {activeTab.toLowerCase()} meetings
            </p>
          ) : (
            currentData.upcoming.map((m) => (
              <MeetingCard
                key={m.scheduleId}
                title={m.title}
                date={new Date(m.date).toDateString()}
                time={m.time}
                location={m.location}
                onClick={() => {
                  if (!m.isSupervisor) {
                    setLocation(`/meeting-detail/${m.scheduleId}/${type}/${groupId}`);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Today */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Today ({currentData.today.length})
          </h2>

          {currentData.today.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg border text-center">
              No {activeTab.toLowerCase()} meetings today
            </p>
          ) : (
            currentData.today.map((m) => (
              <MeetingCard
                key={m.scheduleId}
                title={m.title}
                date={new Date(m.date).toDateString()}
                time={m.time}
                location={m.location}
                onClick={() => {
                  if (!m.isSupervisor) {
                    setMeetingData(m);
                    setLocation(`/meeting-detail/${m.scheduleId}/${type}/${groupId}`);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Past */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Past ({currentData.past.length})
          </h2>

          {currentData.past.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg border text-center">
              No past {activeTab.toLowerCase()} meetings
            </p>
          ) : (
            currentData.past.map((m) => (
              <MeetingCard
                key={m.scheduleId}
                title={m.title}
                date={new Date(m.date).toDateString()}
                time={m.time}
                location={m.location}
              />
            ))
          )}
        </div>

      </div>

      {activeTab === "Committee" && (
        <div className="fixed bottom-5 right-5">
          <Button
            size="icon"
            className="rounded-full shadow-lg w-12 h-12"
            onClick={() => setLocation("/committee/schedule-meeting")}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}
    </StudentLayout>
  );
}