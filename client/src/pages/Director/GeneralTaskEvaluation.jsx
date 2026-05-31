import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  ClipboardCheck,
  AlertCircle,
  MessageSquare,
  Save,
  Clock,
  MapPin,
  GraduationCap,
  Calendar,
  CheckCircle,
  PlayCircle,
  Info,
  ChevronRight,
  TrendingUp,
  Search,
  BookOpen,
  UserCheck,
  Calculator
} from "lucide-react";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import SupervisorLayout from "../supervisor/SupervisorLayout";
import CommitteeLayout from "../committee/CommitteeLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GeneralTaskEvaluation() {
  const [location, setLocation] = useLocation();
  const isSupervisorSide = location.startsWith("/supervisor");
  const isCommitteeHeadSide = location.startsWith("/committee-head");
  const isCommitteeSide = location.startsWith("/committee") && !isCommitteeHeadSide;

  // ================= AUTH & USER =================
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const userName = user?.name;

  // ================= STATE =================
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Tabs & Toggles
  const [activeMilestone, setActiveMilestone] = useState("MidTask"); // MidTask or Final Task
  const [activeFilter, setActiveFilter] = useState("unassigned"); // unassigned, assigned, evaluated
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluation States
  const [sessionCriteria, setSessionCriteria] = useState([]);
  const [activeParameter, setActiveParameter] = useState(null);
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState({});
  const [savingIndividual, setSavingIndividual] = useState({});
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(1);

  // Director Grading States
  const [calculatedScores, setCalculatedScores] = useState({});
  const [finalGrades, setFinalGrades] = useState({});
  const [includeSupervisorScore, setIncludeSupervisorScore] = useState(false);
  const [calculatingIndividual, setCalculatingIndividual] = useState({});
  const [savingGradeIndividual, setSavingGradeIndividual] = useState({});

  const [historyData, setHistoryData] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchSessionAndGroups();
  }, [activeMilestone, activeFilter]);

  const fetchSessionAndGroups = async () => {
    setLoading(true);
    try {
      // 1. Get current session ID
      const sessionRes = await axios.get(`${API_BASE}/users/CurrentSession`);
      const currentSessionId = sessionRes.data?.id || 1;
      setSessionId(currentSessionId);

      // 2. Fetch all criteria parameters for this milestone
      const criteriaRes = await axios.get(`${API_BASE}/fyp2-scores/available-criteria/${currentSessionId}`);
      const allParams = criteriaRes.data || [];
      setSessionCriteria(allParams);

      // Match the correct parameter based on milestone title
      const cleanMilestone = activeMilestone.toLowerCase().replace(" ", "").trim();
      const matchedParam = allParams.find(p => {
        const cleanName = p.name.toLowerCase().replace(" ", "").trim();
        return cleanName.includes(cleanMilestone) || cleanMilestone.includes(cleanName);
      });
      setActiveParameter(matchedParam || null);

      // 3. Fetch all approved groups
      const groupsRes = await axios.get(`${API_BASE}/committee-meetings/groups/approved/FYP-2`);
      const rawGroups = groupsRes.data || [];

      // If on Supervisor side, only show groups supervised by this supervisor
      const matchedGroups = isSupervisorSide
        ? rawGroups.filter(g => g.supervisor && g.supervisor.toLowerCase() === userName?.toLowerCase())
        : rawGroups;

      // 4. Enrich groups with active tasks & evaluation status
      const enrichedGroups = [];
      for (const g of matchedGroups) {
        try {
          const detailRes = await axios.get(`${API_BASE}/fyp2-scores/groups/${g.groupName}`);
          const groupDetail = detailRes.data || {};

          const isMid = activeMilestone === "MidTask";
          const taskDesc = isMid ? groupDetail.midTask : groupDetail.finalTask;
          const isAssigned = taskDesc && taskDesc.trim() !== "";

          let evaluationStatus = "unassigned"; // default
          let membersEvaluatedCount = 0;

          if (isAssigned) {
            // Fetch student evaluation marks for this group
            const marksRes = await axios.get(`${API_BASE}/fyp2-scores/getDataForUpdateMarks/${g.groupName}`).catch(() => null);
            const studentData = marksRes.data || [];

            if (matchedParam) {
              const savedMarksRes = await axios.get(
                `${API_BASE}/fyp2-scores/get-all-saved-marks/${matchedParam.id}`
              ).catch(() => ({ data: [] }));

              const savedList = savedMarksRes.data || [];
              const myRole = user?.role || "";

              studentData.forEach(s => {
                const hasMarks = savedList.some(item => {
                   if (item.studentEnrollID !== s.EnrollmentID) return false;
                   if (String(item.evaluatorID) === String(userId)) return true;
                   
                   if (myRole === "Director" || myRole === "CommitteeHead") {
                      return item.evaluatorRole === "Director" || item.evaluatorRole === "CommitteeHead";
                   } else {
                      return item.evaluatorRole !== "Director" && item.evaluatorRole !== "CommitteeHead";
                   }
                });
                if (hasMarks) membersEvaluatedCount++;
              });
            }

            if (studentData.length > 0 && membersEvaluatedCount === studentData.length) {
              evaluationStatus = "evaluated";
            } else {
              evaluationStatus = "assigned";
            }
          }

          enrichedGroups.push({
            ...g,
            projectTitle: groupDetail.projectName || g.projectTitle || "No Project Assigned",
            midTaskDescription: groupDetail.midTask || "",
            finalTaskDescription: groupDetail.finalTask || "",
            isAssigned,
            evaluationStatus,
            membersCount: g.members?.length || 0,
            membersEvaluatedCount
          });
        } catch (err) {
          console.error(`Error enriching group ${g.groupName}:`, err);
          enrichedGroups.push({
            ...g,
            isAssigned: false,
            evaluationStatus: "unassigned",
            membersCount: g.members?.length || 0
          });
        }
      }

      setGroups(enrichedGroups);
      applyFilters(enrichedGroups, searchQuery);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER LOGIC =================
  const applyFilters = (allGroups, query) => {
    let result = allGroups.filter(g => g.evaluationStatus === activeFilter);
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(g =>
        g.groupName.toString().includes(q) ||
        (g.projectTitle && g.projectTitle.toLowerCase().includes(q)) ||
        (g.supervisor && g.supervisor.toLowerCase().includes(q))
      );
    }
    setFilteredGroups(result);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    applyFilters(groups, val);
  };

  // ================= SELECT GROUP =================
  const handleSelectGroup = async (group) => {
    if (!activeParameter) {
      alert("No criteria mapped for this milestone in active session criteria.");
      return;
    }
    let targetRoute = "Director";
    if (isCommitteeSide) targetRoute = "committee";
    if (isSupervisorSide) targetRoute = "supervisor";
    
    setLocation(`/${targetRoute}/evaluation/0/${group.groupName}/${activeParameter.id}/FYP-2`);
  };

  const handleMarkChange = (studentId, subParamId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subParamId]: value
      }
    }));
  };

  const handleRemarkChange = (studentId, value) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  // ================= DIRECTOR GRADING HELPER METHODS =================
  const handleFinalGradeChange = (studentId, field, value) => {
    setFinalGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

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
      const res = await axios.get(`${API_BASE}/fyp2-scores/student-evaluation-history/${student.EnrollmentID}`);
      setHistoryData((prev) => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error("Error loading evaluation history:", err);
      alert("Failed to load evaluation history");
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [key]: false }));
    }
  };

  const calculateIndividualScore = async (student) => {
    try {
      setCalculatingIndividual((prev) => ({ ...prev, [student.studentID]: true }));
      const res = await axios.post(`${API_BASE}/fyp2-scores/calculate-final-fyp2?includeSupervisorScore=${includeSupervisorScore}`);
      const record = res.data.find((r) => r.EnrollmentID === student.EnrollmentID);
      if (record) {
        setCalculatedScores((prev) => ({
          ...prev,
          [student.studentID]: {
            score: record.FinalScore,
            grade: record.Grade
          }
        }));
        setFinalGrades((prev) => ({
          ...prev,
          [student.studentID]: {
            score: record.FinalScore,
            grade: record.Grade
          }
        }));
        alert(`Score calculated for ${student.name}: ${record.FinalScore} (Grade: ${record.Grade})`);
      } else {
        alert(`No score calculation data found for ${student.name}`);
      }
    } catch (err) {
      console.error("Calculation error:", err);
      alert("Failed to calculate score");
    } finally {
      setCalculatingIndividual((prev) => ({ ...prev, [student.studentID]: false }));
    }
  };

  const saveIndividualFinalGrade = async (student) => {
    const gradeVal = finalGrades[student.studentID]?.grade || calculatedScores[student.studentID]?.grade || null;
    const scoreVal = finalGrades[student.studentID]?.score || calculatedScores[student.studentID]?.score || null;

    const payload = [{
      EnrollmentID: student.EnrollmentID,
      FinalGrade: gradeVal,
      FinalScore: scoreVal,
      SessionID: sessionId,
      EvaluatorID: userId,
    }];

    try {
      setSavingGradeIndividual((prev) => ({ ...prev, [student.studentID]: true }));
      await axios.post(`${API_BASE}/fyp2-scores/save-final-grades`, payload);
      alert(`Final grade for ${student.name} saved successfully! ✅`);
    } catch (err) {
      console.error("Individual save grade error:", err);
      alert(`Failed to save grade for ${student.name}`);
    } finally {
      setSavingGradeIndividual((prev) => ({ ...prev, [student.studentID]: false }));
    }
  };

  // ================= SAVE INDIVIDUAL EVALUATION =================
  const handleSaveIndividual = async (member) => {
    if (!activeParameter) {
      alert("No criteria mapped for this milestone in active session criteria.");
      return;
    }

    let hasError = false;
    activeParameter.subParameters.forEach(sp => {
      const val = marks[member.studentID]?.[sp.id];
      const numericVal = val === "" || val === undefined ? 0 : Number(val);
      const maxMarks = Number(sp.percentage);
      if (numericVal < 0 || numericVal > maxMarks) {
        alert(
          `Error: Obtained marks for "${sp.name}" (${numericVal}) cannot exceed maximum marks (${maxMarks}) for ${member.name}!`
        );
        hasError = true;
      }
    });

    if (hasError) return;

    setSavingIndividual(prev => ({ ...prev, [member.studentID]: true }));

    try {
      const payload = [];
      activeParameter.subParameters.forEach(sp => {
        const val = marks[member.studentID]?.[sp.id];
        payload.push({
          EnrollmentID: member.EnrollmentID,
          ParameterID: activeParameter.id,
          SubParameterID: sp.id,
          EvaluatorID: userId,
          ObtainedMarks: val === "" || val === undefined ? 0 : Number(val),
          MaxMarks: Number(sp.percentage),
          SessionID: sessionId,
          taskID: activeMilestone === "MidTask" ? (member.MidTaskId || 0) : (member.FinalTaskId || 0)
        });
      });

      await axios.post(
        `${API_BASE}/fyp2-scores/update-evaluation-marks`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      // Remarks Submission
      if (remarks[member.studentID]?.trim()) {
        if (isSupervisorSide) {
          await axios.post(`${API_BASE}/supervisor/save-supervisor-remarks`, {
            MeetingID: 0, // General evaluation (not linked with meetings)
            GroupID: selectedGroup.groupName,
            StudentEnrollID: member.EnrollmentID,
            SupervisorID: userId,
            Remarks: remarks[member.studentID]
          });
        } else {
          await axios.post(`${API_BASE}/fyp2-scores/save-or-update`, {
            StudentEnrollID: member.EnrollmentID,
            MeetingID: 0,
            EvaluatorID: userId.toString(),
            SessionID: sessionId,
            Remarks: remarks[member.studentID]
          });
        }
      }

      alert(`Evaluation Saved Successfully for ${member.name}! ✅`);
      fetchSessionAndGroups();
    } catch (err) {
      console.error(`Failed to save evaluation marks for ${member.name}:`, err);
      alert(`Error saving marks for ${member.name}. Please try again.`);
    } finally {
      setSavingIndividual(prev => ({ ...prev, [member.studentID]: false }));
    }
  };

  const Layout = isSupervisorSide
    ? SupervisorLayout
    : (isCommitteeSide ? CommitteeLayout : CommitteeHeadLayout);

  return (
    <Layout>
      <AppBar title="General Task Evaluation Dashboard" showBack />

      <div className="p-6 space-y-6 bg-muted/20 min-h-screen">

        {/* ================= TOP TABS & SWITCHES ================= */}
        <div className="bg-card border rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Milestone Toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeMilestone === "MidTask" ? "default" : "outline"}
              onClick={() => {
                setActiveMilestone("MidTask");
                setSelectedGroup(null);
              }}
              className="rounded-full px-6"
            >
              MidTask Evaluation
            </Button>
            {/* Supervisor is restricted to MidTask only */}
            {!isSupervisorSide && (
              <Button
                variant={activeMilestone === "FinalTask" ? "default" : "outline"}
                onClick={() => {
                  setActiveMilestone("FinalTask");
                  setSelectedGroup(null);
                }}
                className="rounded-full px-6"
              >
                Final Task Evaluation
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Group ID or Project Name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full bg-muted/30 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setActiveFilter("unassigned");
              setSelectedGroup(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 border ${activeFilter === "unassigned"
              ? "bg-destructive/10 border-destructive/30 text-destructive shadow-sm"
              : "bg-card border-border/80 text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Unassigned Task
          </button>

          <button
            onClick={() => {
              setActiveFilter("assigned");
              setSelectedGroup(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 border ${activeFilter === "assigned"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 shadow-sm"
              : "bg-card border-border/80 text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <PlayCircle className="w-4 h-4" />
            Assigned Task
          </button>

          <button
            onClick={() => {
              setActiveFilter("evaluated");
              setSelectedGroup(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 border ${activeFilter === "evaluated"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 shadow-sm"
              : "bg-card border-border/80 text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            Evaluated Milestone
          </button>
        </div>

        {/* ================= LAYOUT SPLIT ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT SIDE: GROUPS LIST */}
          <div className="xl:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-24 bg-card rounded-2xl" />
                <div className="h-24 bg-card rounded-2xl" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center bg-card rounded-3xl border border-dashed p-6">
                <Users className="w-12 h-12 mb-3 text-muted-foreground/40" />
                <p className="font-bold text-foreground">No Groups Found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  There are no groups matching this milestone toggle selection.
                </p>
              </div>
            ) : (
              filteredGroups.map(g => (
                <div
                  key={g.groupName}
                  onClick={() => handleSelectGroup(g)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all shadow-sm relative overflow-hidden flex flex-col gap-2 ${selectedGroup?.groupName === g.groupName
                    ? "bg-primary/5 border-primary shadow-md"
                    : "bg-card border-border/80 hover:bg-muted/30"
                    }`}
                >
                  {selectedGroup?.groupName === g.groupName && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  )}

                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Group {g.groupName}</h4>
                      <p className="text-[10px] font-semibold text-muted-foreground line-clamp-1 mt-0.5">{g.projectTitle || "No Project Title"}</p>
                    </div>
                    <Badge
                      className={`text-[9px] font-extrabold px-2 py-0.5 border-none uppercase ${g.evaluationStatus === "evaluated"
                        ? "bg-emerald-500 text-white"
                        : g.evaluationStatus === "assigned"
                          ? "bg-amber-500 text-white"
                          : "bg-red-500 text-white"
                        }`}
                    >
                      {g.evaluationStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>{g.membersCount} Members</span>
                    </div>
                    {g.evaluationStatus === "assigned" && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {g.membersEvaluatedCount} / {g.membersCount} graded
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDE: DETAILED EVALUATION */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="p-8 rounded-3xl bg-card border shadow-xs space-y-6 text-left">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">FYP-2 Milestone Evaluation Panel</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Select any group from the list on the left to begin final grading.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Info Card 1 */}
                <div className="space-y-2.5 p-5 border border-dashed rounded-2xl bg-muted/10">
                  <div className="flex items-center gap-2 font-bold text-xs text-primary">
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Grading Flow</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Selecting a group will dynamically open the comprehensive **Director Final Grading Suite**. This unified workflow displays assigned project tasks, mid/final criteria weightages, historical evaluations, supervisor task logs, and lets you calculate final grades.
                  </p>
                </div>

                {/* Info Card 2 */}
                <div className="space-y-2.5 p-5 border border-dashed rounded-2xl bg-muted/10">
                  <div className="flex items-center gap-2 font-bold text-xs text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span>Milestone Weights</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    FYP-2 weights are mapped dynamically per session criteria parameters. By default, **MidTask carries 30%** weightage and **Final Task carries 70%** weightage, fully mapped into parameter rubrics.
                  </p>
                </div>
              </div>

              {/* Active Criteria Parameters Display */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Active Milestone Criteria Rubric
                </h4>
                {!activeParameter ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground bg-muted/20 rounded-2xl border">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50 text-destructive" />
                    <p className="text-xs font-semibold">No evaluation parameters set for {activeMilestone} in database.</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-extrabold text-sm text-foreground">{activeParameter.name} Milestone</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Weightage: <span className="font-bold text-primary">{activeParameter.percentage}%</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="bg-card text-[10px] font-bold px-2.5 py-1">
                        {activeParameter.subParameters?.length || 0} Sub-parameters Mapped
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {activeParameter.subParameters?.map(s => `${s.name} (${s.percentage}%)`).join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
