import { useEffect, useState } from "react";
import axios from "axios";
import StudentLayout from "../student/StudentLayout";
import { AppBar } from "@/components/AppBar";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { group } from "console";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

const calculateMinutesRemaining = (meetingTime: string, now: Date) => {
  if (!meetingTime) return null;
  try {
    const [hours, minutes] = meetingTime.split(":").map(Number);
    const meetingDate = new Date(now);
    meetingDate.setHours(hours, minutes, 0, 0);
    const diffMs = meetingDate.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
  } catch (e) {
    return null;
  }
};

/**
 * Generates the friendly time display for the Student Queue.
 * Logic:
 * 1. Completed -> "Done"
 * 2. In-Progress -> "Live Now"
 * 3. Waiting -> Combined Minutes + Clock Time (e.g., "In 15 min (13:45)")
 */
const getTimeDisplay = (group: any, now: Date) => {
  // Check if group is finished
  if (group.Status?.toLowerCase() === "completed") return "Done";
  
  // Check if group is currently in their meeting
  if (group.Status?.toLowerCase() === "in-progress") return "Live Now";
  
  // Calculate raw minute difference from now
  const mins = calculateMinutesRemaining(group.MeetingTime, now);
  
  // Safety check for empty time data
  const clockTime = group.MeetingTime?.substring(0, 5) || "N/A";
  if (mins === null) return clockTime;
  
  // If their turn has arrived but hasn't started yet
  if (mins <= 0 && mins > -15) return `Due now (${clockTime})`;
  
  // PRO VIEW: Show students exactly how many minutes are left + the scheduled clock time
  // This gives them maximum clarity on their wait time
  return `In ${mins} min (${clockTime})`;
};

export default function QueueAssignment() {
  const [, setLocation] = useLocation();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const {type, groupId} = useParams();

  useEffect(() => {
    fetchTodayMeetings(); // first load immediately

    const pollInterval = setInterval(() => {
      fetchTodayMeetings();
    }, 5000); // refresh every 5 seconds

    const timeInterval = setInterval(() => {
      setNow(new Date());
    }, 10000); // update local time every 10 seconds

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchTodayMeetings = async () => {
    try {
      // 1. Fetch all meetings for this Phase (e.g. FYP-1)
      const res = await axios.get(
        `${API_BASE}/committee-meetings/today-meetings/${type}`
      );
      const allMeetings = res.data;

      // 2. ISOLATION LOGIC: Find which specific 'Meeting Room' this student belongs to
      // We look for the entry where GroupIDs matches our current groupId
      const myGroupEntry = allMeetings.find((m: any) => m.GroupIDs === parseInt(groupId || "0"));
      
      if (myGroupEntry) {
        // Only show groups that are in the SAME meeting room (comiteeMeetingID)
        // This prevents 'mixing' with other panels happening on the same day
        const isolatedQueue = allMeetings.filter((m: any) => m.id === myGroupEntry.id);
        setMeetings(isolatedQueue);
      } else {
        // Fallback: Show all if group not found in today's active schedule
        setMeetings(allMeetings);
      }
    } catch (err) {
      console.error("Failed to fetch queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const inProgress = meetings.filter(
    (m) => m.Status?.toLowerCase() === "in-progress"
  );

  const waiting = meetings.filter(
    (m) => m.Status?.toLowerCase() === "waiting" || m.Status?.toLowerCase() === "scheduled"
  );

  const renderCard = (group: any, badgeColor: string) => {
    const isMyGroup = Number(group.GroupIDs) === Number(groupId);

    return (
      <div
        key={group.scheduleId}
        className={`
          border rounded-xl p-4 shadow-sm transition-all
          ${
            isMyGroup
              ? "bg-blue-100 border-blue-500 ring-2 ring-blue-400"
              : "bg-card border-card-border"
          }
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              Group {group.GroupIDs}
            </h3>

            {isMyGroup && (
              <Badge className="bg-blue-600 text-white">
                Your Group
              </Badge>
            )}
          </div>

          <Badge className={badgeColor}>
            {group.Status}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-1">
          {group.MeetingTitle}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-blue-600">
            {getTimeDisplay(group, now)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <AppBar title="Meeting Queue" showBack />

      <div className="p-4 space-y-6">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading queue...</p>
        )}

        {!loading && (
          <>
            {/* Ongoing */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Ongoing Meeting</h2>
              {inProgress.length > 0 ? (
                inProgress.map((g) =>
                  renderCard(g, "bg-green-100 text-green-700")
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ongoing meetings.
                </p>
              )}
            </div>

            {/* Waiting */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Waiting Groups</h2>
              {waiting.length > 0 ? (
                <div className="space-y-3">
                  {waiting.map((g) =>
                    renderCard(g, "bg-yellow-100 text-yellow-700")
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No groups waiting.
                </p>
              )}
            </div>
          </>
        )}

        <Button
          onClick={() => setLocation("/")}
          className="w-full mt-4"
        >
          Back to Home
        </Button>
      </div>
    </StudentLayout>
  );
}