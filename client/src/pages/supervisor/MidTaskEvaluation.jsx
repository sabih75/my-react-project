// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useLocation } from "wouter";
// import { AppBar } from "@/components/AppBar";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Users, 
//   ClipboardCheck, 
//   AlertCircle, 
//   MessageSquare, 
//   Save, 
//   Clock, 
//   MapPin, 
//   GraduationCap,
//   Calendar,
//   CheckCircle,
//   PlayCircle,
//   Info,
//   ChevronRight,
//   TrendingUp
// } from "lucide-react";
// import SupervisorLayout from "./SupervisorLayout";

// const API_BASE = "http://localhost/ProgressMonitoringProject/api";

// export default function MidTaskEvaluation() {
//   const [, setLocation] = useLocation();

//   // ================= AUTH & USER =================
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const supervisorId = user?.id;

//   // ================= STATE =================
//   const [meetings, setMeetings] = useState([]);
//   const [selectedMeeting, setSelectedMeeting] = useState(null);
//   const [evaluationParams, setEvaluationParams] = useState([]);
//   const [marks, setMarks] = useState({});
//   const [remarks, setRemarks] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [savingIndividual, setSavingIndividual] = useState({});

//   // ================= INITIAL LOAD =================
//   useEffect(() => {
//     if (supervisorId) {
//       fetchMeetings();
//     } else {
//       setLoading(false);
//     }
//   }, [supervisorId]);

//   const fetchMeetings = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${API_BASE}/committee-meetings/today-supervisor-meetings/${supervisorId}`
//       );
//       setMeetings(res.data || []);
      
//       // Auto-select first meeting if available
//       if (res.data && res.data.length > 0) {
//         handleSelectMeeting(res.data[0]);
//       }
//     } catch (err) {
//       console.error("Failed to load supervisor meetings:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectMeeting = async (meeting) => {
//     setSelectedMeeting(meeting);
//     try {
//       // Fetch dynamic evaluation criteria mapping from FYP-2 Criteria mapped to this meeting
//       const res = await axios.get(
//         `${API_BASE}/fyp2-scores/evaluation-panel/${meeting.meetingId}`
//       );
      
//       const params = res.data?.parameters || [];
//       setEvaluationParams(params);

//       // Fetch already saved marks for supervisor if they exist
//       const savedRes = await axios.get(
//         `${API_BASE}/fyp2-scores/get-saved-marks/${params[0]?.id || 0}/${supervisorId}`
//       ).catch(() => ({ data: [] }));

//       const savedList = savedRes.data || [];
//       const initialMarks = {};
//       const initialRemarks = {};

//       meeting.members.forEach((m) => {
//         initialMarks[m.studentID] = {};
//         initialRemarks[m.studentID] = "";
//       });

//       savedList.forEach((item) => {
//         const matchedMember = meeting.members.find(
//           (m) => m.EnrollmentID === item.studentEnrollID
//         );
//         if (matchedMember) {
//           initialMarks[matchedMember.studentID][item.subParameterID] = 
//             item.obtainedMarks !== null ? item.obtainedMarks : "";
//         }
//       });

//       setMarks(initialMarks);
//       setRemarks(initialRemarks);
//     } catch (err) {
//       console.error("Error loading criteria or saved marks:", err);
//     }
//   };

//   const handleMarkChange = (studentId, subParamId, value) => {
//     setMarks((prev) => ({
//       ...prev,
//       [studentId]: {
//         ...prev[studentId],
//         [subParamId]: value,
//       },
//     }));
//   };

