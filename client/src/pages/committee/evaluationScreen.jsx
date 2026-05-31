"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, MessageSquare, Award, User, Target, ClipboardList, PenTool, CheckCircle, Clock } from "lucide-react";

import CommitteeLayout from "./CommitteeLayout";
import SupervisorLayout from "../supervisor/SupervisorLayout";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function EvaluationScreen() {
  const { meetingId, groupId, parameterId, activeFYP } = useParams();
  const [location] = useLocation();
  const isSupervisorSide = location.startsWith("/supervisor");
  const Layout = isSupervisorSide ? SupervisorLayout : CommitteeLayout;

  const SCORE_API = activeFYP?.toLowerCase() === "fyp-2" ? "fyp2-scores" : "fyp1-scores";
  const IS_FYP2 = activeFYP?.toLowerCase() === "fyp-2";

  const [students, setStudents] = useState([]);
  const [parameter, setParameter] = useState(null);
  const [subParams, setSubParams] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [openRemark, setOpenRemark] = useState(null);
  const [savingRemark, setSavingRemark] = useState(false);
  const [remarkMeta, setRemarkMeta] = useState({});
  const [savingIndividual, setSavingIndividual] = useState({});
  const [groupInfo, setGroupInfo] = useState({});
  const [evaluationStatus, setEvaluationStatus] = useState({});

  const getKey = (s) => (s.EnrollmentID && s.EnrollmentID !== 0 ? `E-${s.EnrollmentID}` : `S-${s.StudentID}`);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let currentUserId = loggedInUser;
      const user1 = localStorage.getItem("user");
      if (user1) {
        const userJ = JSON.parse(user1);
        currentUserId = userJ.id;
        setLoggedInUser(userJ.id);
      }

      const groupRes = await axios.get(`${API}/${SCORE_API}/getDataForUpdateMarks/${groupId}`);
      const studentData = groupRes.data || [];
      setStudents(studentData);

      if (IS_FYP2) {
        const groupDetailRes = await axios.get(`${API}/fyp2-scores/groups/${groupId}`).catch(() => ({ data: {} }));
        setGroupInfo(groupDetailRes.data || {});
      }

      let param = null;
      if (meetingId === "0" || meetingId === 0 || !meetingId) {
        const sessionRes = await axios.get(`${API}/users/CurrentSession`);
        const currentSessionId = sessionRes.data?.id || 1;
        const criteriaRes = await axios.get(`${API}/${SCORE_API}/available-criteria/${currentSessionId}`);
        const allParams = criteriaRes.data || [];
        param = allParams.find((p) => p.id == parameterId);
      } else {
        const res = await axios.get(`${API}/${SCORE_API}/evaluation-panel/${meetingId}`);
        const panelData = res.data;
        param = panelData.parameters.find((p) => p.id == parameterId);
      }

      setParameter(param || null);
      setSubParams(param?.subParameters || []);

      const initialMarks = {};
      studentData.forEach((s) => {
        initialMarks[getKey(s)] = {};
      });

      let allEvaluatorsMarks = [];
      if (param) {
        const allMarksRes = await axios.get(`${API}/${SCORE_API}/get-all-saved-marks/${param.id}`).catch(() => ({ data: [] }));
        allEvaluatorsMarks = allMarksRes.data || [];
      }

      const evalStatusMap = {};

      if (currentUserId) {
        studentData.forEach((s) => {
          const studentKey = getKey(s);
          const globalMarksForStudent = allEvaluatorsMarks.filter(m => m.studentEnrollID === s.EnrollmentID);

          const myMarks = globalMarksForStudent.filter(m => String(m.evaluatorID) === String(currentUserId));

          // Only committee members can lock out other committee members. Director/CommitteeHead evaluations are ignored here.
          const committeeMarks = globalMarksForStudent.filter(m =>
            String(m.evaluatorID) !== String(currentUserId) &&
            m.evaluatorRole !== "Director" &&
            m.evaluatorRole !== "CommitteeHead"
          );

          if (myMarks.length > 0) {
            const evaluatorId = myMarks[0].evaluatorID;
            evalStatusMap[studentKey] = {
              isEvaluated: true,
              evaluatorId: evaluatorId,
              isEvaluatedByMe: true
            };
            myMarks.forEach(item => {
              initialMarks[studentKey][item.subParameterID] = item.obtainedMarks !== null ? item.obtainedMarks : "";
            });
          } else if (committeeMarks.length > 0) {
            const evaluatorId = committeeMarks[0].evaluatorID;
            evalStatusMap[studentKey] = {
              isEvaluated: true,
              evaluatorId: evaluatorId,
              isEvaluatedByMe: false
            };
          } else {
            evalStatusMap[studentKey] = { isEvaluated: false };
          }
        });
      }

      setEvaluationStatus(evalStatusMap);
      setMarks(initialMarks);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const loadRemarks = async (student) => {
    const key = getKey(student);

    if (openRemark === key) {
      setOpenRemark(null);
      return;
    }

    try {
      const res = await axios.get(`${API}/${SCORE_API}/get-remarks/${student.EnrollmentID}/${loggedInUser}/${student.sessionID}`);
      const list = Array.isArray(res.data) ? res.data : [];

      let selectedRemark = null;

      // For FYP-1, try to find an exact match by meetingID. For FYP-2, there is no meetingID, so this will be skipped.
      if (!IS_FYP2) {
        selectedRemark = list.find((r) => r.meetingID === Number(meetingId));
      }

      // If no exact meeting match (or if FYP-2), just grab the most recent remark provided by this evaluator
      if (!selectedRemark && list.length > 0) {
        selectedRemark = list.reduce((latest, current) => {
          const latestDate = new Date(current.updatedAt || current.createdAt);
          const currentDate = new Date(latest.updatedAt || latest.createdAt);
          return currentDate > latestDate ? current : latest;
        });
      }

      setRemarks((prev) => ({ ...prev, [key]: selectedRemark?.remarks || "" }));
      setRemarkMeta((prev) => ({
        ...prev,
        [key]: selectedRemark ? { createdAt: selectedRemark.createdAt, updatedAt: selectedRemark.updatedAt } : null,
      }));
    } catch (err) {
      console.log(err);
    }
    setOpenRemark(key);
  };

  const handleRemarkChange = (key, value) => {
    setRemarks((prev) => ({ ...prev, [key]: value }));
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

  const saveRemarks = async (student) => {
    const key = getKey(student);
    const evalStat = evaluationStatus[key] || {};
    if (evalStat.isEvaluated && !evalStat.isEvaluatedByMe) {
      alert("This student is already evaluated by another member.");
      return;
    }

    const remarkText = remarks[key];

    if (!remarkText?.trim()) {
      alert("Please write remarks first");
      return;
    }

    try {
      setSavingRemark(true);
      await axios.post(`${API}/${SCORE_API}/save-or-update`, {
        studentEnrollID: student.EnrollmentID,
        meetingID: Number(meetingId),
        evaluatorID: loggedInUser,
        sessionID: Number(student.sessionID),
        remarks: remarkText,
      });
      alert("Remarks saved / updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving remark");
    } finally {
      setSavingRemark(false);
    }
  };

  const saveIndividualMarks = async (student) => {
    const key = getKey(student);
    const evalStat = evaluationStatus[key] || {};
    if (evalStat.isEvaluated && !evalStat.isEvaluatedByMe) {
      alert("This student is already evaluated by another member.");
      return;
    }

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
      await axios.post(`${API}/${SCORE_API}/update-evaluation-marks`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert(`Marks for ${student.StudentName} saved successfully!`);
    } catch (err) {
      console.error("ERROR => ", err.response?.data || err);
      alert(`Error saving marks for ${student.StudentName}!`);
    } finally {
      setSavingIndividual((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveMarks = async () => {
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
      const key = getKey(s);
      const evalStat = evaluationStatus[key] || {};
      if (evalStat.isEvaluated && !evalStat.isEvaluatedByMe) return; // Skip locked

      subParams.forEach((sp) => {
        const val = marks?.[key]?.[sp.id];
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
      alert("Saving marks...");
      const res = await axios.post(`${API}/${SCORE_API}/update-evaluation-marks`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Saved Successfully");
    } catch (err) {
      console.error("ERROR => ", err.response?.data || err);
      alert("Error saving marks !");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 p-6 space-y-6">

        {/* HEADER CARD */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Evaluation Panel
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
            <Badge className="px-4 py-2 text-sm bg-primary text-primary-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              {parameter?.percentage}% Weightage
            </Badge>
          </div>

          {IS_FYP2 && groupInfo.projectName && (
            <div className="mt-5 pt-5 border-t border-primary/10 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Project Title</p>
                <p className="font-semibold text-foreground mt-1.5">{groupInfo.projectName}</p>
              </div>
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Director Assigned Task</p>
                <p className="text-sm font-medium text-foreground bg-background/60 p-3 rounded-xl border border-primary/10 mt-1.5 italic leading-relaxed">
                  {parameter?.name?.toLowerCase().includes("mid")
                    ? groupInfo.midTask || "No MidTask details assigned."
                    : groupInfo.finalTask || "No Final Task details assigned."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="font-medium">Loading evaluation data...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {students.map((s) => {
                const key = getKey(s);
                const isOpen = openRemark === key;
                const evalStat = evaluationStatus[key] || {};
                const isLocked = evalStat.isEvaluated && !evalStat.isEvaluatedByMe;

                return (
                  <Card key={key} className={`overflow-hidden border-border/50 shadow-sm transition-shadow ${isLocked ? "opacity-80" : "hover:shadow-md"}`}>

                    {/* STUDENT HEADER */}
                    <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground flex items-center gap-3">
                            {s.StudentName}
                            {isLocked && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">
                                Evaluated by Committee Member
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">CGPA: {s.currentCGPA}</p>
                        </div>
                      </div>

                      <Button
                        variant={isOpen ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => loadRemarks(s)}
                        disabled={isLocked}
                        className="flex items-center gap-2"
                      >
                        {isOpen ? (
                          <>Hide Remarks</>
                        ) : remarkMeta[key] ? (
                          <><PenTool className="w-4 h-4" /> Edit Remarks</>
                        ) : (
                          <><MessageSquare className="w-4 h-4" /> Add Remarks</>
                        )}
                      </Button>
                    </div>

                    <div className="p-6">
                      {/* SUB PARAMETERS */}
                      {subParams.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {subParams.map((sp) => (
                            <div key={sp.id} className={`bg-background border rounded-xl p-4 flex flex-col gap-3 group transition-colors ${isLocked ? "opacity-60 bg-muted/20" : "hover:border-primary/50"}`}>
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
                                  disabled={isLocked}
                                  className="border bg-muted/20 p-2 rounded-lg w-20 text-center font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all disabled:opacity-50"
                                  value={marks?.[key]?.[sp.id] || ""}
                                  onChange={(e) => handleChange(key, sp.id, e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No sub-parameters defined for this criterion.</p>
                        </div>
                      )}

                      {/* REMARKS SECTION */}
                      {isOpen && !isLocked && (
                        <div className="mt-6 border-t pt-6 animate-in slide-in-from-top-2">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              Evaluator Remarks
                            </label>
                            {remarkMeta[key]?.createdAt && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last updated: {new Date(remarkMeta[key].updatedAt || remarkMeta[key].createdAt).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <textarea
                            rows={4}
                            placeholder="Provide constructive feedback for this student..."
                            className="w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                            value={remarks[key] || ""}
                            onChange={(e) => handleRemarkChange(key, e.target.value)}
                          />

                          <div className="flex justify-end mt-3">
                            <Button
                              size="sm"
                              disabled={savingRemark}
                              onClick={() => saveRemarks(s)}
                              className="flex items-center gap-2"
                            >
                              {savingRemark ? (
                                "Saving..."
                              ) : (
                                <><CheckCircle className="w-4 h-4" /> Save Remarks</>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* INDIVIDUAL EVALUATION SAVE ACTION */}
                      {!isLocked && (
                        <div className="mt-6 pt-4 border-t flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground font-semibold flex items-center gap-2"
                            onClick={() => saveIndividualMarks(s)}
                            disabled={savingIndividual[key]}
                          >
                            <Save className="w-4 h-4" />
                            {savingIndividual[key] ? "Saving..." : `Save Marks for ${s.StudentName}`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}

              {/* SAVE BUTTON */}
              {students.length > 0 && (
                <div className="sticky bottom-6 mt-8">
                  <Button
                    size="lg"
                    className="w-full shadow-lg text-lg font-medium h-14"
                    onClick={saveMarks}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Submit Final Evaluation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}