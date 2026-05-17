"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import CommitteeLayout from "./CommitteeLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function CommitteeMeetingSchedule() {
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const [availableCriteria, setAvailableCriteria] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [type, setType] = useState("FYP-1");

  const [meeting, setMeeting] = useState({
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
  });

  // 🔥 NEW: preview state
  const [preview, setPreview] = useState({
    totalGroups: 0,
    totalDays: 0,
    groupsPerDay: 0
  });

  /* =========================
     SESSION
  ========================= */
  useEffect(() => {
    axios
      .get(`${API_BASE}/users/CurrentSession`)
      .then((res) => setSession(res.data.id));
  }, []);

  /* =========================
     API BASE
  ========================= */
  const getScoreApi = () => {
    return type === "FYP-2" ? "fyp2-scores" : "fyp1-scores";
  };

  /* =========================
     LOAD CRITERIA
  ========================= */
  const loadCriteria = async () => {
    if (!session) return;

    try {
      alert(session);
      const res = await axios.get(
        `${API_BASE}/${getScoreApi()}/available-criteria/${session}`
      );
      setAvailableCriteria(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (meeting.isGraded) loadCriteria();
  }, [type, session]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (field, value) => {
    setMeeting({ ...meeting, [field]: value });
  };

  const toggleCriteria = (id) => {
    setSelectedCriteria((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleDay = (day) => {
    setMeeting((prev) => {
      const updatedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];

      return { ...prev, selectedDays: updatedDays };
    });
  };

  /* =========================
     🔥 DYNAMIC DAYS CALCULATION
  ========================= */
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

  const occurringDays = getOccurringDaysOfWeek(meeting.startDate, meeting.endDate);

  // Auto-clean selectedDays when date range changes
  useEffect(() => {
    setMeeting((prev) => {
      const cleanedDays = prev.selectedDays.filter((day) => occurringDays.includes(day));
      if (JSON.stringify(cleanedDays) !== JSON.stringify(prev.selectedDays)) {
        return { ...prev, selectedDays: cleanedDays };
      }
      return prev;
    });
  }, [meeting.startDate, meeting.endDate]);

  /* =========================
     🔥 PREVIEW CALCULATION
  ========================= */
  useEffect(() => {
    const loadPreview = async () => {
      if (
        !meeting.startDate ||
        !meeting.endDate ||
        meeting.selectedDays.length === 0 ||
        !session
      ) {
        setPreview({ totalGroups: 0, totalDays: 0, groupsPerDay: 0 });
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/committee-meetings/meeting-distribution-preview`,
          {
            params: {
              type,
              sessionId: session,
              startDate: meeting.startDate,
              endDate: meeting.endDate,
              selectedDays: meeting.selectedDays
            }
          }
        );

        setPreview(res.data);

      } catch (err) {
        console.error("Preview fetch error:", err);
        setPreview({ totalGroups: 0, totalDays: 0, groupsPerDay: 0 });
      }
    };

    loadPreview();
  }, [meeting.startDate, meeting.endDate, meeting.selectedDays, type, session]);
  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    if (!meeting.title) return alert("Title required");

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/committee-meetings/schedule-meeting?type=${type}&userId=${userId}`,
        {
          title: meeting.title,
          meetingDescription: meeting.description,
          venue: meeting.venue,
          startDate: meeting.startDate,
          endDate: meeting.endDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          selectedDays: meeting.selectedDays,
          sessionID: session,
          isGraded: meeting.isGraded,
          isFileRequired: meeting.pptRequired,
        }
      );

      const meetingId = res.data.meetingId;

      // Assign criteria
      if (meeting.isGraded && selectedCriteria.length > 0) {
        await axios.post(
          `${API_BASE}/${getScoreApi()}/assign-parameters-to-meeting`,
          {
            MeetingId: meetingId,
            ParameterIds: selectedCriteria,
          }
        );
      }

      alert(`
✅ Meeting Scheduled

Groups: ${res.data.totalGroups}
Days: ${res.data.totalDays}
Per Day: ${res.data.groupsPerDay}
      `);

      setLocation("/committee/dashboard");

    } catch (err) {
      console.log(err);
      alert("Failed to schedule meeting ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <CommitteeLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-5">

        <h2 className="text-xl font-bold">Schedule Meeting</h2>

        {/* TYPE */}
        <select
          className="border p-2 w-full"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setSelectedCriteria([]);
          }}
        >
          <option value="FYP-1">FYP-1</option>
          <option value="FYP-2">FYP-2</option>
        </select>

        {/* TITLE */}
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={meeting.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={meeting.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* VENUE */}
        <input
          className="border p-2 w-full"
          placeholder="Venue"
          value={meeting.venue}
          onChange={(e) => handleChange("venue", e.target.value)}
        />

        {/* DATES */}
        <div className="grid grid-cols-2 gap-3">
          <input type="date" className="border p-2"
            onChange={(e) => handleChange("startDate", e.target.value)} />
          <input type="date" className="border p-2"
            onChange={(e) => handleChange("endDate", e.target.value)} />
        </div>

        {/* TIMES */}
        <div className="grid grid-cols-2 gap-3">
          <input type="time" className="border p-2"
            onChange={(e) => handleChange("startTime", e.target.value)} />
          <input type="time" className="border p-2"
            onChange={(e) => handleChange("endTime", e.target.value)} />
        </div>

        {/* DAYS */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Days occurring in range</label>
          <div className="flex gap-2 flex-wrap">
            {occurringDays.length > 0 ? (
              occurringDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 border rounded transition-colors ${
                    meeting.selectedDays.includes(day)
                      ? "bg-blue-500 text-white border-blue-600 font-semibold"
                      : "hover:bg-gray-100 bg-white"
                  }`}
                >
                  {day}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Select start & end dates first to choose meeting days.</p>
            )}
          </div>
        </div>

        {/* 🔥 PREVIEW BOX */}
        {preview && (
          <div className="border p-3 bg-gray-50 rounded">
            <p><strong>📊 Distribution Preview</strong></p>
            <p>Total Groups: {preview.totalGroups}</p>
            <p>Total Days: {preview.totalDays}</p>
            <p>Groups / Day: {preview.groupsPerDay}</p>
          </div>
        )}

        {/* GRADING */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={meeting.isGraded}
            onChange={(e) => {
              handleChange("isGraded", e.target.checked);
              if (e.target.checked) loadCriteria();
              else setSelectedCriteria([]);
            }}
          />
          Is Graded
        </label>

        {/* PPT */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={meeting.pptRequired}
            onChange={(e) =>
              handleChange("pptRequired", e.target.checked)
            }
          />
          PPT Required
        </label>

        {/* CRITERIA */}
        {meeting.isGraded && (
          <div className="border p-3">
            <h3 className="font-semibold mb-2">Select Criteria</h3>

            {availableCriteria.map((c) => (
              <div key={c.id} className="border p-2 mb-2">
                <label className="flex gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedCriteria.includes(c.id)}
                    onChange={() => toggleCriteria(c.id)}
                  />
                  {c.name} ({c.percentage}%)
                </label>

                <div className="ml-6 text-sm text-gray-600">
                  {c.subParameters?.map((s) => (
                    <div key={s.id}>• {s.name}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SAVE */}
        <button
          onClick={handleSave}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          {loading ? "Saving..." : "Schedule Meeting"}
        </button>
      </div>
    </CommitteeLayout>
  );
}