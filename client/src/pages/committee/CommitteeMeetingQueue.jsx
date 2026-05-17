import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import axios from "axios";

import CommitteeLayout from "../committee/CommitteeLayout";
import { AppBar } from "@/components/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Target, MessageSquare, Calendar, Clock, CheckCircle, Info, MapPin, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

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
  if (meeting.Status === "Completed") return "Done";
  if (meeting.Status === "In-Progress") return "Live Now";
  
  const mins = calculateMinutesRemaining(meeting.MeetingTime, now);
  const clockTime = meeting.MeetingTime?.substring(0, 5) || "N/A";
  if (mins === null) return clockTime;
  
  if (mins <= 0 && mins > -15) return `Due now (${clockTime})`;
  return `In ${mins} min (${clockTime})`;
};

export default function CommitteeMeetingQueue() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/committee/meeting-queue/:meetingId?");
  const initialMeetingId = params?.meetingId ? parseInt(params.meetingId) : null;

  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [meetingDetails, setMeetingDetails] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [groupDetails, setGroupDetails] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);  
  const [isProjectAllocated, setIsProjectAllocated] = useState(false);
  const [isSupervisorAllocated, setIsSupervisorAllocated] = useState(false);

  const [evaluationParams, setEvaluationParams] = useState([]);
  const [savingStudentRemark, setSavingStudentRemark] = useState(false);

  const [now, setNow] = useState(new Date());

  const meetingTypes = meetings && Array.isArray(meetings) ? [...new Set(meetings.map(m => m.MeetingTitle))] : [];
  const [activeMeetingType, setActiveMeetingType] = useState(null);
  const [studentRemarks, setStudentRemarks] = useState({});
  const [openRemarkStudent, setOpenRemarkStudent] = useState(null);


  useEffect(() => {
    fetchMeetings(activeFYP);
    resetSelection();

    const pollInterval = setInterval(() => fetchMeetings(activeFYP), 10000);
    const timeInterval = setInterval(() => setNow(new Date()), 10000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, [activeFYP]);

  useEffect(() => {
    if (meetings.length > 0 && initialMeetingId) {
       const meeting = meetings.find(m => m.id === initialMeetingId);
       if (meeting) {
          setActiveMeetingType(meeting.MeetingTitle);
          fetchMeetingDetails(meeting);
       }
    }
  }, [meetings, initialMeetingId]);

  const resetSelection = () => {
    setSelectedMeeting(null);
    setSelectedGroup(null);
    setMeetingDetails(null);
    setScheduleDetails(null);
    setGroupDetails([]);
    setEvaluationParams([]);
  };

  const fetchMeetings = async (fypType) => {
    setLoading(true);
    try {
      const user1 = localStorage.getItem("user");
      if (user1) {
        const userJ = JSON.parse(user1);
        setLoggedInUser(userJ.id);
      }

      const res = await axios.get(`${API_BASE}/committee-meetings/today-meetings/${fypType}`);
      setMeetings(res.data || []);
    } catch {
      setMeetings([]);
    }
    setLoading(false);
  };

  const fetchMeetingDetails = async (meeting) => {
    setDetailsLoading(true);

    try {
      setSelectedMeeting(meeting.id);
      setSelectedGroup(meeting.GroupIDs);
        
      const meetingRes = await axios.get(`${API_BASE}/committee-meetings/meetings/${meeting.id}`);
      setMeetingDetails(meetingRes.data?.[0]);

      // Fetch dynamic PPT paths using the active schedule details
      const scheduleRes = await axios.get(`${API_BASE}/committee-meetings/schedule/${meeting.scheduleId}`);
      setScheduleDetails(scheduleRes.data);
      
      const groupRes = await axios.get(`${API_BASE}/committee-meetings/getSpecificGroup/${meeting.GroupIDs}`);
      setGroupDetails(groupRes.data || []);

      const projectRes = await axios.get(`${API_BASE}/committee-meetings/IsProjectAllocate/${meeting.GroupIDs}`);
      setIsProjectAllocated(projectRes.data);

      const supervisorRes = await axios.get(`${API_BASE}/committee-meetings/IsSupervisorAllocate/${meeting.GroupIDs}`);
      setIsSupervisorAllocated(supervisorRes.data);
      
      const evalRes = await axios.get(`${API_BASE}/committee-meetings/evaluation-parameters/${meeting.id}/${activeFYP}`);
      
      // Fix: Always set evaluation params if available so users can grade
      setEvaluationParams(evalRes.data || []);
      
    } catch (err) {
      console.error(err);
    }

    setDetailsLoading(false);
  };

  const normalize = (str) => str?.toLowerCase().trim();

  const loadStudentRemark = async (student) => {
    const key = student.studentID;

    if (openRemarkStudent === key) {
      setOpenRemarkStudent(null);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/fyp1-scores/get-remarks/${student.EnrollmentID}/${loggedInUser}/${student.sessionID}`);

      const list = Array.isArray(res.data) ? res.data : [];

      let selectedRemark = list.find((r) => r.meetingID === selectedMeeting);

      if (!selectedRemark && list.length > 0) {
        selectedRemark = list.reduce((latest, current) => {
          const latestDate = new Date(latest.updatedAt || latest.createdAt);
          const currentDate = new Date(current.updatedAt || current.createdAt);
          return currentDate > latestDate ? current : latest;
        });
      }

      setStudentRemarks((prev) => ({
        ...prev,
        [key]: selectedRemark?.remarks || "",
      }));
    } catch (err) {
      console.error(err);
      setStudentRemarks((prev) => ({
        ...prev,
        [key]: "",
      }));
    }

    setOpenRemarkStudent(key);
  };

  const handleStudentRemarkChange = (key, value) => {
    setStudentRemarks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveStudentRemark = async (student) => {
    const key = student.studentID;
    const text = studentRemarks[key];

    if (!text?.trim()) {
      alert("Please write remarks first");
      return;
    }

    try {
      setSavingStudentRemark(true);

      // Use the correct API prefix based on the active FYP type
      const apiPrefix = activeFYP === "FYP-2" ? "fyp2-scores" : "fyp1-scores";

      await axios.post(`${API_BASE}/${apiPrefix}/save-or-update`, {
        studentEnrollID: student.EnrollmentID,
        meetingID: selectedMeeting,
        evaluatorID: loggedInUser,
        sessionID: student.sessionID,
        remarks: text,
      });

      alert("Remarks saved / updated successfully");
      setOpenRemarkStudent(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save remarks");
    } finally {
      setSavingStudentRemark(false);
    }
  };

  const filteredMeetings = activeMeetingType
    ? meetings.filter((m) => normalize(m.MeetingTitle) === normalize(activeMeetingType))
    : [];

  const projectAllocation = () => {
    setLocation(`/committee/allocate-projects/${selectedMeeting}/${selectedGroup}`);
  };

  const supervisorAllocation = () => {
    setLocation(`/committee/allocation/${selectedGroup}`);
  };

  const inProgressMeetings = filteredMeetings.filter((m) => m.Status === "In-Progress");
  const waitingMeetings = filteredMeetings.filter((m) => m.Status === "Scheduled" || m.Status === "Waiting");
  const completedMeetings = filteredMeetings.filter((m) => m.Status === "Completed");

  const MeetingCard = ({ meeting, selectedMeeting, selectedGroup, onClick }) => {
    const isSelected = selectedMeeting === meeting.id && selectedGroup === meeting.GroupIDs;

    return (
      <div
        onClick={() => onClick(meeting)}
        className={`rounded-2xl border p-5 cursor-pointer transition shadow-sm
          ${isSelected ? "ring-2 ring-primary bg-primary/5 border-primary/20" : "hover:bg-muted/50 bg-card"}`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-primary">Group {meeting.GroupIDs}</h3>
          <Badge variant={meeting.Status === "Completed" ? "default" : meeting.Status === "In-Progress" ? "secondary" : "outline"}>
            {meeting.Status}
          </Badge>
        </div>

        <p className="text-sm font-medium mt-2 text-foreground">{meeting.MeetingTitle}</p>

        <div className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(meeting.MeetingDate).toLocaleDateString()}</span>
          <span className={`font-bold flex items-center gap-1 ${meeting.Status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
            <Clock className="w-3 h-3"/> {getTimeDisplay(meeting, now)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <CommitteeLayout>
      <AppBar title="Committee Meeting Queue" showBack />
      
      {/* FYP TABS */}
      <div className="px-6 pt-6 flex gap-3">
        <Button variant={activeFYP === "FYP-1" ? "default" : "outline"} onClick={() => setActiveFYP("FYP-1")} className="rounded-full px-6">
          FYP-1
        </Button>
        <Button variant={activeFYP === "FYP-2" ? "default" : "outline"} onClick={() => setActiveFYP("FYP-2")} className="rounded-full px-6">
          FYP-2
        </Button>
      </div>

      <div className="px-6 mt-4 flex gap-3 flex-wrap">
        {meetingTypes.map(type => (
          <Button
            key={type}
            size="sm"
            variant={activeMeetingType === type ? "secondary" : "ghost"}
            onClick={() => {
              setActiveMeetingType(type);
              resetSelection();
            }}
            className="rounded-full border border-border/50"
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT: MEETINGS */}
        <div className="xl:col-span-1 space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {!activeMeetingType && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center bg-muted/20 rounded-2xl border border-dashed">
              <ClipboardList className="w-10 h-10 mb-3 opacity-50" />
              <p>Select a meeting type above to view the queue.</p>
            </div>
          )}

          {inProgressMeetings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Live Now
              </h3>
              {inProgressMeetings.map((meeting) => (
                <MeetingCard key={`${meeting.id}-${meeting.GroupIDs}`} meeting={meeting} selectedMeeting={selectedMeeting} selectedGroup={selectedGroup} onClick={fetchMeetingDetails} />
              ))}
            </div>
          )}

          {waitingMeetings.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wider">Up Next</h3>
              {waitingMeetings.map((meeting) => (
                <MeetingCard key={`${meeting.id}-${meeting.GroupIDs}`} meeting={meeting} selectedMeeting={selectedMeeting} selectedGroup={selectedGroup} onClick={fetchMeetingDetails} />
              ))}
            </div>
          )}

          {completedMeetings.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider">Completed</h3>
              {completedMeetings.map((meeting) => (
                <MeetingCard key={`${meeting.id}-${meeting.GroupIDs}`} meeting={meeting} selectedMeeting={selectedMeeting} selectedGroup={selectedGroup} onClick={fetchMeetingDetails} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className="xl:col-span-2 space-y-6">
          {detailsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading group details...</p>
            </div>
          )}

          {!detailsLoading && !meetingDetails && activeMeetingType && (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Select a group from the queue to view details and evaluate.</p>
            </div>
          )}

          {meetingDetails && !detailsLoading && (
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Meeting Details Card */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Meeting Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
                      <p className="text-sm font-medium">{meetingDetails.meetingDescription || "No description provided."}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Venue</p>
                      <p className="text-sm font-medium">{meetingDetails.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Schedule</p>
                      <p className="text-sm font-medium">{meetingDetails.days} ({meetingDetails.startTime} - {meetingDetails.endTime})</p>
                    </div>
                  </div>

                  {meetingDetails.isFileRequired && (
                    <div className="flex items-start gap-3 pt-3 border-t border-border/50">
                      <ClipboardList className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="w-full">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Presentation File</p>
                        {scheduleDetails?.filePath ? (
                          <a
                            href={`http://localhost/ProgressMonitoringProject${scheduleDetails.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition mt-2"
                          >
                            Download Presentation PPT
                          </a>
                        ) : (
                          <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mt-2">
                            ⚠️ PPT not uploaded yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation Panel Card */}
              {evaluationParams.length > 0 ? (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" /> Evaluation Panel
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {evaluationParams.map((param) => {
                      const isCompleted = param.IsGraded === true;
                      return (
                        <div key={param.ParameterID} className="bg-background border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                          <div>
                            <p className="font-bold text-sm text-foreground">{param.ParameterName}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">{param.Percentage}% Weightage</p>
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? "outline" : "default"}
                            className={isCompleted ? "text-green-600 border-green-200 hover:bg-green-50" : "shadow-md"}
                            onClick={() => setLocation(`/committee/evaluation/${selectedMeeting}/${selectedGroup}/${param.ParameterID}/${activeFYP}`)}
                          >
                            {isCompleted ? <><CheckCircle className="w-4 h-4 mr-2"/> Graded</> : "Evaluate"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                 <div className="bg-muted/20 border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">No evaluation parameters set for this meeting type.</p>
                 </div>
              )}
            </div>
          )}

          {/* Group Students */}
          {groupDetails.length > 0 && !detailsLoading && (
            <div className="bg-card border rounded-3xl p-6 shadow-sm mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Group Students
                </h3>
                
                <div className="flex gap-2">
                  <Badge variant={isProjectAllocated ? "default" : "destructive"} className="px-3 py-1">
                    {isProjectAllocated ? "Project Allocated" : "No Project"}
                  </Badge>
                  <Badge variant={isSupervisorAllocated ? "default" : "destructive"} className="px-3 py-1">
                    {isSupervisorAllocated ? "Supervisor Allocated" : "No Supervisor"}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {groupDetails.map((student) => (
                  <div key={student.studentID} className="border border-border/50 rounded-2xl p-5 bg-muted/20 transition hover:bg-muted/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground text-lg">{student.studentName}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground font-medium mt-1">
                          <span>ID: {student.studentID}</span>
                          <span>|</span>
                          <span>CGPA: {student.currentCGPA}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      {!openRemarkStudent || openRemarkStudent !== student.studentID ? (
                        <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => loadStudentRemark(student)}>
                          <MessageSquare className="w-4 h-4" /> Add / View Remarks
                        </Button>
                      ) : (
                        <div className="space-y-3 animate-in slide-in-from-top-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Evaluator Remarks</label>
                          <textarea
                            rows={3}
                            placeholder="Write remarks for this student..."
                            className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                            value={studentRemarks[student.studentID] || ""}
                            onChange={(e) => handleStudentRemarkChange(student.studentID, e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setOpenRemarkStudent(null)}>Cancel</Button>
                            <Button size="sm" disabled={savingStudentRemark} onClick={() => saveStudentRemark(student)}>
                              {savingStudentRemark ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Allocation Actions */}
              {(!isProjectAllocated || !isSupervisorAllocated) && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  {!isProjectAllocated && (
                    <Button variant="secondary" onClick={projectAllocation}>Allocate Project</Button>
                  )}
                  {!isSupervisorAllocated && (
                    <Button variant="secondary" onClick={supervisorAllocation}>Allocate Supervisor</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CommitteeLayout>
  );
}