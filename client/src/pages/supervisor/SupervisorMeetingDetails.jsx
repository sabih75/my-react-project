import { useEffect, useState } from "react";
import axios from "axios";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import SupervisorLayout from "./SupervisorLayout";
import { useLocation } from "wouter";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorMeetingDetails() {
  const [meeting, setMeeting] = useState(null);
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState({});

  // ✅ NEW STATES
  const [groupRemark, setGroupRemark] = useState("");
  const [studentRemarks, setStudentRemarks] = useState({});

  const [location] = useLocation();

  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const [enrollmentId, setEnrollmentId] = useState("");
  const meetingId = searchParams.get("meetingId");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (meetingId) loadMeeting();
  }, [meetingId]);

  // ================= LOAD MEETING =================
  const loadMeeting = async () => {
    const meetingRes = await axios.get(
      `${API_BASE}/supervisor/meetings/${meetingId}`
    );

    setMeeting(meetingRes.data);

    const groupId = meetingRes.data.groupID;

    loadGroup(groupId);
    loadTasks(groupId);
    loadGroupRemark(groupId);
  };

  // ================= LOAD GROUP =================
  const loadGroup = async (groupId) => {
    const res = await axios.get(
      `${API_BASE}/supervisor/groups/${groupId}`
    );

    setGroup(res.data);

    const initialAttendance = {};
    const remarksObj = {};

    res.data.Members.forEach((m) => {
      initialAttendance[m.id] = false;
      remarksObj[m.id] = "";
      loadStudentRemark(m.EnrollmentID, m.id); // 🔥 load each student remark
      alert(m.EnrollmentID);
      setEnrollmentId(m.EnrollmentID);  
    });

    setAttendance(initialAttendance);
    setStudentRemarks(remarksObj);
  };

  // ================= LOAD TASKS =================
  const loadTasks = async (groupId) => {
    const res = await axios.get(
      `${API_BASE}/supervisor/GroupTasks/${groupId}`
    );
    setTasks(res.data);
  };

  // ================= LOAD GROUP REMARK =================
  const loadGroupRemark = async (groupId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/get-group-remarks/${groupId}/${user.id}/${meetingId}`
      );

      setGroupRemark(res.data?.Remarks || "");
    } catch {
      setGroupRemark("");
    }
  };

  // ================= LOAD STUDENT REMARK =================
  const loadStudentRemark = async (enrollId, memberId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/get-supervisor-remarks/${enrollId}/${user.id}/${meetingId}`
      );

      if (res.data) {
        setStudentRemarks((prev) => ({
          ...prev,
          [memberId]: res.data.Remarks,
        }));
      }
    } catch {
      // ignore
    }
  };

  // ================= TOGGLE ATTENDANCE =================
  const toggleAttendance = (memberId) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // ================= SAVE ATTENDANCE =================
  const saveAttendance = async () => {
    const payload = {
      meetingId,
      attendance: Object.entries(attendance).map(
        ([memberId, isPresent]) => ({
          memberId: parseInt(memberId),
          isPresent,
        })
      ),
    };

    await axios.post(
      `${API_BASE}/supervisor/studentAttendance`,
      payload
    );

    alert("Attendance saved successfully");
  };

  // ================= SAVE GROUP REMARK =================
  const saveGroupRemark = async () => {
    await axios.post(`${API_BASE}/supervisor/save-supervisor-remarks`, {
      MeetingID: meetingId,
      GroupID: meeting.groupID,
      StudentEnrollID: null, // ✅ GROUP
      SupervisorID: user.id,
      Remarks: groupRemark,
    });

    alert("Group remark saved");
  };

  // ================= SAVE STUDENT REMARK =================
  const saveStudentRemark = async (member) => {
    await axios.post(`${API_BASE}/supervisor/save-supervisor-remarks`, {
      MeetingID: meetingId,
      GroupID: meeting.groupID,
      StudentEnrollID: member.EnrollmentID, // ✅ INDIVIDUAL
      SupervisorID: user.id,
      Remarks: studentRemarks[member.id],
    });

    alert("Student remark saved");
  };

  return (
    <SupervisorLayout>
      <AppBar title="Meeting Details" />

      <div className="p-4 space-y-4">

        {/* Meeting Info */}
        {meeting && (
          <div className="bg-card p-4 rounded-xl border">
            <h3 className="font-semibold text-lg">{meeting.title}</h3>
            <p className="text-sm">{meeting.date}</p>
          </div>
        )}

        {/* GROUP REMARK */}
        {meeting && (
          <div className="bg-card p-4 rounded-xl border">
            <h4 className="font-semibold">Group Remark</h4>

            <textarea
              className="w-full border p-2 rounded mt-2"
              rows={3}
              value={groupRemark}
              onChange={(e) => setGroupRemark(e.target.value)}
            />

            <Button className="mt-2" onClick={saveGroupRemark}>
              Save Group Remark
            </Button>
          </div>
        )}

        {/* Group & Attendance + Individual Remarks */}
        {group && (
          <div className="bg-card p-4 rounded-xl border">
            <h4 className="font-semibold">{group.groupName}</h4>

            <p className="text-sm mt-3 mb-1 font-medium">
              Mark Attendance & Remarks
            </p>

            {group.Members.map((m) => (
              <div
                key={m.regNum}
                className="bg-muted/20 p-3 rounded mt-2 space-y-2"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs">{m.regNum}</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={attendance[m.id] || false}
                    onChange={() => toggleAttendance(m.id)}
                    className="w-5 h-5 accent-primary"
                  />
                </div>

                {/* STUDENT REMARK */}
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Enter remark..."
                  value={studentRemarks[m.id] || ""}
                  onChange={(e) =>
                    setStudentRemarks((prev) => ({
                      ...prev,
                      [m.id]: e.target.value,
                    }))
                  }
                />

                <Button
                  size="sm"
                  onClick={() => saveStudentRemark(m)}
                >
                  Save Remark
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Tasks */}
        <div className="bg-card p-4 rounded-xl border">
          <h4 className="font-semibold">
            Assigned Tasks ({tasks.length})
          </h4>

          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-muted/20 p-3 rounded-lg mt-2"
            >
              <p className="font-medium">{t.title}</p>
              <p className="text-xs">
                Assigned To: <b>{t.AssignedType}-{t.name}</b>
              </p>
            </div>
          ))}
        </div>

        <Button onClick={saveAttendance} className="w-full">
          Save Attendance
        </Button>
      </div>
    </SupervisorLayout>
  );
}