//   const handleRemarkChange = (studentId, value) => {
//     setRemarks((prev) => ({
//       ...prev,
//       [studentId]: value,
//     }));
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async () => {
//     if (!selectedMeeting) return;

//     // Validate scores against maximum parameter marks
//     let hasError = false;
//     selectedMeeting.members.forEach((m) => {
//       evaluationParams.forEach((p) => {
//         p.subParameters.forEach((sp) => {
//           const val = marks[m.studentID]?.[sp.id];
//           const numericVal = val === "" || val === undefined ? 0 : Number(val);
//           const maxMarks = Number(sp.percentage);
//           if (numericVal < 0 || numericVal > maxMarks) {
//             alert(
//               `Error: Obtained marks for "${sp.name}" (${numericVal}) cannot exceed maximum marks (${maxMarks}) for ${m.name}!`
//             );
//             hasError = true;
//           }
//         });
//       });
//     });

//     if (hasError) return;

//     setSaving(true);
//     try {
//       const payload = [];
//       selectedMeeting.members.forEach((m) => {
//         evaluationParams.forEach((p) => {
//           p.subParameters.forEach((sp) => {
//             const val = marks[m.studentID]?.[sp.id];
//             payload.push({
//               EnrollmentID: m.EnrollmentID,
//               ParameterID: p.id,
//               SubParameterID: sp.id,
//               EvaluatorID: supervisorId,
//               ObtainedMarks: val === "" || val === undefined ? 0 : Number(val),
//               MaxMarks: Number(sp.percentage),
//               SessionID: 1, 
//               taskID: m.MidTaskId || 0,
//             });
//           });
//         });
//       });

//       await axios.post(
//         `${API_BASE}/fyp2-scores/update-evaluation-marks`,
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       // Save Student Remarks
//       for (const m of selectedMeeting.members) {
//         if (remarks[m.studentID]?.trim()) {
//           await axios.post(`${API_BASE}/supervisor/save-supervisor-remarks`, {
//             MeetingID: selectedMeeting.meetingId,
//             GroupID: selectedMeeting.groupId,
//             StudentEnrollID: m.EnrollmentID,
//             SupervisorID: supervisorId,
//             Remarks: remarks[m.studentID],
//           }).catch(() => null);
//         }
//       }

//       alert("Mid Task Evaluation Submitted Successfully! ✅");
//       fetchMeetings();
//     } catch (err) {
//       console.error("Failed to submit mid-task evaluation:", err);
//       alert("Error submitting evaluation marks. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveIndividual = async (member) => {
//     let hasError = false;
//     evaluationParams.forEach((p) => {
//       p.subParameters.forEach((sp) => {
//         const val = marks[member.studentID]?.[sp.id];
//         const numericVal = val === "" || val === undefined ? 0 : Number(val);
//         const maxMarks = Number(sp.percentage);
//         if (numericVal < 0 || numericVal > maxMarks) {
//           alert(
//             `Error: Obtained marks for "${sp.name}" (${numericVal}) cannot exceed maximum marks (${maxMarks}) for ${member.name}!`
//           );
//           hasError = true;
//         }
//       });
//     });

//     if (hasError) return;

//     setSavingIndividual((prev) => ({ ...prev, [member.studentID]: true }));

//     try {
//       const payload = [];
//       evaluationParams.forEach((p) => {
//         p.subParameters.forEach((sp) => {
//           const val = marks[member.studentID]?.[sp.id];
//           payload.push({
//             EnrollmentID: member.EnrollmentID,
//             ParameterID: p.id,
//             SubParameterID: sp.id,
//             EvaluatorID: supervisorId,
//             ObtainedMarks: val === "" || val === undefined ? 0 : Number(val),
//             MaxMarks: Number(sp.percentage),
//             SessionID: 1, 
//             taskID: member.MidTaskId || 0,
//           });
//         });
//       });

//       await axios.post(
//         `${API_BASE}/fyp2-scores/update-evaluation-marks`,
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (remarks[member.studentID]?.trim()) {
//         await axios.post(`${API_BASE}/supervisor/save-supervisor-remarks`, {
//           MeetingID: selectedMeeting.meetingId,
//           GroupID: selectedMeeting.groupId,
//           StudentEnrollID: member.EnrollmentID,
//           SupervisorID: supervisorId,
//           Remarks: remarks[member.studentID],
//         });
//       }

//       alert(`Evaluation Saved Successfully for ${member.name}! ✅`);
//       fetchMeetings();
//     } catch (err) {
//       console.error(`Failed to submit mid-task evaluation for ${member.name}:`, err);
//       alert(`Error saving evaluation marks for ${member.name}. Please try again.`);
//     } finally {
//       setSavingIndividual((prev) => ({ ...prev, [member.studentID]: false }));
//     }
//   };

//   // Group queue segments by meeting status
//   const inProgressMeetings = meetings.filter((m) => m.status === "In-Progress" || m.status === "In Progress");
//   const waitingMeetings = meetings.filter((m) => m.status === "Scheduled" || m.status === "Waiting");
//   const completedMeetings = meetings.filter((m) => m.status === "Completed");

//   return (
//     <SupervisorLayout>
//       <AppBar title="MidTask Evaluation Queue" showBack />

//       <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 bg-muted/20 min-h-[90vh]">
        
//         {/* ================= LEFT SIDE: MEETING QUEUE ================= */}
//         <div className="xl:col-span-1 space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          
//           {loading && meetings.length === 0 && (
//             <div className="space-y-3 animate-pulse">
//               <div className="h-24 bg-card rounded-2xl" />
//               <div className="h-24 bg-card rounded-2xl" />
//             </div>
//           )}

//           {!loading && meetings.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center bg-card rounded-3xl border border-dashed p-6">
//               <ClipboardCheck className="w-12 h-12 mb-3 text-destructive animate-bounce" />
//               <p className="font-bold text-foreground">No MidTask Meetings Queue</p>
//               <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
//                 You do not have any active MidTask or Committee Meetings scheduled for your groups.
//               </p>
//             </div>
//           )}

//           {/* In Progress segment */}
//           {inProgressMeetings.length > 0 && (
//             <div className="space-y-3">
//               <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
//                 <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Live Now
//               </h3>
//               {inProgressMeetings.map((m) => (
//                 <MeetingQueueCard 
//                   key={m.scheduleId} 
//                   meeting={m} 
//                   isSelected={selectedMeeting?.scheduleId === m.scheduleId} 
//                   onSelect={handleSelectMeeting} 
//                 />
//               ))}
//             </div>
//           )}

//           {/* Waiting segment */}
//           {waitingMeetings.length > 0 && (
//             <div className="space-y-3 pt-2">
//               <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Up Next</h3>
//               {waitingMeetings.map((m) => (
//                 <MeetingQueueCard 
//                   key={m.scheduleId} 
//                   meeting={m} 
//                   isSelected={selectedMeeting?.scheduleId === m.scheduleId} 
//                   onSelect={handleSelectMeeting} 
//                 />
//               ))}
//             </div>
//           )}

//           {/* Completed segment */}
//           {completedMeetings.length > 0 && (
//             <div className="space-y-3 pt-2">
//               <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</h3>
//               {completedMeetings.map((m) => (
//                 <MeetingQueueCard 
//                   key={m.scheduleId} 
//                   meeting={m} 
//                   isSelected={selectedMeeting?.scheduleId === m.scheduleId} 
//                   onSelect={handleSelectMeeting} 
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ================= RIGHT SIDE: DETAILS & EVALUATION ================= */}
//         <div className="xl:col-span-2 space-y-6">
          
//           {!selectedMeeting && !loading && (
//             <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card rounded-3xl border border-dashed">
//               <Users className="w-12 h-12 mb-4 opacity-20" />
//               <p className="font-medium">Select a group from the queue to start MidTask evaluation.</p>
//             </div>
//           )}

//           {selectedMeeting && (
//             <div className="space-y-6">
              
//               {/* Meeting Details + Evaluation parameters grid */}
//               <div className="grid md:grid-cols-2 gap-6">
                
//                 {/* 1. Meeting details card */}
//                 <Card className="p-6 rounded-3xl shadow-sm bg-card border flex flex-col justify-between">
//                   <div>
//                     <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
//                       <Info className="w-4 h-4 text-primary" /> Meeting Info
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-3">
//                         <ClipboardCheck className="w-4 h-4 mt-1 text-muted-foreground" />
//                         <div>
//                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Description</p>
//                           <p className="text-xs font-medium mt-0.5">{selectedMeeting.meetingDescription || "No description provided."}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-3">
//                         <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
//                         <div>
//                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Venue</p>
//                           <p className="text-xs font-medium mt-0.5">{selectedMeeting.venue}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-3">
//                         <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
//                         <div>
//                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Time</p>
//                           <p className="text-xs font-medium mt-0.5">{selectedMeeting.meetingTime}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mt-6 pt-4 border-t">
//                     <Badge className="bg-primary/10 text-primary hover:bg-primary/20 w-full py-1.5 rounded-xl justify-center font-bold">
//                       {selectedMeeting.type} Meeting
//                     </Badge>
//                   </div>
//                 </Card>

//                 {/* 2. Parameters Card */}
//                 <Card className="p-6 rounded-3xl shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 border">
//                   <h3 className="font-bold text-base mb-4 flex items-center gap-2">
//                     <TrendingUp className="w-4 h-4 text-primary" /> Mapped parameters
//                   </h3>
//                   {evaluationParams.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
//                       <AlertCircle className="w-8 h-8 mb-2 opacity-50 text-destructive" />
//                       <p className="text-xs font-medium">No evaluation criteria mapped for this meeting type.</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
//                       {evaluationParams.map((p) => (
//                         <div key={p.id} className="bg-card border rounded-xl p-3 flex justify-between items-center shadow-xs">
//                           <div>
//                             <p className="font-bold text-xs">{p.name}</p>
//                             <p className="text-[10px] text-muted-foreground mt-0.5">{p.percentage}% Weightage</p>
//                           </div>
//                           <Badge variant="outline" className="text-[10px] font-bold">
//                             {p.subParameters?.length || 0} Sub-params
//                           </Badge>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </Card>
//               </div>

//               {/* 3. Students Graded inputs */}
//               <div className="space-y-4">
//                 <h3 className="font-bold text-base flex items-center gap-2">
//                   <Users className="w-4 h-4 text-primary" /> Group Members Evaluation
//                 </h3>

//                 {selectedMeeting.members.map((member) => (
//                   <Card key={member.studentID} className="p-5 rounded-2xl border border-border/80 shadow-sm space-y-4 bg-card">
//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
//                           <GraduationCap className="w-5 h-5" />
//                         </div>
//                         <div>
//                           <p className="font-bold text-sm text-foreground">{member.name}</p>
//                           <p className="text-[10px] text-muted-foreground font-semibold">{member.regNum}</p>
//                         </div>
//                       </div>
//                       <Badge variant={member.MidTaskId ? "outline" : "destructive"}>
//                         {member.MidTaskId ? "MidTask Assigned" : "No MidTask"}
//                       </Badge>
//                     </div>

//                     {/* Criteria Sub parameters */}
//                     <div className="space-y-4 pt-3 border-t">
//                       {evaluationParams.map((param) => (
//                         <div key={param.id} className="space-y-3">
//                           {param.subParameters.map((sp) => (
//                             <div key={sp.id} className="bg-muted/30 border border-border/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                               <span className="text-xs font-semibold text-muted-foreground sm:max-w-[70%]">{sp.name}</span>
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   max={sp.percentage}
//                                   step="0.5"
//                                   placeholder="0"
//                                   value={marks[member.studentID]?.[sp.id] ?? ""}
//                                   onChange={(e) => handleMarkChange(member.studentID, sp.id, e.target.value)}
//                                   className="w-20 px-3 py-1.5 border rounded-lg text-center text-xs font-bold focus:ring-2 focus:ring-primary bg-card"
//                                 />
//                                 <span className="text-xs font-bold text-muted-foreground">/ {sp.percentage}</span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       ))}
//                     </div>

//                     {/* Individual Remarks */}
//                     <div className="space-y-2 pt-3 border-t">
//                       <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
//                         <MessageSquare className="w-3.5 h-3.5 text-primary" />
//                         Remarks for {member.name}
//                       </label>
//                       <textarea
//                         rows={2}
//                         value={remarks[member.studentID] || ""}
//                         onChange={(e) => handleRemarkChange(member.studentID, e.target.value)}
//                         placeholder="Add performance remarks..."
//                         className="w-full px-3 py-2 border rounded-xl text-xs bg-card focus:ring-2 focus:ring-primary"
//                       />
//                     </div>

//                     {/* Individual Save Button */}
//                     <Button
//                       onClick={() => handleSaveIndividual(member)}
//                       disabled={savingIndividual[member.studentID] || evaluationParams.length === 0}
//                       className="w-full mt-3 py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
//                     >
//                       <Save className="w-3.5 h-3.5" />
//                       {savingIndividual[member.studentID] ? "Saving..." : `Save Evaluation for ${member.name}`}
//                     </Button>
//                   </Card>
//                 ))}

//                 {/* Submit Action */}
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={saving || evaluationParams.length === 0}
//                   className="w-full py-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
//                 >
//                   <Save className="w-5 h-5" />
//                   {saving ? "Saving Evaluation..." : "Submit MidTask Evaluation Marks"}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </SupervisorLayout>
//   );
// }

// // ================= COMPONENT: QUEUE CARD =================
// function MeetingQueueCard({ meeting, isSelected, onSelect }) {
//   return (
//     <div 
//       onClick={() => onSelect(meeting)}
//       className={`p-4 border rounded-2xl cursor-pointer transition-all shadow-sm relative overflow-hidden flex flex-col gap-2 ${
//         isSelected 
//           ? "bg-primary/5 border-primary shadow-md" 
//           : "bg-card border-border/80 hover:bg-muted/30"
//       }`}
//     >
//       {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
      
//       <div className="flex justify-between items-start gap-3">
//         <div>
//           <h4 className="font-bold text-sm text-foreground">Group {meeting.groupId}</h4>
//           <p className="text-[10px] font-semibold text-muted-foreground line-clamp-1 mt-0.5">{meeting.projectName}</p>
//         </div>
//         <Badge 
//           className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 border-none ${
//             meeting.status === "In-Progress" || meeting.status === "In Progress"
//               ? "bg-blue-500 text-white animate-pulse"
//               : meeting.status === "Completed"
//               ? "bg-emerald-500 text-white"
//               : "bg-amber-500 text-white"
//           }`}
//         >
//           {meeting.status}
//         </Badge>
//       </div>

//       <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground font-semibold">
//         <div className="flex items-center gap-1">
//           <Clock className="w-3.5 h-3.5 text-primary" />
//           <span>{meeting.meetingTime}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
//         </div>
//       </div>
//     </div>
//   );
// }