import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Users,
  FileCheck,
  Search,
  BookOpen,
  UserCircle,
  CheckCircle2,
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  Bookmark,
  CheckCircle,
  UserCheck,
  Pencil,
  X
} from "lucide-react";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function ProjectAllocation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State Management
  const [selectedFyp, setSelectedFyp] = useState("FYP-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [projects, setProjects] = useState([]);

  // Loading & Action states
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submittingAllocation, setSubmittingAllocation] = useState(null);

  // Excel states
  const [excelFile, setExcelFile] = useState(null);
  const [parsedProjects, setParsedProjects] = useState([]);
  const [importingExcel, setImportingExcel] = useState(false);

  // Search & Allocation dropdown selections
  const [allocations, setAllocations] = useState({}); // groupId -> projectId
  const [supervisors, setSupervisors] = useState([]);
  const [submittingSupervisor, setSubmittingSupervisor] = useState({}); // groupId -> boolean
  const [selectedSupervisors, setSelectedSupervisors] = useState({}); // groupId -> supervisorId
  const [editingGroups, setEditingGroups] = useState({}); // groupId -> boolean
  const [editingSupervisors, setEditingSupervisors] = useState({}); // groupId -> boolean

  useEffect(() => {
    fetchGroups();
    fetchProjects();
    fetchSupervisors();
  }, [selectedFyp]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await axios.get(
        `${API_BASE}/committee-meetings/groups/approved/${selectedFyp}`
      );
      setGroups(res.data || []);

      // Initialize allocations map from current group projects
      const initialAllocations = {};
      (res.data || []).forEach(g => {
        if (g.projectTitle) {
          // If already assigned, we could find the project matching this title
          initialAllocations[g.groupName] = "";
        }
      });
      setAllocations(prev => ({ ...prev, ...initialAllocations }));
    } catch (err) {
      console.error("Failed to load groups:", err);
      toast({
        title: "Error",
        description: "Failed to load approved groups.",
        variant: "destructive"
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await axios.get(
        `${API_BASE}/committee-meetings/getAllOfferedProjects`
      );
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/committee-meetings/getAllSupervisors`);
      setSupervisors(res.data || []);
    } catch (err) {
      console.error("Failed to load supervisors:", err);
    }
  };

  // --- EXCEL PARSING & UPLOAD LOGIC ---
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Validate structure
        const validated = json.map((row, idx) => {
          return {
            id: idx + 1,
            Title: row.Title || row.title || row["Project Title"] || "",
            Objectives: row.Objectives || row.objectives || row["Objectives & Description"] || ""
          };
        }).filter(item => item.Title.trim() !== "");

        if (validated.length === 0) {
          toast({
            title: "Empty or Invalid Excel",
            description: "Could not find any rows containing a 'Title' column.",
            variant: "destructive"
          });
          return;
        }

        setParsedProjects(validated);
        toast({
          title: "Excel Parsed",
          description: `Found ${validated.length} project ideas in the spreadsheet.`,
        });
      } catch (err) {
        console.error("Failed to parse Excel:", err);
        toast({
          title: "Parsing Error",
          description: "An error occurred while reading the Excel spreadsheet.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadProjects = async () => {
    if (parsedProjects.length === 0) return;

    setImportingExcel(true);
    try {
      const user1 = localStorage.getItem("user");
      let suggestedByUserId = "";
      if (user1) {
        const userJ = JSON.parse(user1);
        suggestedByUserId = userJ.id;
      }

      const payload = parsedProjects.map(p => ({
        Title: p.Title,
        Objectives: p.Objectives,
        SuggestedBy: suggestedByUserId
      }));

      const res = await axios.post(`${API_BASE}/committee-meetings/bulk-upload-projects`, payload);

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Import Successful!",
          description: `All ${parsedProjects.length} projects are now active and offered.`,
        });
        setParsedProjects([]);
        setExcelFile(null);
        // Refresh project list
        fetchProjects();
      }
    } catch (err) {
      console.error("Bulk upload failed:", err);
      toast({
        title: "Upload Failed",
        description: "An error occurred while importing offered projects to database.",
        variant: "destructive"
      });
    } finally {
      setImportingExcel(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      { Title: "Autonomous Drone Navigator", Objectives: "Design and implement a computer vision based autonomous flight controller for indoor mapping." },
      { Title: "AI Lecture Summarizer Platform", Objectives: "Create a SaaS tool that transcribes, indexes, and summarizes university lectures in real-time." },
      { Title: "Smart Grid Power Load Forecaster", Objectives: "Develop a neural network model to predict regional electrical grid consumption demands." }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    XLSX.writeFile(workbook, "offered_projects_sample_template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Use this template to format your project upload spreadsheet."
    });
  };

  // --- PROJECT ALLOCATION ACTION ---
  const handleAssignProject = async (groupId) => {
    const selectedProjectId = allocations[groupId];
    if (!selectedProjectId) {
      toast({
        title: "No Project Selected",
        description: "Please choose a project from the offered list to allocate.",
        variant: "destructive"
      });
      return;
    }

    const selectedProjObj = projects.find(p => (p.ProjectId ?? p.projectId) === parseInt(selectedProjectId));
    const recommendedSupervisorId = selectedProjObj ? (selectedProjObj.SuggestedBy ?? selectedProjObj.suggestedBy) : null;
    const recommendedSupervisorName = selectedProjObj ? (selectedProjObj.SuggestedByName ?? selectedProjObj.suggestedByName) : null;

    setSubmittingAllocation(groupId);
    try {
      const res = await axios.put(`${API_BASE}/committee-meetings/allocateProject`, {
        groupId: parseInt(groupId),
        projectId: parseInt(selectedProjectId)
      });

      if (res.status === 200) {
        // Auto-allocate recommended supervisor if one exists
        if (recommendedSupervisorId && recommendedSupervisorId !== "Director" && recommendedSupervisorId !== "director") {
          try {
            await axios.put(`${API_BASE}/committee-meetings/allocateSupervisor`, {
              groupId: parseInt(groupId),
              supervisorId: recommendedSupervisorId
            });
            toast({
              title: "Project & Supervisor Allocated",
              description: `Group ${groupId} has been allocated to project "${selectedProjObj.Title ?? selectedProjObj.title}" and auto-assigned to supervisor ${recommendedSupervisorName}!`,
            });
          } catch (supErr) {
            console.error("Auto supervisor allocation failed:", supErr);
            toast({
              title: "Project Allocated, Supervisor Failed",
              description: `Project allocated, but supervisor auto-allocation failed.`,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Project Allocated",
            description: `Group ${groupId} has been allocated successfully!`,
          });
        }
        // Refresh groups
        setEditingGroups(prev => ({ ...prev, [groupId]: false }));
        fetchGroups();
      }
    } catch (err) {
      console.error("Failed to allocate project:", err);
      toast({
        title: "Allocation Failed",
        description: "Could not persist allocation assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingAllocation(null);
    }
  };

  const handleAllocateSupervisor = async (groupId, supervisorId) => {
    if (!supervisorId) {
      toast({
        title: "No Supervisor Selected",
        description: "Please select a supervisor first.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingSupervisor(prev => ({ ...prev, [groupId]: true }));
    try {
      const res = await axios.put(`${API_BASE}/committee-meetings/allocateSupervisor`, {
        groupId: parseInt(groupId),
        supervisorId: supervisorId
      });

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Supervisor Allocated",
          description: "Supervisor has been allocated successfully!",
        });
        setEditingSupervisors(prev => ({ ...prev, [groupId]: false }));
        fetchGroups();
      }
    } catch (err) {
      console.error("Failed to allocate supervisor:", err);
      toast({
        title: "Allocation Failed",
        description: "Could not allocate supervisor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingSupervisor(prev => ({ ...prev, [groupId]: false }));
    }
  };

  // Filtering Logic
  const filteredGroups = groups.filter((g) => {
    const title = g.projectTitle || "";
    const groupName = String(g.groupName || "");
    const supervisor = g.supervisor || "";
    const query = searchQuery.toLowerCase();

    return (
      title.toLowerCase().includes(query) ||
      groupName.toLowerCase().includes(query) ||
      supervisor.toLowerCase().includes(query)
    );
  });

  return (
    <CommitteeHeadLayout>
      <div className="bg-muted/30 min-h-screen pb-12">
        <AppBar title="Project Allocation" showBack />

        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">

          {/* ================= HEADER & PHASE TOGGLE ================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-3xl p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Project Allocations</h1>
              <p className="text-muted-foreground text-sm font-semibold mt-1">
                Allocate projects to approved student groups and manage offered project pools.
              </p>
            </div>

            {/* FYP Phase Pill Selector */}
            <div className="flex bg-muted rounded-xl p-1.5 w-fit border shrink-0">
              {(["FYP-1", "FYP-2"]).map((fyp) => (
                <button
                  key={fyp}
                  onClick={() => setSelectedFyp(fyp)}
                  className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${selectedFyp === fyp
                    ? "bg-background text-primary shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {fyp}
                </button>
              ))}
            </div>
          </div>

          {/* ================= EXCEL SPREADSHEET IMPORT SECTION ================= */}
          <div className="bg-card border border-primary/10 rounded-3xl p-6 shadow-sm space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Import Offered Projects</h3>
                  <p className="text-xs font-semibold text-muted-foreground">Bulk upload prospective thesis titles from an Excel spreadsheet.</p>
                </div>
              </div>

              <Button
                onClick={downloadSampleTemplate}
                variant="outline"
                size="sm"
                className="font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
              >
                Download Sample Excel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Upload area */}
              <div className="md:col-span-1 border-2 border-dashed border-muted rounded-2xl p-6 text-center hover:bg-muted/10 transition-colors flex flex-col justify-center items-center gap-4 relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {excelFile ? excelFile.name : "Select Spreadsheet"}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>
              </div>

              {/* Parsed list preview area */}
              <div className="md:col-span-2 bg-muted/20 border rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                {parsedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-bold text-muted-foreground">No spreadsheet loaded yet.</p>
                    <p className="text-xs font-medium text-muted-foreground/80 mt-0.5">Upload a file on the left to see the project preview list.</p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Spreadsheet Preview</span>
                        <span className="text-xs font-extrabold text-foreground px-2 py-0.5 bg-background border rounded-lg">
                          {parsedProjects.length} ideas parsed
                        </span>
                      </div>

                      <div className="max-h-[150px] overflow-y-auto border rounded-xl bg-background divide-y divide-border/40">
                        {parsedProjects.map((p) => (
                          <div key={p.id} className="p-3 text-xs flex justify-between gap-4">
                            <div className="space-y-1">
                              <span className="font-extrabold text-foreground">{p.Title}</span>
                              <p className="text-muted-foreground font-medium line-clamp-1">{p.Objectives}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        onClick={() => { setParsedProjects([]); setExcelFile(null); }}
                        variant="ghost"
                        size="sm"
                        className="font-bold text-xs rounded-xl"
                      >
                        Reset File
                      </Button>
                      <Button
                        onClick={handleUploadProjects}
                        size="sm"
                        className="font-bold text-xs rounded-xl flex items-center gap-1.5"
                        disabled={importingExcel}
                      >
                        {importingExcel ? "Importing..." : `Offer ${parsedProjects.length} Projects`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ================= GROUPS MANAGEMENT & ASSIGNMENT LIST ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Search sidebar filters */}
            <div className="md:col-span-1 space-y-6">

              <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Search Filters</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by group ID or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Metrics card */}
              <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Session Statistics</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl">
                    <span className="text-xs font-semibold">Total Approved Groups</span>
                    <span className="font-bold text-sm text-primary">{groups.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl">
                    <span className="text-xs font-semibold">Offered Projects Bank</span>
                    <span className="font-bold text-sm text-amber-600">{projects.length}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Main Interactive Groups Allocation list */}
            <div className="md:col-span-3">

              {loadingGroups ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-44 bg-card animate-pulse border rounded-3xl" />
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-20 bg-card border rounded-3xl border-dashed">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-extrabold text-lg text-foreground">No Approved Groups Found</h3>
                  <p className="text-muted-foreground text-sm font-semibold mt-1">Try adjusting your filters or verify group statuses.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGroups.map((group) => {
                    const isAllocated = !!group.projectTitle;

                    return (
                      <div
                        key={group.groupName}
                        className="bg-card border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-colors space-y-6"
                      >
                        {/* Header details */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-muted/50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {group.groupName}
                              </span>
                              <h4 className="text-base font-extrabold text-foreground">Group {group.groupName}</h4>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1.5">
                              Supervisor: <span className="text-foreground font-bold">{group.supervisor || "Not Assigned"}</span>
                              {group.supervisor && group.supervisor !== "Not Assigned" && (
                                <button
                                  onClick={() => {
                                    setEditingSupervisors(prev => ({ ...prev, [group.groupName]: !prev[group.groupName] }));
                                  }}
                                  className="text-[10px] text-primary hover:text-primary/80 font-extrabold hover:underline ml-1 flex items-center gap-0.5"
                                >
                                  <Pencil className="w-2.5 h-2.5" /> Edit
                                </button>
                              )}
                            </p>
                          </div>

                          {/* Allocation Status Badge */}
                          {isAllocated ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/75 text-emerald-800 text-xs font-extrabold shadow-sm border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Allocated
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/75 text-amber-800 text-xs font-extrabold shadow-sm border border-amber-200">
                              Pending Allocation
                            </div>
                          )}
                        </div>

                        {/* Members and Current Project details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Left member detail list */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Team Members</span>
                            <div className="space-y-1.5">
                              {(group.members || []).map((memberName, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl bg-muted/30">
                                  <UserCircle className="w-4 h-4 text-primary shrink-0" />
                                  <span className="font-bold text-foreground">{memberName}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right interactive allocation control */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                {isAllocated && !editingGroups[group.groupName] ? "Assigned Project Idea" : "Project Allocation Control"}
                              </span>
                              {isAllocated && (
                                <button
                                  onClick={() => {
                                    if (editingGroups[group.groupName]) {
                                      setEditingGroups(prev => ({ ...prev, [group.groupName]: false }));
                                    } else {
                                      const currentProj = projects.find(p => (p.Title ?? p.title) === group.projectTitle);
                                      const currentProjId = currentProj ? (currentProj.ProjectId ?? currentProj.projectId) : "";
                                      setAllocations(prev => ({ ...prev, [group.groupName]: String(currentProjId) }));
                                      setEditingGroups(prev => ({ ...prev, [group.groupName]: true }));
                                    }
                                  }}
                                  className="text-[10px] text-primary hover:text-primary/80 font-extrabold flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-md transition-colors"
                                >
                                  {editingGroups[group.groupName] ? (
                                    <>
                                      <X className="w-3 h-3" /> Cancel
                                    </>
                                  ) : (
                                    <>
                                      <Pencil className="w-3 h-3" /> Edit/Change
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {isAllocated && !editingGroups[group.groupName] ? (
                              <div className="p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100 flex gap-3">
                                <Bookmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-extrabold text-emerald-950">{group.projectTitle}</p>
                                  <p className="text-[11px] font-medium text-emerald-700/80 mt-1">This group is actively locked into the project above.</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <select
                                  value={allocations[group.groupName] || ""}
                                  onChange={(e) => setAllocations({ ...allocations, [group.groupName]: e.target.value })}
                                  className="w-full h-11 border rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-muted/20 font-bold text-xs text-foreground cursor-pointer transition-all"
                                >
                                  <option value="">-- Select an Offered Project --</option>
                                  {projects.map((proj) => {
                                    const projId = proj.ProjectId ?? proj.projectId;
                                    const projTitle = proj.Title ?? proj.title;
                                    const projSuggestedByName = proj.SuggestedByName ?? proj.suggestedByName;
                                    return (
                                      <option key={projId} value={projId}>
                                        {projTitle} {projSuggestedByName && projSuggestedByName !== "Director" && projSuggestedByName !== "director" ? `(Suggested by: ${projSuggestedByName})` : ""}
                                      </option>
                                    );
                                  })}
                                </select>

                                <Button
                                  onClick={() => handleAssignProject(group.groupName)}
                                  disabled={!allocations[group.groupName] || submittingAllocation === group.groupName}
                                  className="w-full h-11 shadow-sm rounded-xl font-bold bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5"
                                >
                                  <FileCheck className="w-4 h-4" />
                                  {submittingAllocation === group.groupName ? "Allocating..." : (editingGroups[group.groupName] ? "Update Project Idea" : "Allocate Selected Project")}
                                </Button>
                              </div>
                            )}

                            {/* Supervisor Allocation Control */}
                            {((!group.supervisor || group.supervisor === "Not Assigned") || editingSupervisors[group.groupName]) && (
                              <div className="pt-4 border-t border-muted/50 space-y-3 mt-4">
                                <div className="flex justify-between items-center gap-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                    Supervisor Allocation
                                  </span>
                                  {editingSupervisors[group.groupName] && (
                                    <button
                                      onClick={() => setEditingSupervisors(prev => ({ ...prev, [group.groupName]: false }))}
                                      className="text-[10px] text-muted-foreground hover:text-foreground font-extrabold flex items-center gap-0.5 bg-muted/30 px-2 py-0.5 rounded-md"
                                    >
                                      <X className="w-3 h-3" /> Cancel
                                    </button>
                                  )}
                                </div>

                                {/* Recommended Supervisor Box */}
                                {(() => {
                                  // Look up the active project (either selected in dropdown, or already allocated)
                                  const activeProjId = allocations[group.groupName];
                                  let activeProjObj = projects.find(p => (p.ProjectId ?? p.projectId) === parseInt(activeProjId));

                                  // Fallback to currently allocated project if it exists
                                  if (!activeProjObj && group.projectTitle) {
                                    activeProjObj = projects.find(p => (p.Title ?? p.title) === group.projectTitle);
                                  }

                                  if (activeProjObj) {
                                    const suggByName = activeProjObj.SuggestedByName ?? activeProjObj.suggestedByName;
                                    const suggBy = activeProjObj.SuggestedBy ?? activeProjObj.suggestedBy;

                                    if (suggByName && suggByName !== "Director" && suggByName !== "director") {
                                      return (
                                        <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/50 space-y-2">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>Recommended:</span>
                                            <span className="bg-amber-100/80 px-2 py-0.5 rounded-md text-amber-950 font-extrabold text-[10px]">
                                              {suggByName}
                                            </span>
                                          </div>
                                          <p className="text-[10px] font-semibold text-amber-800/85 leading-relaxed">
                                            This project was suggested by supervisor {suggByName}.
                                          </p>
                                          <Button
                                            onClick={() => handleAllocateSupervisor(group.groupName, suggBy)}
                                            size="sm"
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] h-8 rounded-lg flex items-center justify-center gap-1 shadow-sm"
                                            disabled={submittingSupervisor[group.groupName]}
                                          >
                                            <UserCheck className="w-3.5 h-3.5" />
                                            {submittingSupervisor[group.groupName] ? "Allocating..." : `Allocate Recommended Supervisor`}
                                          </Button>
                                        </div>
                                      );
                                    }
                                  }
                                  return null;
                                })()}

                                {/* Custom Supervisor Selector */}
                                <div className="flex gap-2">
                                  <select
                                    value={selectedSupervisors[group.groupName] || ""}
                                    onChange={(e) => setSelectedSupervisors({ ...selectedSupervisors, [group.groupName]: e.target.value })}
                                    className="flex-1 h-10 border rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-muted/20 font-bold text-xs text-foreground cursor-pointer transition-all"
                                  >
                                    <option value="">-- Select a Supervisor --</option>
                                    {supervisors.map((sup) => (
                                      <option key={sup.id} value={sup.id}>
                                        {sup.name}
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    onClick={() => handleAllocateSupervisor(group.groupName, selectedSupervisors[group.groupName])}
                                    disabled={!selectedSupervisors[group.groupName] || submittingSupervisor[group.groupName]}
                                    className="h-10 px-4 rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-1.5 shadow-sm shrink-0"
                                    size="sm"
                                  >
                                    <UserCheck className="w-4 h-4" /> Allocate
                                  </Button>
                                </div>
                              </div>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </CommitteeHeadLayout>
  );
}
