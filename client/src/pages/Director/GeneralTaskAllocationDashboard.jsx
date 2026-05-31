import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  PlusCircle,
  FileText
} from "lucide-react";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GeneralTaskAllocationDashboard() {
  const [, setLocation] = useLocation();

  // ================= STATE =================
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Toggles & Search
  const [activeMilestone, setActiveMilestone] = useState("MidTask"); // MidTask or Final Task
  const [activeFilter, setActiveFilter] = useState("unassigned"); // unassigned, assigned
  const [searchQuery, setSearchQuery] = useState("");

  // Input states
  const [taskDescription, setTaskDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchGroups();
  }, [activeMilestone, activeFilter]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // 1. Fetch approved groups list
      const groupsRes = await axios.get(`${API_BASE}/committee-meetings/groups/approved/FYP-2`);
      const rawGroups = groupsRes.data || [];

      // 2. Fetch task allocation details for each group
      const enrichedGroups = [];
      for (const g of rawGroups) {
        try {
          const detailRes = await axios.get(`${API_BASE}/fyp2-scores/groups/${g.groupName}`);
          const groupDetail = detailRes.data || {};
          
          const isMid = activeMilestone === "MidTask";
          const desc = isMid ? groupDetail.midTask : groupDetail.finalTask;
          const isAssigned = desc && desc.trim() !== "";

          enrichedGroups.push({
            ...g,
            projectTitle: groupDetail.projectName || g.projectTitle || "No Project Assigned",
            taskDesc: desc || "",
            isAssigned,
            evaluationStatus: isAssigned ? "assigned" : "unassigned",
            membersCount: g.members?.length || 0
          });
        } catch (err) {
          console.error(`Error enriching group ${g.groupName}:`, err);
          enrichedGroups.push({
            ...g,
            projectTitle: g.projectTitle || "No Project Assigned",
            taskDesc: "",
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
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setTaskDescription(group.taskDesc || "");
  };

  // ================= ALLOCATE/ASSIGN TASK =================
  const handleAssignTask = async () => {
    if (!selectedGroup) return;
    if (!taskDescription.trim()) {
      alert("Please enter a task description before assigning!");
      return;
    }

    setSaving(true);
    try {
      const milestoneTitle = activeMilestone === "MidTask" ? "MidTask" : "Final Task";
      
      await axios.post(`${API_BASE}/fyp2-scores/assign-task`, {
        groupId: selectedGroup.groupName,
        taskDescription: taskDescription,
        taskTitle: milestoneTitle
      });

      alert(`✅ ${milestoneTitle} Assigned Successfully to Group ${selectedGroup.groupName}!`);
      
      // Refresh groups list and maintain selection
      const prevGroupName = selectedGroup.groupName;
      await fetchGroups();
      
      // Re-select same group with updated data
      const updated = enrichedGroups => enrichedGroups.find(g => g.groupName === prevGroupName);
      setSelectedGroup(prev => updated ? updated : null);
    } catch (err) {
      console.error("Failed to save task assignment:", err);
      alert("❌ Failed to save task assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommitteeHeadLayout>
      <AppBar title="General Task Allocation Dashboard" showBack />

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
                setTaskDescription("");
              }}
              className="rounded-full px-6"
            >
              MidTask Allocation
            </Button>
            <Button
              variant={activeMilestone === "FinalTask" ? "default" : "outline"}
              onClick={() => {
                setActiveMilestone("FinalTask");
                setSelectedGroup(null);
                setTaskDescription("");
              }}
              className="rounded-full px-6"
            >
              Final Task Allocation
            </Button>
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
              setTaskDescription("");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 border ${
              activeFilter === "unassigned"
                ? "bg-destructive/10 border-destructive/30 text-destructive shadow-sm"
                : "bg-card border-border/80 text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Unassigned Groups
          </button>
          
          <button
            onClick={() => {
              setActiveFilter("assigned");
              setSelectedGroup(null);
              setTaskDescription("");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 border ${
              activeFilter === "assigned"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 shadow-sm"
                : "bg-card border-border/80 text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Assigned Groups
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
                  There are no groups in this category for {activeMilestone}.
                </p>
              </div>
            ) : (
              filteredGroups.map(g => (
                <div
                  key={g.groupName}
                  onClick={() => handleSelectGroup(g)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all shadow-sm relative overflow-hidden flex flex-col gap-2 ${
                    selectedGroup?.groupName === g.groupName
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
                      <p className="text-[10px] font-semibold text-muted-foreground line-clamp-1 mt-0.5">{g.projectTitle}</p>
                    </div>
                    <Badge
                      className={`text-[9px] font-extrabold px-2 py-0.5 border-none uppercase ${
                        g.isAssigned
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {g.isAssigned ? "Assigned" : "Unassigned"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>{g.membersCount} Members</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      Supervisor: {g.supervisor || "Not Allocated"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDE: DETAILED ASSIGNMENT PANEL */}
          <div className="xl:col-span-2 space-y-6">
            {!selectedGroup && (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card rounded-3xl border border-dashed shadow-xs">
                <FileText className="w-12 h-12 mb-4 opacity-25 text-primary animate-pulse" />
                <p className="font-bold text-foreground">Select a group to assign task</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a group from the list on the left to allocate a milestone task.
                </p>
              </div>
            )}

            {selectedGroup && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Information Card & Mapped Criteria Parameters */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Group Info */}
                  <Card className="p-6 rounded-3xl shadow-sm bg-card border flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
                        <Info className="w-4 h-4 text-primary" /> Group Info
                      </h3>
                      <div className="space-y-3.5">
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Project Title</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{selectedGroup.projectTitle}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Supervisor</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{selectedGroup.supervisor || "Not Allocated"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <Badge className="bg-primary/10 text-primary w-full py-1.5 rounded-xl justify-center font-bold">
                        FYP-2 {activeMilestone} Assignment
                      </Badge>
                    </div>
                  </Card>

                  {/* Group Members List */}
                  <Card className="p-6 rounded-3xl shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 border flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Group Members
                      </h3>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {selectedGroup.members?.map(m => (
                          <div key={m} className="bg-card border rounded-xl p-2.5 flex justify-between items-center shadow-xs">
                            <span className="font-bold text-xs">{m}</span>
                            <Badge variant="outline" className="text-[9px]">Student</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Assignment Input Card */}
                <Card className="p-6 rounded-3xl shadow-sm border border-border bg-card space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" /> Assign {activeMilestone} Description
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">
                      Task Description Guidelines
                    </label>
                    <Textarea
                      rows={6}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder={`Enter comprehensive guidelines, instructions, and outcomes required for Group ${selectedGroup.groupName}'s ${activeMilestone}...`}
                      className="w-full px-4 py-3 border rounded-2xl text-xs bg-card focus:ring-2 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <Button
                    onClick={handleAssignTask}
                    disabled={saving || !taskDescription.trim()}
                    className="w-full py-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving Task Assignment..." : `Save & Allocate ${activeMilestone}`}
                  </Button>
                </Card>

              </div>
            )}
          </div>
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}
