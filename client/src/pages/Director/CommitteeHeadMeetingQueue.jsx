    import { MobileLayout } from "@/components/MobileLayout";
    import { AppBar } from "@/components/AppBar";
    import { Copy, FileText, X } from "lucide-react";

    import {
      Clock,
      CalendarX,
      ArrowLeft,
      ListChecks,
      Timer,
      Search,
    } from "lucide-react";
    import { useLocation } from "wouter";
    import { useState } from "react";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import axios from "axios";

const calculateMinutesRemaining = (meetingTime, now) => {
  if (!meetingTime) return null;
  try {
    const [hours, minutes] = meetingTime.split(":").map(Number);
    const meetingDate = new Date(now);
    meetingDate.setHours(hours, minutes, 0, 0);
    const diffMs = meetingDate - now;
    return Math.floor(diffMs / (1000 * 60));
  } catch (e) {
    return null;
  }
};

const getTimeDisplay = (meeting, now) => {
  if (meeting.status === "Past" || meeting.status === "Complete") return "Done";
  if (meeting.status === "InProgress") return "Live Now";
  
  const mins = calculateMinutesRemaining(meeting.time, now);
  if (mins === null) return meeting.time?.substring(0, 5) || "N/A";
  
  if (mins <= 0 && mins > -15) return "Due now";
  if (mins > 0 && mins <= 60) return `In ${mins} min`;
  
  return meeting.time?.substring(0, 5) || "N/A";
};

    /* ====================================================== */
    /*                  UPDATED MEETING DATA                  */
    /* ====================================================== */
    const meetingData = {
      "FYP-1": [
        {
          id: 1,
          title: "API'S Meeting",
          date: "20 Oct 2025",
          time: "10:00 AM",
          status: "InProgress",
          type: "Graded",
          groupName: "FYP-1 Group 12",
          allowedCriteria: ["API", "ERD"],
          members: ["Ali", "Usman", "Sana"],
          remarks: {},
        },
        {
          id: 2,
          title: "Objective",
          date: "10 Oct 2025",
          time: "1:00 PM",
          status: "Past",
          type: "Ungraded",
          groupName: "FYP-1 Group 12",
        },
      ],

      "FYP-2": [
        {
          id: 3,
          title: "Final Task Evaluation",
          date: "25 Nov 2025",
          time: "10:00 AM",
          status: "InProgress",
          type: "Graded",
          groupName: "FYP-2 Group 05",
          allowedCriteria: ["DATABASE"],
          members: ["Haris", "Ayesha"],
          committeeRemarks: {
            Haris: "Complete Frontend Screens. By Dr. Hassan",
            Ayesha: "Half Complete Database",
          },
          grades: {},
          taskStatus: {},
        },

        {
          id: 5,
          title: "Final Task Evaluation",
          date: "26 Nov 2025",
          time: "11:00 AM",
          status: "InProgress",
          type: "Graded",
          groupName: "FYP-2 Group 09",
          allowedCriteria: ["Backend"],
          members: ["Saad", "Hamza", "Maha"],
          committeeRemarks: {
            Saad: "Backend Complete  By Dr. Hassan",
            Hamza: "API Errors By Sir Zahid",
            Maha: "Testing Pending",
          },
          grades: {},
          taskStatus: {},
        },

        {
          id: 4,
          title: "Presentation",
          date: "03 Nov 2025",
          time: "12:00 PM",
          status: "Past",
          type: "Ungraded",
          groupName: "FYP-2 Group 11",
        },
      ],
    };

    /* Grade Options */
    const grades = ["A+", "A", "B+", "B", "C+", "C", "D"];

    export default function CommitteeHeadMeetingQueue() {
      const [, setLocation] = useLocation();
    const [copied, setCopied] = useState(null);
    const [recordMeeting, setRecordMeeting] = useState(null);

      const [activeFYP, setActiveFYP] = useState("FYP-1");

      // 🔥 Only TWO tabs now
      const [activeTab, setActiveTab] = useState("InProgress");

      const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchMeetings();
    const pollInterval = setInterval(fetchMeetings, 10000);
    const timeInterval = setInterval(() => setNow(new Date()), 60000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, []);
const [data, setData] = useState({
  "FYP-1": [],
  "FYP-2": [],
});
      const currentMeetings = data[activeFYP];
const fetchMeetings = async () => {
  try {
    const res = await axios.get(
      "http://localhost/ProgressMonitoringProject/api/committee-meetings/HeadMeetings"
    );

    const meetings = res.data;

    const grouped = {
      "FYP-1": [],
      "FYP-2": [],
    };

    meetings.forEach((m) => {
      grouped[m.phase].push({
        ...m,
        taskStatus: {},
      });
    });

    setData(grouped);
  } catch (error) {
    console.error("Failed to load meetings", error);
  }
};
      /* Filters + Search */
      const displayedMeetings = currentMeetings
        .filter((m) => {
          if (activeTab === "InProgress") return m.status === "InProgress";

          // 🔥 Past tab shows both Past + Complete
          if (activeTab === "Past") return m.status === "Past" || m.status === "Complete";
        })
        .filter((m) =>
          m.groupName.toLowerCase().includes(search.toLowerCase().trim())
        );

      const typeColor = (type) =>
        type === "Graded"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700";

      const statusIcon = {
        Past: CalendarX,
        InProgress: Timer,
        Complete: Timer,
      };

      /* ====================================================== */
      /*                 UPDATE TASK COMPLETION                */
      /* ====================================================== */
      function toggleMemberTask(meetingId, member) {
        setData((prev) => {
          const updated = { ...prev };
          const list = updated[activeFYP];

          const meeting = list.find((x) => x.id === meetingId);

          if (!meeting.taskStatus) meeting.taskStatus = {};

          meeting.taskStatus[member] = !meeting.taskStatus[member];

          const allCompleted = meeting.members.every(
            (m) => meeting.taskStatus[m] === true
          );

          if (allCompleted) meeting.status = "Complete";

          return updated;
        });
      }
      function copyText(text, key) {
      navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    }


      /* ====================================================== */
      /*                   SAVE MEMBER GRADE                   */
      /* ====================================================== */
      function updateGrade(meetingId, member, grade) {
        setData((prev) => {
          const updated = { ...prev };
          const list = updated[activeFYP];
          const meeting = list.find((x) => x.id === meetingId);

          if (!meeting.grades) meeting.grades = {};

          meeting.grades[member] = grade;

          return updated;
        });
      }

      /* ====================================================== */
      /*                MEETING CARD RENDERING                 */
      /* ====================================================== */
      const MeetingCard = ({ meeting }) => {
        const StatusIcon = statusIcon[meeting.status];
        const isFYP1 = activeFYP === "FYP-1";
        const isFYP2 = activeFYP === "FYP-2";

        return (
          <div className="bg-card border border-card-border rounded-xl p-4 space-y-3 shadow-sm">

            {/* Header */}
            <div className="flex justify-between">
              <h3 className="font-semibold">{meeting.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${typeColor(meeting.type)}`}>
                {meeting.type}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{meeting.groupName}</p>
{meeting.status === "InProgress" && (
  <button
    onClick={() =>
      setLocation(
        `/committee/group-details?group=${encodeURIComponent(
          meeting.groupName
        )}&phase=${activeFYP}`
      )
    }
    className="w-full mt-2 py-2 bg-muted border rounded-lg text-sm font-medium hover:bg-muted/70"
  >
    View Group Details
  </button>
)}
            {/* Date & Time */}
            <div className="flex items-center gap-5 text-sm pt-2 border-t border-border mt-3">
              <div className="flex items-center gap-1">
                <StatusIcon className="w-4 h-4 text-primary" />
                <span>{meeting.date}</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground font-bold" style={{ color: "#2563eb" }}>
                <Clock className="w-4 h-4" />
                <span>{getTimeDisplay(meeting, now)}</span>
              </div>
            </div>

            {/* FYP-1 Remarks */}
  {isFYP1 &&
    meeting.status === "InProgress" &&
    meeting.type === "Graded" && (
      <div className="mt-4 p-3 border rounded-lg bg-muted/40 space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          Add Remarks for Members
        </h4>

        {meeting.members.map((member) => (
          <div
            key={member}
            className="border rounded-lg p-3 bg-background space-y-2"
          >
            <h5 className="font-medium">{member}</h5>

            <textarea
              placeholder="Enter remarks"
              value={meeting.remarks?.[member] || ""}
              onChange={(e) => {
                setData((prev) => {
                  const updated = { ...prev };
                  const list = updated[activeFYP];
                  const m = list.find((x) => x.id === meeting.id);

                  if (!m.remarks) m.remarks = {};
                  m.remarks[member] = e.target.value;

                  return updated;
                });
              }}
              className="w-full p-2 border rounded h-20 text-sm"
            />
 <button
                      onClick={() =>
                      setLocation(
                      `/committee/student-progress?name=${encodeURIComponent(
                      member
                      )}&group=${encodeURIComponent(meeting.groupName)}`
                      )
                      }
                      className="w-full mt-2 py-2 border border-primary text-primary rounded-lg text-sm"
                      >
                      View Progress
                      </button>
            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                Save Remarks
              </button>

              {/* 🔥 COPY TO ALL BUTTON */}
              {meeting.remarks?.[member] && (
                <button
                  onClick={() => {
                    setData((prev) => {
                      const updated = { ...prev };
                      const list = updated[activeFYP];
                      const m = list.find((x) => x.id === meeting.id);

                      if (!m.remarks) m.remarks = {};

                      meeting.members.forEach((mem) => {
                        m.remarks[mem] = m.remarks[member];
                      });

                      return updated;
                    });
                  }}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1"
                >
                  Copy to All
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
            {/* FYP-2 Evaluation */}
            {isFYP2 && meeting.status !== "Past" && (
              <div className="mt-4 p-3 border rounded-lg bg-muted/40 space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" /> Committee Evaluation
                </h4>

                {meeting.members.map((member) => (
                  <div
                    key={member}
                    className="p-3 border rounded-lg bg-background space-y-3"
                  >
                    <h5 className="font-medium">{member}</h5>

              <div className="flex justify-between items-start gap-2">
      <p className="text-sm text-muted-foreground flex-1">
        {meeting.committeeRemarks?.[member] || "No remarks added"}
      </p>

      {meeting.committeeRemarks?.[member] && (
        <button
          onClick={() =>
            copyText(
              meeting.committeeRemarks[member],
              `${meeting.id}-${member}`
            )
          }
          className="text-primary text-xs flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          {copied === `${meeting.id}-${member}` ? "Copied" : "Copy"}
        </button>
      )}
    </div>

                    <select
                      className="w-full p-2 border rounded bg-background text-sm"
                      value={meeting.grades?.[member] || ""}
                      onChange={(e) =>
                        updateGrade(meeting.id, member, e.target.value)
                      }
                    >
                      <option value="">Select Grade</option>
                      {grades.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={meeting.taskStatus?.[member] || false}
                        onChange={() => toggleMemberTask(meeting.id, member)}
                      />
                      <span className="text-sm">Task Completed</span>
                    </div>
                    <button
                      onClick={() =>
                      setLocation(
                      `/committee/student-progress?name=${encodeURIComponent(
                      member
                      )}&group=${encodeURIComponent(meeting.groupName)}`
                      )
                      }
                      className="w-full mt-2 py-2 border border-primary text-primary rounded-lg text-sm"
                      >
                      View Progress
                      </button>
                  </div>
                ))}
              </div>
            )}

            {/* View Record Button */}
            {meeting.status === "Past" || meeting.status === "Complete" ? (
            <button
      onClick={() => setRecordMeeting(meeting)}
      className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 flex items-center justify-center gap-2"
    >
      <FileText className="w-4 h-4" /> View Record
    </button>

            ) : null}
          </div>
        );
      };

      /* ====================================================== */
      /*                       MAIN RETURN                      */
      /* ====================================================== */

      return (
        <CommitteeHeadLayout>
          <AppBar title="Committee Head – Meeting Queue">
            <button
              onClick={() => setLocation("/committee/dashboard")}
              className="p-2 rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </AppBar>

          <div className="p-4 space-y-6">

            {/* FYP TABS */}
            <div className="flex justify-center gap-4">
              {["FYP-1", "FYP-2"].map((phase) => (
                <button
                  key={phase}
                  onClick={() => setActiveFYP(phase)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeFYP === phase ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>

            {/* ▶ ONLY TWO TABS NOW */}
            <div className="flex justify-center gap-4">
              {["InProgress", "Past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 p-2 border rounded-lg"
              />
            </div>

            {/* MEETING LIST */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> {activeFYP} – {activeTab} Meetings
              </h2>

              {displayedMeetings.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg">
                  No meetings found.
                </p>
              ) : (
                displayedMeetings.map((m) => <MeetingCard key={m.id} meeting={m} />)
              )}
            </div>
          </div>

          {recordMeeting && (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="bg-background w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              Meeting Record – {recordMeeting.groupName}
            </h3>
            <button onClick={() => setRecordMeeting(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <p><strong>Title:</strong> {recordMeeting.title}</p>
            <p><strong>Date:</strong> {recordMeeting.date}</p>
            <p><strong>Time:</strong> {recordMeeting.time}</p>
            <p><strong>Type:</strong> {recordMeeting.type}</p>

            <div className="border-t pt-3 space-y-3">
              <h4 className="font-semibold">Members Evaluation</h4>

              {recordMeeting.members?.map((m) => (
                <div key={m} className="border rounded-lg p-3 space-y-1">
                  <p className="font-medium">{m}</p>
                  <p className="text-muted-foreground">
                    <strong>Remarks:</strong>{" "}
                    {recordMeeting.committeeRemarks?.[m] || "—"}
                  </p>
                  <p>
                    <strong>Grade:</strong>{" "}
                    {recordMeeting.grades?.[m] || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

        </CommitteeHeadLayout>
      );
    }
