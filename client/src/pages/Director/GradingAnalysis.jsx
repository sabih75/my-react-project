"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import { AppBar } from "@/components/AppBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Award, 
  Search, 
  GraduationCap, 
  FileSpreadsheet, 
  FolderGit2, 
  TrendingUp 
} from "lucide-react";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function GradingAnalysis() {
  const [, setLocation] = useLocation();
  
  // State for loaded data
  const [sessionData, setSessionData] = useState([]);
  const [supervisorData, setSupervisorData] = useState([]);
  const [supervisorScore, setSupervisorScore] = useState([]);
  
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFyp, setActiveFyp] = useState("FYP-1");
  const gradeA="";
  // Search and Filter states
  const [activeTab, setActiveTab] = useState("session"); // "session" | "supervisor" | "group"
  const [selectedSessionId, setSelectedSessionId] = useState("all");
  const [sessionSearch, setSessionSearch] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorSort, setSupervisorSort] = useState("default"); // "default" | "aplus" | "total"
  const [groupSearch, setGroupSearch] = useState("");
  const [grade,setGrade]=useState("");
// const[showDetails,setShowDetails]=useState("");
  useEffect(() => {
    fetchAnalysisData();
  }, [activeFyp]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      
      const [sessionRes, supervisorRes, groupRes,supScore] = await Promise.all([
        axios.get(`${API}/grading-analysis/session-wise?fyp=${activeFyp}`),
        axios.get(`${API}/grading-analysis/supervisor-wise?fyp=${activeFyp}`),
        axios.get(`${API}/grading-analysis/group-wise`),
        axios.get(`${API}/grading-analysis/getSortedSUpervisorGrades/${activeFyp}`)
        
      ]);

      setSessionData(sessionRes.data || []);
      setSupervisorData(supervisorRes.data || []);
      setGroupData(groupRes.data || []);
      setSupervisorScore(supScore.data||[]);
    } catch (err) {
      console.error("Error fetching grading analysis:", err);
      alert("Failed to load grading analysis data!");
    } finally {
      setLoading(false);
    }
  };

  // Helper to color grade badges beautifully
  const getGradeBadgeClass = (grade) => {
    if (!grade) return "bg-gray-100 text-gray-500 border-gray-200";
    const g = grade.toUpperCase();
    if (g.startsWith("A")) return "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
    if (g.startsWith("B")) return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
    if (g.startsWith("C")) return "bg-amber-50 text-amber-700 border-amber-200 font-bold";
    if (g.startsWith("D")) return "bg-orange-50 text-orange-700 border-orange-200 font-bold";
    return "bg-rose-50 text-rose-700 border-rose-200 font-bold";
  };

  // 1. Filter sessions
  const filteredSessions = sessionData.filter((s) => {
    const matchesSearch = s.SessionName?.toLowerCase().includes(sessionSearch.toLowerCase());
    if (selectedSessionId === "all") return matchesSearch;
    return matchesSearch && s.SessionId.toString() === selectedSessionId.toString();
  });

  // 2. Filter supervisors
  const filteredSupervisors = supervisorData.filter((s) =>
    s.SupervisorName?.toLowerCase().includes(supervisorSearch.toLowerCase())
  );
  const filteredSupervisorScore = supervisorScore.filter((s) =>
    s.SupervisorName?.toLowerCase().includes(supervisorSearch.toLowerCase())
  );


  // Helper to resolve supervisor stats dynamically by selected session
  const getSupervisorStats = (sup) => {
    if (selectedSessionId === "all") {
      return {
        totalSupervised: sup.TotalSupervised,
        grades: sup.Grades
      };
    }
    const breakdown = sup.SessionBreakdowns?.find(
      (sb) => sb.SessionId.toString() === selectedSessionId.toString()
    );
    return {
      totalSupervised: breakdown ? breakdown.TotalSupervised : 0,
      grades: breakdown ? breakdown.Grades : {
        APlus: 0, A: 0, AMinus: 0, BPlus: 0, B: 0, BMinus: 0,
        CPlus: 0, C: 0, CMinus: 0, DPlus: 0, D: 0, F: 0, Ungraded: 0
      }
    };
  };

  const sortedSupervisors = [...filteredSupervisors].sort(() => {
   

    
      return supervisorScore;



  });

  // 3. Filter groups
  const filteredGroups = groupData.filter((g) => {
    const matchesSearch = 
      g.ProjectTitle?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.SupervisorName?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.Members?.some((m) => 
        m.StudentName?.toLowerCase().includes(groupSearch.toLowerCase()) ||
        m.RegNum?.toLowerCase().includes(groupSearch.toLowerCase())
      );
    
    if (selectedSessionId === "all") return matchesSearch;
    
    // Find the session name corresponding to selectedSessionId
    const selectedSessName = sessionData.find(s => s.SessionId.toString() === selectedSessionId.toString())?.SessionName;
    return matchesSearch && g.SessionName === selectedSessName;
  });
  const showDetails = (item,supervisorId) =>{
    alert(item.grade);
    if (item.grade == "A+"){
setLocation(`/director/gradeDetails/${supervisorId}/A1`)

    }
    if (item.grade == "A"){
setLocation(`/director/gradeDetails/${supervisorId}/A2`)

    }
    if (item.grade == "A-"){
setLocation(`/director/gradeDetails/${supervisorId}/A3`)

    }
    if (item.grade == "B+"){
setLocation(`/director/gradeDetails/${supervisorId}/A4`)

    }
    if (item.grade == "B"){
setLocation(`/director/gradeDetails/${supervisorId}/A5`)

    }
    if (item.grade == "B-"){
setLocation(`/director/gradeDetails/${supervisorId}/A6`)

    }
    if (item.grade == "C"){
setLocation(`/director/gradeDetails/${supervisorId}/A7`)

    }
    if (item.grade == "D"){
setLocation(`/director/gradeDetails/${supervisorId}/A8`)

    }
  
    if (item.grade == "F"){
setLocation(`/director/gradeDetails/${supervisorId}/A9`)

    }
   




  }

  return (
    <CommitteeHeadLayout>
      <AppBar title="Grading Analysis Dashboard">
        <button onClick={() => setLocation("/director/dashboard")} className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-all">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </AppBar>

      <div className="min-h-screen bg-muted/20 p-6 space-y-6">
        
        {/* FYP Level Switcher */}
        {/* <div className="flex bg-card p-1 border rounded-xl shadow-sm w-fit">
          <button
            onClick={() => setActiveFyp("FYP-1")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              activeFyp === "FYP-1"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground bg-transparent"
            }`}
          >
            FYP-1 Grades
          </button>
          <button
            onClick={() => setActiveFyp("FYP-2")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              activeFyp === "FYP-2"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground bg-transparent"
            }`}
          >
            FYP-2 Grades
          </button>
        </div> */}

        {/* ================= HEADER SUMMARY CARDS ================= */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4 border-emerald-100 bg-gradient-to-br from-emerald-50/20 to-emerald-50/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Evaluated</p>
              <h3 className="text-2xl font-bold tracking-tight">
                {sessionData.reduce((acc, curr) => acc + curr.TotalStudents, 0)} Students
              </h3>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 border-blue-100 bg-gradient-to-br from-blue-50/20 to-blue-50/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Supervisors</p>
              <h3 className="text-2xl font-bold tracking-tight">{supervisorData.length} Faculty</h3>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 border-purple-100 bg-gradient-to-br from-purple-50/20 to-purple-50/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Project Groups</p>
              <h3 className="text-2xl font-bold tracking-tight">{groupData.length} Groups</h3>
            </div>
          </Card>
        </div> */}

        ================= DYNAMIC FILTER CONTROLS =================
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border p-4 rounded-xl shadow-sm">
          {/* <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Academic Session Filter:
            </span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-background border border-border/80 rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-[180px] cursor-pointer"
            >
              <option value="all">🌐 All Sessions</option>
              {sessionData.map((session) => (
                <option key={session.SessionId} value={session.SessionId.toString()}>
                  📅 {session.SessionName}
                </option>
              ))}
            </select>
          </div> */}
          
          {/* SEARCH & SORT FOR ACTIVE TAB */}
          {/* <div className="w-full md:w-auto">
            {activeTab === "session" && (
              <div className="flex items-center bg-background border rounded-lg px-3 py-2 shadow-sm w-full md:w-80">
                <Search className="w-4 h-4 text-muted-foreground mr-2.5" />
                <input
                  type="text"
                  placeholder="Search session by name..."
                  className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-muted-foreground"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>
            )}
            
            {activeTab === "supervisor" && (
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-[480px]">
                <div className="flex items-center bg-background border rounded-lg px-3 py-2 shadow-sm flex-1">
                  <Search className="w-4 h-4 text-muted-foreground mr-2.5" />
                  <input
                    type="text"
                    placeholder="Search supervisor..."
                    className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-muted-foreground animate-fade-in"
                    value={supervisorSearch}
                    onChange={(e) => setSupervisorSearch(e.target.value)}
                  />
                </div>
                <select
                  value={supervisorSort}
                  onChange={(e) => setSupervisorSort(e.target.value)}
                  className="bg-background border border-border/80 rounded-lg px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer min-w-[180px]"
                >
                  <option value="default">🔤 Sort Alphabetical</option>
                  <option value="aplus">🔥 Most A+ Grades</option>
                  <option value="total">👥 Total Supervised</option>
                  <option value="averageScore">👥 Sort By Score</option>
                  
                </select>
              </div>
            )}
            
            {activeTab === "group" && (
              <div className="flex items-center bg-background border rounded-lg px-3 py-2 shadow-sm w-full md:w-80">
                <Search className="w-4 h-4 text-muted-foreground mr-2.5" />
                <input
                  type="text"
                  placeholder="Search project, student, reg num..."
                  className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-muted-foreground"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                />
              </div>
            )}
          </div> */}
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="flex border-b border-border gap-2">
          {/* <Button
            variant={activeTab === "session" ? "default" : "ghost"}
            className={`rounded-none border-b-2 px-6 h-12 font-semibold transition-all ${
              activeTab === "session" 
                ? "border-primary font-bold animate-fade-in" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("session")}
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Session Distribution
          </Button> */}
          <Button
            variant={activeTab === "supervisor" ? "default" : "ghost"}
            className={`rounded-none border-b-2 px-6 h-12 font-semibold transition-all ${
              activeTab === "supervisor" 
                ? "border-primary font-bold animate-fade-in" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("supervisor")}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Supervisor Performance
          </Button>
          {/* <Button
            variant={activeTab === "group" ? "default" : "ghost"}
            className={`rounded-none border-b-2 px-6 h-12 font-semibold transition-all ${
              activeTab === "group" 
                ? "border-primary font-bold animate-fade-in" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("group")}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Group Deep Flow
          </Button> */}
        </div>

        {/* ================= TAB CONTENT ================= */}
        {loading ? (
          <div className="py-20 text-center font-medium text-muted-foreground">
            Analyzing database statistics & rendering grade flows... Please wait.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* TABS 1: SESSION-WISE ANALYSIS */}
            {/* {activeTab === "session" && (
              <div className="grid grid-cols-1 gap-6">
                {filteredSessions.map((session) => (
                  <Card key={session.SessionId} className="p-6 border border-border/60 hover:shadow-md transition-shadow animate-fade-in">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{session.SessionName}</h4>
                        <p className="text-sm text-muted-foreground">Total Enrolled: {session.TotalStudents} students</p>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary text-xs font-semibold px-3 py-1">
                        Session Stats
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4">
                      {[
                        { grade: "A+", count: session.Grades.APlus },
                        { grade: "A", count: session.Grades.A },
                        { grade: "A-", count: session.Grades.AMinus },
                        { grade: "B+", count: session.Grades.BPlus },
                        { grade: "B", count: session.Grades.B },
                        { grade: "B-", count: session.Grades.BMinus },
                        { grade: "C", count: session.Grades.C },
                        { grade: "D", count: session.Grades.D },
                        { grade: "F", count: session.Grades.F },
                      ].map((item) => (
                        <div key={item.grade} className="border rounded-xl p-3 text-center bg-card hover:bg-muted/10 transition-colors">
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 border rounded-full ${getGradeBadgeClass(item.grade)}`}>
                            {item.grade}
                          </span>
                          <h5 className="text-xl font-bold mt-2 text-foreground">{item.count}</h5>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                {filteredSessions.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground font-medium border rounded-xl bg-card">
                    No sessions found matching search criteria.
                  </div>
                )}
              </div>
            )} */}

            {/* TAB 2: SUPERVISOR-WISE PERFORMANCE */}
            {activeTab === "supervisor" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedSupervisors.map((sup) => {
                    const stats = getSupervisorStats(sup);
                    return (
                      <Card key={sup.SupervisorId} className="p-6 border border-border/60 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-base text-foreground">{sup.SupervisorName}</h4>
                              <p className="text-xs text-muted-foreground">ID: {sup.SupervisorId}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-semibold px-2.5 py-0.5">
                              {stats.totalSupervised} Students {selectedSessionId !== "all" ? "in Selected Session" : "Supervised"}
                            </Badge>
                          </div>

                          {/* GRADE SUMMARY PILLS */}
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {[
                              { grade: "A+", count: stats.grades.APlus },
                              { grade: "A", count: stats.grades.A },
                              { grade: "A-", count: stats.grades.AMinus },
                              { grade: "B+", count: stats.grades.BPlus },
                              { grade: "B", count: stats.grades.B },
                              { grade: "B-", count: stats.grades.BMinus },
                              { grade: "C", count: stats.grades.C },
                              { grade: "D", count: stats.grades.D },
                              { grade: "F", count: stats.grades.F },
                            ].map((item) => {
                              return (
                                <div onClick={()=>showDetails(item,sup.SupervisorId) } key={item.grade} className={`flex items-center gap-1 border px-2 py-0.5 rounded-lg bg-card text-xs font-semibold shadow-sm ${item.grade === "A+" ? "border-amber-300 bg-amber-50/20" : ""}`}>
                                  <span className={`px-1.5 py-0.2 border rounded-full text-[10px] ${getGradeBadgeClass(item.grade)}`}>
                                    {item.grade}
                                  </span>
                                  <span className={item.grade === "A+" ? "text-amber-800 font-bold" : "text-muted-foreground"}>{item.count}</span>
                                </div>
                              );
                            })}
                            {Object.values(stats.grades).every(count => count === 0) && (
                              <p className="text-xs text-muted-foreground italic">No grade evaluations logged for this supervisor in selected session.</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  {sortedSupervisors.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground font-medium">
                      No supervisors found matching "{supervisorSearch}".
                    </div>
                  )}
                </div>
              </div>
            )}

          
            {/*  */}

          </div>
        )}

      </div>
    </CommitteeHeadLayout>
  );
}
