"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Target, Award, User, MessageSquare, Clock, Save, Copy, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { TrendingUp } from "lucide-react";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import { MobileLayout } from "@/components/MobileLayout";
const API = "http://localhost/ProgressMonitoringProject/api";

export default function DirectorEvaluationScreen() {
  const { meetingId, groupId, parameterId, activeFYP } = useParams();
  const [, setLocation] = useLocation();

  const [students, setStudents] = useState([]);
  const [parameter, setParameter] = useState(null);
  const [subParams, setSubParams] = useState([]);
  const [marks, setMarks] = useState({});
  const [calculatedScores, setCalculatedScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [allRemarks, setAllRemarks] = useState({});
  const [finalGrades, setFinalGrades] = useState({});
  const [openRemark, setOpenRemark] = useState(null);
  const [savingRemark, setSavingRemark] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [calculatingIndividual, setCalculatingIndividual] = useState({});
  const [savingIndividual, setSavingIndividual] = useState({});
  const [savingGradeIndividual, setSavingGradeIndividual] = useState({});
  const [includeSupervisorScore, setIncludeSupervisorScore] = useState(false);

  const [historyData, setHistoryData] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  const toggleHistory = async (student) => {
    const key = student.EnrollmentID;
    if (expandedHistory[key]) {
      setExpandedHistory((prev) => ({ ...prev, [key]: false }));
      return;
    }

    setExpandedHistory((prev) => ({ ...prev, [key]: true }));

    if (historyData[key]) return;

    try {
      setLoadingHistory((prev) => ({ ...prev, [key]: true }));
      const res = await axios.get(`${API}/fyp1-scores/student-evaluation-history/${student.EnrollmentID}`);
      setHistoryData((prev) => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error("Error loading evaluation history:", err);
      alert("Failed to load evaluation history");
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [key]: false }));
    }
  };

  const IS_FYP2 = activeFYP === "FYP-2";
  const getKey = (s) => `E-${s.EnrollmentID}`;

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoggedInUser(user?.id);

      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";

      // ================= STUDENTS =================
      const studentsRes = await axios.get(`${API}/${apiPrefix}/getDataForUpdateMarks/${groupId}`);
      const studentData = studentsRes.data || [];
      setStudents(studentData);

      // ================= PANEL =================
      let param = null;
      if (meetingId === "0" || meetingId === 0 || !meetingId) {
        const sessionRes = await axios.get(`${API}/users/CurrentSession`);
        const currentSessionId = sessionRes.data?.id || 1;
        const criteriaRes = await axios.get(`${API}/${apiPrefix}/available-criteria/${currentSessionId}`);
        const allParams = criteriaRes.data || [];
        param = allParams.find((p) => p.id == parameterId);
      } else {
        const panelRes = await axios.get(`${API}/${apiPrefix}/evaluation-panel/${meetingId}`);
        param = panelRes.data.parameters.find((p) => p.id == parameterId);
      }
      setParameter(param || null);
      setSubParams(param?.subParameters || []);

      const initialMarks = {};
      studentData.forEach((s) => {
        initialMarks[getKey(s)] = {};
      });

      if (user?.id) {
        try {
          const savedMarksUrl = IS_FYP2
            ? `${API}/${apiPrefix}/get-saved-marks/${parameterId}/${user.id}`
            : `${API}/${apiPrefix}/get-saved-marks/${meetingId}/${parameterId}/${user.id}`;
          const savedMarksRes = await axios.get(savedMarksUrl);
          const savedList = savedMarksRes.data || [];
          savedList.forEach((item) => {
            const studentKey = `E-${item.studentEnrollID}`;
            if (!initialMarks[studentKey]) {
              initialMarks[studentKey] = {};
            }
            initialMarks[studentKey][item.subParameterID] = item.obtainedMarks !== null ? item.obtainedMarks : "";
          });
        } catch (e) {
          console.error("Error fetching saved marks: ", e);
        }
      }
      setMarks(initialMarks);

      const initialGrades = {};
      studentData.forEach((s) => {
        initialGrades[getKey(s)] = {
          grade: s.Grade || "",
          score: "",
        };
      });
      setFinalGrades(initialGrades);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleChange = (key, subParamId, value) => {
    setMarks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [subParamId]: value,
      },
    }));
  };

  const saveEvaluationMarks = async () => {
    // Validation check: obtained score cannot exceed max marks
    let hasError = false;
    students.forEach((s) => {
      const key = getKey(s);
      subParams.forEach((sp) => {
        const val = marks?.[key]?.[sp.id];
        const numericVal = val === "" || val === undefined ? 0 : Number(val);
        const maxMarks = Number(sp.percentage);
        if (numericVal < 0 || numericVal > maxMarks) {
          alert(`Error: Obtained marks for "${sp.name}" (${numericVal}) cannot exceed maximum marks (${maxMarks}) for ${s.StudentName}!`);
          hasError = true;
        }
      });
    });
    if (hasError) return;

    const payload = [];
    students.forEach((s) => {
      subParams.forEach((sp) => {
        const val = marks?.[getKey(s)]?.[sp.id];
        const basePayload = {
          EnrollmentID: s.EnrollmentID,
          ParameterID: Number(parameterId),
          SubParameterID: sp.id,
          EvaluatorID: loggedInUser,
          ObtainedMarks: val === "" || val === undefined ? 0 : Number(val),
          MaxMarks: Number(sp.percentage),
          SessionID: Number(s.sessionID),
        };

        if (IS_FYP2) {
          payload.push({ ...basePayload, taskID: s.TaskId || 0 });
        } else {
          payload.push({ ...basePayload, MeetingID: Number(meetingId) });
        }
      });
    });

    try {
      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      await axios.post(`${API}/${apiPrefix}/update-evaluation-marks`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Evaluation Marks Saved Successfully");
    } catch (err) {
      console.error("Save Marks Error => ", err);
      alert("Error saving evaluation marks!");
    }
  };

  // ================= REMARKS =================
  const loadRemarks = async (student) => {
    const key = getKey(student);

    if (openRemark === key) {
      setOpenRemark(null);
      return;
    }

    try {
      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      // Fetch specifically the logged-in user's remarks
      const res = await axios.get(`${API}/${apiPrefix}/get-remarks/${student.EnrollmentID}/${loggedInUser}/${student.sessionID}`);
      const list = Array.isArray(res.data) ? res.data : [];

      let selectedRemark = null;

      if (!IS_FYP2) {
        selectedRemark = list.find((r) => r.meetingID === Number(meetingId));
      }

      if (!selectedRemark && list.length > 0) {
        selectedRemark = list.reduce((latest, current) => {
          const latestDate = new Date(current.updatedAt || current.createdAt);
          const currentDate = new Date(latest.updatedAt || latest.createdAt);
          return currentDate > latestDate ? current : latest;
        });
      }

      setRemarks((prev) => ({ ...prev, [key]: selectedRemark?.remarks || "" }));
      // We no longer populate allRemarks for the accordion since the endpoint is specific to this user
      setAllRemarks((prev) => ({ ...prev, [key]: list }));
      setOpenRemark(key);
    } catch (err) {
      console.error("Load remarks error:", err);
    }
  };

  const copyRemarkToAll = (text) => {
    if (!text?.trim()) return;
    const updated = {};
    students.forEach((s) => {
      updated[getKey(s)] = text;
    });
    setRemarks(updated);
  };

  const saveRemarks = async (student) => {
    const key = getKey(student);
    if (!remarks[key]?.trim()) {
      alert("Please write remarks first");
      return;
    }

    try {
      setSavingRemark(true);
      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      await axios.post(`${API}/${apiPrefix}/save-or-update`, {
        studentEnrollID: student.EnrollmentID,
        meetingID: meetingId,
        evaluatorID: loggedInUser,
        sessionID: student.sessionID,
        remarks: remarks[key],
      });
      alert("Remarks saved successfully");
    } catch (err) {
      console.error("Save remark error:", err);
      alert("Failed to save remarks");
    } finally {
      setSavingRemark(false);
    }
  };

  // ================= FINAL GRADE =================
  const handleFinalGradeChange = (key, field, value) => {
    setFinalGrades((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // ================= CALCULATE SCORES =================
  const calculateFinalScores = async () => {
    try {
      const endpoint = IS_FYP2
        ? `${API}/fyp2-scores/calculate-final-fyp2?includeSupervisorScore=${includeSupervisorScore}`
        : `${API}/fyp1-scores/calculate-final-fyp1?includeSupervisorScore=${includeSupervisorScore}`;
      const res = await axios.post(endpoint);
      const map = {};

      res.data.forEach((r) => {
        map[`E-${r.EnrollmentID}`] = {
          score: r.FinalScore,
          grade: r.Grade,
        };
      });

      setCalculatedScores(map);
      setFinalGrades(map);
    } catch (err) {
      console.error("Calculation error:", err);
      alert("Failed to calculate scores");
    }
  };

  // ================= SAVE FINAL GRADES =================
  const saveFinalGrades = async () => {
    try {
      const payload = students.map((s) => ({
        EnrollmentID: s.EnrollmentID,
        FinalGrade: finalGrades[getKey(s)]?.grade || null,
        FinalScore: finalGrades[getKey(s)]?.score || null,
        SessionID: s.sessionID,
        EvaluatorID: loggedInUser,
      }));

      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      await axios.post(`${API}/${apiPrefix}/save-final-grades`, payload);
      alert("Final grades saved successfully");
    } catch (err) {
      console.error("Save grades error:", err);
      alert("Failed to save final grades");
    }
  };

  const calculateIndividualScore = async (student) => {
    const key = getKey(student);
    try {
      setCalculatingIndividual((prev) => ({ ...prev, [key]: true }));
      const endpoint = IS_FYP2
        ? `${API}/fyp2-scores/calculate-final-fyp2?includeSupervisorScore=${includeSupervisorScore}`
        : `${API}/fyp1-scores/calculate-final-fyp1?includeSupervisorScore=${includeSupervisorScore}`;
      const res = await axios.post(endpoint);

      const record = res.data.find((r) => r.EnrollmentID === student.EnrollmentID);
      if (record) {
        setCalculatedScores((prev) => ({
          ...prev,
          [key]: {
            score: record.FinalScore,
            grade: record.Grade
          }
        }));
        setFinalGrades((prev) => ({
          ...prev,
          [key]: {
            score: record.FinalScore,
            grade: record.Grade
          }
        }));
        alert(`Score calculated for ${student.StudentName}: ${record.FinalScore} (Grade: ${record.Grade})`);
      } else {
        alert(`No score calculation data found for ${student.StudentName}`);
      }
    } catch (err) {
      console.error("Individual Calculation error:", err);
      alert("Failed to calculate score");
    } finally {
      setCalculatingIndividual((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveIndividualMarks = async (student) => {
    const key = getKey(student);

    // Validation check: obtained score cannot exceed max marks
    let hasError = false;
    subParams.forEach((sp) => {
      const val = marks?.[key]?.[sp.id];
      const numericVal = val === "" || val === undefined ? 0 : Number(val);
      const maxMarks = Number(sp.percentage);
      if (numericVal < 0 || numericVal > maxMarks) {
        alert(`Error: Obtained marks for "${sp.name}" (${numericVal}) cannot exceed maximum marks (${maxMarks}) for ${student.StudentName}!`);
        hasError = true;
      }
    });
    if (hasError) return;

    const payload = [];

    subParams.forEach((sp) => {
      const val = marks?.[key]?.[sp.id];
      const basePayload = {
        EnrollmentID: student.EnrollmentID,
        ParameterID: Number(parameterId),
        SubParameterID: sp.id,
        EvaluatorID: loggedInUser,
        ObtainedMarks: val === "" || val === undefined ? 0 : Number(val),
        MaxMarks: Number(sp.percentage),
        SessionID: Number(student.sessionID),
      };

      if (IS_FYP2) {
        payload.push({ ...basePayload, taskID: student.TaskId || 0 });
      } else {
        payload.push({ ...basePayload, MeetingID: Number(meetingId) });
      }
    });

    try {
      setSavingIndividual((prev) => ({ ...prev, [key]: true }));
      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      await axios.post(`${API}/${apiPrefix}/update-evaluation-marks`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert(`Evaluation marks for ${student.StudentName} saved successfully!`);
    } catch (err) {
      console.error("Individual save marks error:", err);
      alert(`Failed to save marks for ${student.StudentName}`);
    } finally {
      setSavingIndividual((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveIndividualFinalGrade = async (student) => {
    const key = getKey(student);
    const gradeVal = finalGrades[key]?.grade || calculatedScores[key]?.grade || null;
    const scoreVal = finalGrades[key]?.score || calculatedScores[key]?.score || null;

    const payload = [{
      EnrollmentID: student.EnrollmentID,
      FinalGrade: gradeVal,
      FinalScore: scoreVal,
      SessionID: student.sessionID,
      EvaluatorID: loggedInUser,
    }];

    try {
      setSavingGradeIndividual((prev) => ({ ...prev, [key]: true }));
      const apiPrefix = IS_FYP2 ? "fyp2-scores" : "fyp1-scores";
      await axios.post(`${API}/${apiPrefix}/save-final-grades`, payload);
      alert(`Final grade for ${student.StudentName} saved successfully!`);
    } catch (err) {
      console.error("Individual save grade error:", err);
      alert(`Failed to save grade for ${student.StudentName}`);
    } finally {
      setSavingGradeIndividual((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <CommitteeHeadLayout>
      <div className="min-h-screen bg-muted/30 p-6 space-y-6">

        {/* HEADER CARD */}
        <div className="bg-gradient-to-r from-blue-900/10 to-blue-900/5 border border-blue-900/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Director Final Evaluation
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="bg-background text-xs font-medium uppercase">
                  {activeFYP}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="w-4 h-4" /> {parameter?.name || "Loading Parameter..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SUPERVISOR SCORE SETTING */}
        <div className="bg-card border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm max-w-5xl mx-auto">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Grade Calculation Options
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose whether to incorporate supervisor's task evaluation scores into the final grade calculation (80% Committee/Director weightage, 20% Supervisor weightage).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border shrink-0">
            <input
              type="checkbox"
              id="includeSupScore"
              checked={includeSupervisorScore}
              onChange={(e) => setIncludeSupervisorScore(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
            />
            <label htmlFor="includeSupScore" className="text-xs font-bold text-foreground cursor-pointer select-none">
              Include Supervisor Score
            </label>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="font-medium">Loading student data...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {students.map((s) => {
                const key = getKey(s);
                const isOpen = openRemark === key;
                const hasTask = IS_FYP2 ? s.TaskId && s.TaskId !== 0 : true;

                return (
                  <Card key={key} className={`overflow-hidden border-border/50 shadow-sm transition-shadow ${!hasTask ? 'opacity-80' : 'hover:shadow-md'}`}>

                    {/* STUDENT HEADER */}
                    <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{s.StudentName}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span>CGPA: {s.currentCGPA}</span>
                            <span>|</span>
                            <span>ID: {s.EnrollmentID}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="default" onClick={() => setLocation(`/student-progress/${s.StudentID}/${activeFYP}`)}>
                          View Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant={expandedHistory[s.EnrollmentID] ? "secondary" : "outline"} 
                          onClick={() => toggleHistory(s)} 
                          className="flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" /> 
                          {expandedHistory[s.EnrollmentID] ? "Hide History" : "View History"}
                        </Button>
                        {hasTask && (
                          <Button size="sm" variant={isOpen ? "secondary" : "outline"} onClick={() => loadRemarks(s)} className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> {isOpen ? "Hide Remarks" : "View Remarks"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-6">

                      {/* FYP-2 TASK CHECK */}
                      {!hasTask && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5" />
                          <p className="text-sm font-medium">This group has not been assigned a task for FYP-2 yet. Evaluation cannot proceed.</p>
                        </div>
                      )}

                      {/* SUB PARAMETERS */}
                      {hasTask && subParams.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                          {subParams.map((sp) => (
                            <div key={sp.id} className="bg-background border rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition-colors shadow-sm">
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium text-sm leading-tight text-foreground line-clamp-2" title={sp.name}>
                                  {sp.name}
                                </p>
                                <Badge variant="secondary" className="shrink-0">{sp.percentage}%</Badge>
                              </div>
                              <div className="mt-auto pt-2 border-t flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground font-medium">Score</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  max={sp.percentage}
                                  className="border bg-muted/20 p-2 rounded-lg w-20 text-center font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                                  value={marks?.[key]?.[sp.id] || ""}
                                  onChange={(e) => handleChange(key, sp.id, e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* REMARKS SECTION */}
                      {isOpen && hasTask && (
                        <div className="animate-in slide-in-from-top-2 space-y-6">

                          {/* ALL REMARKS */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                              <MessageSquare className="w-4 h-4 text-primary" /> Previous Evaluator Remarks
                            </h4>
                            {allRemarks[key]?.length > 0 ? (
                              <div className="grid gap-3">
                                {allRemarks[key].map((r, i) => (
                                  <div key={i} className="bg-muted/30 border rounded-xl p-4 text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                      <Badge variant="secondary">{r.evaluatorName || r.evaluatorID}</Badge>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(r.updatedAt || r.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-foreground">{r.remarks}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl text-center">No previous remarks available.</p>
                            )}
                          </div>

                          {/* DIRECTOR REMARK */}
                          <div className="space-y-3 border-t pt-6">
                            <label className="text-sm font-semibold text-foreground">Director Final Remarks</label>
                            <textarea
                              rows={4}
                              placeholder="Write final decision remarks here..."
                              className="w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                              value={remarks[key] || ""}
                              onChange={(e) => setRemarks((prev) => ({ ...prev, [key]: e.target.value }))}
                            />
                            <div className="flex justify-between items-center pt-2">
                              <Button variant="outline" size="sm" onClick={() => copyRemarkToAll(remarks[key])} className="flex items-center gap-2">
                                <Copy className="w-4 h-4" /> Copy to All Students
                              </Button>
                              <Button size="sm" disabled={savingRemark} onClick={() => saveRemarks(s)} className="flex items-center gap-2">
                                {savingRemark ? "Saving..." : <><CheckCircle className="w-4 h-4" /> Save Remark</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EVALUATION HISTORY SECTION */}
                      {expandedHistory[s.EnrollmentID] && (
                        <div className="border border-blue-900/10 rounded-xl p-5 bg-blue-50/20 space-y-4 animate-in slide-in-from-top-2">
                          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-950" /> Grading & Remarks Evaluation History
                          </h4>

                          {loadingHistory[s.EnrollmentID] ? (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></span>
                              Loading history...
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* SUPERVISOR HISTORY */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Supervisor Marks & Task Remarks
                                </h5>
                                {historyData[s.EnrollmentID]?.supervisorHistory?.length > 0 ? (
                                  <div className="border rounded-lg bg-background overflow-hidden divide-y text-xs">
                                    {historyData[s.EnrollmentID].supervisorHistory.map((t, idx) => (
                                      <div key={idx} className="p-3 space-y-1">
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-foreground">{t.TaskTitle}</span>
                                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-900 text-white">
                                            {t.Status} ({t.ProgressStatus})
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                          <span>Remarks: <span className="text-foreground italic">{t.Remarks}</span></span>
                                          <span className="font-bold text-primary shrink-0 ml-4">
                                            Score: {t.Score !== null ? `${t.Score} / 100` : "Not Graded"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic bg-background border p-3 rounded-lg text-center">
                                    No supervisor tasks or remarks found.
                                  </p>
                                )}
                              </div>

                              {/* COMMITTEE HISTORY */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Committee Meeting Evaluation History
                                </h5>
                                {historyData[s.EnrollmentID]?.committeeHistory?.length > 0 ? (
                                  <div className="border rounded-lg bg-background overflow-hidden divide-y text-xs">
                                    {historyData[s.EnrollmentID].committeeHistory.map((c, idx) => (
                                      <div key={idx} className="p-3 space-y-1">
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-foreground">{c.MeetingTitle} - {c.ParameterName}</span>
                                          <span className="font-bold text-emerald-700 shrink-0 ml-4">
                                            {c.ObtainedMarks} / {c.MaxMarks} Marks
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                          Sub-Parameter: <span className="text-foreground">{c.SubParameterName}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                          <span>Remarks: <span className="text-foreground italic">{c.Remarks}</span></span>
                                          <span className="font-semibold text-foreground">By: {c.Evaluator}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic bg-background border p-3 rounded-lg text-center">
                                    No committee evaluation history found.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FINAL GRADE */}
                      {hasTask && (
                        <>
                          <div className="bg-muted/20 rounded-xl p-4 border flex items-center gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Final Grade</label>
                              <select
                                className="w-full border rounded-lg p-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                value={finalGrades[key]?.grade || calculatedScores[key]?.grade || ""}
                                onChange={(e) => handleFinalGradeChange(key, "grade", e.target.value)}
                              >
                                <option value="">Select Grade</option>
                                <option>A+</option>
                                <option>A</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B</option>
                                <option>B-</option>
                                <option>C+</option>
                                <option>C</option>
                                <option>C-</option>
                                <option>D+</option>
                                <option>D</option>
                                <option>F</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Final Score</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                className="w-full border rounded-lg p-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                value={finalGrades[key]?.score || calculatedScores[key]?.score || ""}
                                onChange={(e) => handleFinalGradeChange(key, "score", e.target.value)}
                              />
                            </div>
                          </div>

                          {/* INDIVIDUAL ACTION GROUP */}
                          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2.5 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => calculateIndividualScore(s)}
                              disabled={calculatingIndividual[key]}
                            >
                              <Calculator className="w-4 h-4" />
                              {calculatingIndividual[key] ? "Calculating..." : "Calc Score"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2 font-semibold"
                              onClick={() => saveIndividualMarks(s)}
                              disabled={savingIndividual[key]}
                            >
                              <Target className="w-4 h-4" />
                              {savingIndividual[key] ? "Saving..." : "Save Marks"}
                            </Button>

                            <Button
                              size="sm"
                              className="flex items-center gap-2 font-semibold"
                              onClick={() => saveIndividualFinalGrade(s)}
                              disabled={savingGradeIndividual[key]}
                            >
                              <Save className="w-4 h-4" />
                              {savingGradeIndividual[key] ? "Saving..." : "Save Grade"}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}

              {/* ACTIONS */}
              <div className="flex gap-4 sticky bottom-6 mt-8">
                <Button variant="secondary" size="lg" className="flex-1 shadow-lg text-lg font-medium h-14" onClick={calculateFinalScores}>
                  <Calculator className="w-5 h-5 mr-2" /> Calculate Final Scores
                </Button>
                <Button variant="outline" size="lg" className="flex-1 shadow-lg text-lg font-medium h-14 bg-background border-primary text-primary hover:bg-primary/10" onClick={saveEvaluationMarks}>
                  <Target className="w-5 h-5 mr-2" /> Save Evaluation Marks
                </Button>
                <Button size="lg" className="flex-1 shadow-lg text-lg font-medium h-14" onClick={saveFinalGrades}>
                  <Save className="w-5 h-5 mr-2" /> Save Final Grades
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}