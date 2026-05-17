import React, { createContext, useContext, useMemo, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Clock, ArrowLeft, ListChecks, CheckSquare, Timer, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";

/* -----------------------------
   In-memory shared store via Context
   ----------------------------- */
const MeetingsContext = createContext(null);

function MeetingsProvider({ children }) {
  // committee members (evaluators)
  const [committeeMembers] = useState([
    { id: "c1", name: "Dr. A", email: "a@uni.edu" },
    { id: "c2", name: "Dr. B", email: "b@uni.edu" },
    { id: "c3", name: "Dr. C", email: "c@uni.edu" },
  ]);

  // meetings: each meeting has groupMembers (students), criteria (possible params), allowed map per criterion,
  // and scores: { studentId: { criterion: scoreNumber } }
  const [meetingsByFYP, setMeetingsByFYP] = useState({
    "FYP-1": [
      {
        id: 1,
        title: "Proposal Defense",
        date: "25 Nov 2025",
        time: "10:00 AM",
        status: "InProgress", // only InProgress & Past shown in member queue
        type: "Graded",
        groupName: "FYP-1 Group 12",
        criteria: ["API", "ERD", "DATABASE", "PITCHING"],
        // allowedEvaluators: { criterion: [committeeMemberIds...] }
        allowedEvaluators: { API: ["c1", "c2"], ERD: ["c2"], DATABASE: [], PITCHING: [] },
        groupMembers: [
          { id: "s1", name: "Ali Hassan" },
          { id: "s2", name: "Sara Ahmad" },
        ],
        scores: {}, // will hold { s1: { API: 8, ERD: 9 }, s2: { API: 7 } }
      },
      {
        id: 2,
        title: "Consultation",
        date: "25 Nov 2025",
        time: "10:00 AM",
        status: "InProgress",
        type: "Ungraded",
        groupName: "FYP-1 Group 02",
        criteria: [],
        allowedEvaluators: {},
        groupMembers: [{ id: "s3", name: "Hassan R." }],
        scores: {},
      },
      {
        id: 3,
        title: "Presentation",
        date: "18 Oct 2025",
        time: "1:00 PM",
        status: "Past",
        type: "Graded",
        groupName: "FYP-1 Group 04",
        criteria: ["API", "PITCHING", "DATABASE"],
        allowedEvaluators: { API: ["c1"], PITCHING: ["c1", "c3"], DATABASE: ["c2"] },
        groupMembers: [{ id: "s4", name: "Amina Khan" }],
        scores: { s4: { API: 9, PITCHING: 8, DATABASE: 7 } },
      },
    ],
    "FYP-2": [
      {
        id: 4,
        title: "Final Evaluation",
        date: "25 Nov 2025",
        time: "10:00 AM",
        status: "InProgress",
        type: "Graded",
        groupName: "FYP-2 Group 09",
        criteria: ["ERD", "DATABASE"],
        allowedEvaluators: { ERD: ["c2"], DATABASE: ["c1", "c3"] },
        groupMembers: [
          { id: "s5", name: "Zain Ali" },
          { id: "s6", name: "Maya Ali" },
        ],
        scores: {},
      },
      {
        id: 5,
        title: "Mid Review",
        date: "01 Nov 2025",
        time: "3:00 PM",
        status: "Past",
        type: "Ungraded",
        groupName: "FYP-2 Group 14",
        criteria: [],
        allowedEvaluators: {},
        groupMembers: [{ id: "s7", name: "Omar" }],
        scores: {},
      },
    ],
  });

  const updateMeeting = (fyp, meetingId, patch) => {
    setMeetingsByFYP((prev) => {
      const copy = { ...prev };
      copy[fyp] = copy[fyp].map((m) => (m.id === meetingId ? { ...m, ...patch } : m));
      return copy;
    });
  };

  const updateAllowedEvaluators = (fyp, meetingId, criterion, evaluatorIds) => {
    setMeetingsByFYP((prev) => {
      const copy = { ...prev };
      copy[fyp] = copy[fyp].map((m) => {
        if (m.id !== meetingId) return m;
        const allowedEvaluators = { ...(m.allowedEvaluators || {}) };
        allowedEvaluators[criterion] = evaluatorIds;
        return { ...m, allowedEvaluators };
      });
      return copy;
    });
  };

  const submitScores = (fyp, meetingId, studentId, scoresForStudent) => {
    setMeetingsByFYP((prev) => {
      const copy = { ...prev };
      copy[fyp] = copy[fyp].map((m) => {
        if (m.id !== meetingId) return m;
        const scores = { ...(m.scores || {}) };
        scores[studentId] = { ...(scores[studentId] || {}), ...scoresForStudent };
        return { ...m, scores };
      });
      return copy;
    });
  };

  return (
    <MeetingsContext.Provider
      value={{
        meetingsByFYP,
        updateMeeting,
        updateAllowedEvaluators,
        submitScores,
        committeeMembers,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
}

function useMeetings() {
  const ctx = useContext(MeetingsContext);
  if (!ctx) throw new Error("useMeetings must be used inside MeetingsProvider");
  return ctx;
}

/* -----------------------------
   Committee Member Meeting Queue (screen A)
   - shows InProgress & Past only (Upcoming removed)
   - for graded in-progress meetings: shows per-student scoring input
     BUT only for criteria where the current committee member is allowed
----------------------------- */

function CommitteeMemberQueue({ currentCommitteeMemberId, onBack = null }) {
  const { meetingsByFYP, submitScores, committeeMembers } = useMeetings();
  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [activeTab, setActiveTab] = useState("InProgress"); // InProgress | Past
  const [localScoreDrafts, setLocalScoreDrafts] = useState({}); // { meetingId: { studentId: { criterion: value } } }

  const meetings = meetingsByFYP[activeFYP] || [];

  const parseDate = (dateStr, timeStr) => {
    const [day, month, year] = dateStr.split(" ");
    return new Date(`${month} ${day}, ${year} ${timeStr}`);
  };

  const filterAndSort = (status) =>
    meetings
      .filter((m) => m.status === status)
      .sort((a, b) => {
        const A = parseDate(a.date, a.time);
        const B = parseDate(b.date, b.time);
        return status === "Past" ? B - A : A - B;
      });

  const displayed = filterAndSort(activeTab);

  // helper: checks whether current committee member can evaluate given criterion for meeting
  const canCurrentEvaluateCriterion = (meeting, criterion) => {
    const allowed = meeting.allowedEvaluators?.[criterion] || [];
    return allowed.includes(currentCommitteeMemberId);
  };

  const setDraft = (meetingId, studentId, criterion, value) => {
    setLocalScoreDrafts((prev) => {
      const copy = { ...(prev || {}) };
      copy[meetingId] = copy[meetingId] || {};
      copy[meetingId][studentId] = copy[meetingId][studentId] || {};
      copy[meetingId][studentId][criterion] = value;
      return copy;
    });
  };

  const handleSubmitScores = (meetingId, studentId) => {
    const meetingDraft = (localScoreDrafts[meetingId] || {})[studentId] || {};
    // Filter out NaN and empty values, parse numbers
    const parsed = {};
    Object.entries(meetingDraft).forEach(([crit, val]) => {
      const n = Number(val);
      if (!Number.isNaN(n)) parsed[crit] = n;
    });
    if (Object.keys(parsed).length === 0) {
      alert("No valid scores to submit.");
      return;
    }
    submitScores(activeFYP, meetingId, studentId, parsed);
    // clear local draft for that student
    setLocalScoreDrafts((prev) => {
      const copy = { ...(prev || {}) };
      if (copy[meetingId]) {
        copy[meetingId] = { ...(copy[meetingId] || {}) };
        delete copy[meetingId][studentId];
      }
      return copy;
    });
    alert("Scores submitted.");
  };

  return (
    <MobileLayout>
      <AppBar
        title="Meeting Queue"
        actions={
          <div className="flex gap-2">
            {onBack && (
              <button onClick={onBack} className="text-primary text-sm">
                Back
              </button>
            )}
          </div>
        }
      />

      <div className="p-4 space-y-6">
        {/* FYP tabs */}
        <div className="flex justify-center gap-3">
          {["FYP-1", "FYP-2"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFYP(f)}
              className={`px-4 py-2 rounded-lg ${activeFYP === f ? "bg-primary text-white" : "bg-muted"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tab: InProgress / Past (NO Upcoming) */}
        <div className="flex justify-center gap-3">
          {["InProgress", "Past"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg ${activeTab === t ? "bg-primary text-white" : "bg-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {activeFYP} — {activeTab}
          </h2>

          {displayed.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-6 border border-dashed rounded-lg">No meetings.</div>
          ) : (
            displayed.map((meeting) => (
              <div key={meeting.id} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.groupName}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {meeting.date} • {meeting.time} • {meeting.type}
                    </div>
                  </div>
                </div>

                {/* If graded and InProgress show scoring UI */}
                {meeting.type === "Graded" && activeTab === "InProgress" ? (
                  <div className="space-y-3 pt-2">
                    <div className="text-sm font-medium">Scoring Criteria (you may only score criteria you are allowed)</div>

                    {meeting.groupMembers.map((student) => (
                      <div key={student.id} className="border border-border p-3 rounded-md space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">Student ID: {student.id}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {meeting.criteria.map((crit) => {
                            const allowed = canCurrentEvaluateCriterion(meeting, crit);
                            return (
                              <div key={crit} className="flex items-center gap-2">
                                <label className="w-20 text-sm">{crit}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  placeholder={allowed ? "score 0-10" : "not allowed"}
                                  disabled={!allowed}
                                  value={
                                    (localScoreDrafts[meeting.id] &&
                                      localScoreDrafts[meeting.id][student.id] &&
                                      localScoreDrafts[meeting.id][student.id][crit]) ||
                                    ""
                                  }
                                  onChange={(e) => setDraft(meeting.id, student.id, crit, e.target.value)}
                                  className={`border rounded px-2 py-1 text-sm ${allowed ? "" : "bg-muted text-muted-foreground"}`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleSubmitScores(meeting.id, student.id)}>
                            Submit Scores
                          </Button>
                        </div>

                        {/* Show existing scores */}
                        {meeting.scores && meeting.scores[student.id] && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>Submitted Scores:</div>
                            <div className="flex gap-3 mt-1">
                              {Object.entries(meeting.scores[student.id]).map(([k, v]) => (
                                <div key={k} className="px-2 py-1 bg-muted rounded text-xs">{k}: {v}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Non-graded or Past just show basic details and View button
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground">This meeting is not graded or scoring is closed.</div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => alert("View record / details")}>View</Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
