import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import axios from "axios";
import { 
  Users, 
  Search, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  BarChart3, 
  Loader2,
  SearchCode,
  Info
} from "lucide-react";
import CommitteeLayout from "./CommitteeLayout";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorAllocation() {
  const [, setLocation] = useLocation();

  // State Management
  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [groups, setGroups] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Allocated, Unallocated

  // Active Selected Group for Allocation
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [mode, setMode] = useState("auto"); // auto, manual
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [allocatedTo, setAllocatedTo] = useState(null);

  // Initial Data Load
  useEffect(() => {
    fetchInitialData();
  }, [activeFYP]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchGroups(), fetchSupervisors()]);
    } catch (error) {
      console.error("Failed loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/committee-meetings/groups/approved/${activeFYP}`
      );
      setGroups(res.data || []);
    } catch (error) {
      console.error("Error fetching approved groups:", error);
      setGroups([]);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/committee-meetings/group-count`
      );
      setSupervisors(res.data || []);
    } catch (error) {
      console.error("Error fetching supervisors list:", error);
      setSupervisors([]);
    }
  };

  // Auto Allocate recommendation (least load/TotalGroups)
  const getAutoAllocationRecommendation = () => {
    if (supervisors.length === 0) return null;
    const sorted = [...supervisors].sort(
      (a, b) => a.TotalGroups - b.TotalGroups
    );
    return sorted[0];
  };

  const handleAllocation = async () => {
    if (!selectedGroupId) {
      alert("Please select a group to allocate");
      return;
    }

    let supervisorToAssign = null;

    if (mode === "auto") {
      supervisorToAssign = getAutoAllocationRecommendation();
    } else {
      supervisorToAssign = supervisors.find(
        (s) => s.SupervisorId === selectedSupervisor
      );
    }

    if (!supervisorToAssign) {
      alert("Please select a supervisor");
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(
        `${API_BASE}/committee-meetings/allocateSupervisor`,
        {
          groupId: selectedGroupId,
          supervisorId: supervisorToAssign.SupervisorId
        }
      );

      // Successfully allocated
      setAllocatedTo(supervisorToAssign.SupervisorName);
      
      // Auto close/reset state after a brief feedback delay
      setTimeout(() => {
        setAllocatedTo(null);
        setSelectedGroupId(null);
      }, 3000);

      // Refresh data lists
      await Promise.all([fetchGroups(), fetchSupervisors()]);

    } catch (error) {
      console.error("Supervisor allocation failed:", error);
      alert("Allocation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Group Filters and Search
  const filteredGroups = groups.filter((group) => {
    const title = group.projectTitle || "";
    const name = String(group.groupName || "");
    const supervisorName = group.supervisor || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supervisorName.toLowerCase().includes(searchQuery.toLowerCase());

    const isGroupAllocated = group.supervisor && group.supervisor !== "Not Assigned";

    if (statusFilter === "Allocated") return matchesSearch && isGroupAllocated;
    if (statusFilter === "Unallocated") return matchesSearch && !isGroupAllocated;
    return matchesSearch;
  });

  // Supervisor search filter (Manual mode)
  const filteredSupervisors = supervisors.filter((s) =>
    s.SupervisorName.toLowerCase().includes(supervisorSearch.toLowerCase())
  );

  // Metrics calculating
  const totalGroupsCount = groups.length;
  const allocatedGroupsCount = groups.filter(g => g.supervisor && g.supervisor !== "Not Assigned").length;
  const unallocatedGroupsCount = totalGroupsCount - allocatedGroupsCount;

  // Find currently selected group details
  const activeSelectedGroup = groups.find(g => String(g.groupName) === String(selectedGroupId));

  return (
    <CommitteeLayout>
      <AppBar title="Supervisor Allocation" showBack />

      {/* DASHBOARD CONTENT */}
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Groups</p>
              <h4 className="text-2xl font-bold mt-1">{loading ? "..." : totalGroupsCount}</h4>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase">Allocated</p>
              <h4 className="text-2xl font-bold mt-1 text-emerald-700">{loading ? "..." : allocatedGroupsCount}</h4>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Unallocated</p>
              <h4 className="text-2xl font-bold mt-1 text-amber-700">{loading ? "..." : unallocatedGroupsCount}</h4>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100/50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase">Supervisors Load</p>
              <h4 className="text-2xl font-bold mt-1 text-purple-700">{loading ? "..." : supervisors.length} Available</h4>
            </div>
          </div>
        </div>

        {/* PHASE SELECTOR & FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-3xl p-4 shadow-sm">
          <div className="flex gap-2">
            <Button 
              variant={activeFYP === "FYP-1" ? "default" : "outline"} 
              onClick={() => { setActiveFYP("FYP-1"); setSelectedGroupId(null); }} 
              className="rounded-full px-6"
            >
              FYP-1
            </Button>
            <Button 
              variant={activeFYP === "FYP-2" ? "default" : "outline"} 
              onClick={() => { setActiveFYP("FYP-2"); setSelectedGroupId(null); }} 
              className="rounded-full px-6"
            >
              FYP-2
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Group, Project, or Supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-border/50 rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border/50 rounded-xl px-4 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Groups</option>
              <option value="Allocated">Allocated Only</option>
              <option value="Unallocated">Unallocated Only</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-semibold text-lg">Loading approved groups and supervisors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: GROUP LIST */}
            <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <span>Groups List</span>
                  <Badge variant="secondary" className="rounded-full">{filteredGroups.length}</Badge>
                </h3>
              </div>

              {filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/20 border border-dashed rounded-3xl">
                  <SearchCode className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-semibold text-lg">No groups matched your search</p>
                  <p className="text-sm mt-1">Try updating your filters or search query.</p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = String(group.groupName) === String(selectedGroupId);
                  const isAllocated = group.supervisor && group.supervisor !== "Not Assigned";

                  return (
                    <div 
                      key={group.groupName}
                      className={`bg-card border rounded-3xl p-5 transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md
                        ${isSelected ? "ring-2 ring-primary bg-primary/5 border-primary/20" : "border-border/50"}`}
                      onClick={() => {
                        setSelectedGroupId(group.groupName);
                        // Reset manual selection to prevent leakage from previous group
                        setSelectedSupervisor(null);
                      }}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg text-foreground">Group {group.groupName}</h4>
                          <Badge variant={isAllocated ? "default" : "destructive"} className="px-3 py-0.5 rounded-full text-xs font-semibold">
                            {isAllocated ? "Allocated" : "Unallocated"}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">{group.projectTitle || "No Project Assigned"}</p>
                        
                        {/* Members row */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                          {group.members && group.members.map((member, idx) => (
                            <Badge key={idx} variant="outline" className="text-[11px] bg-muted/50 text-muted-foreground border-border">
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Allocation actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isAllocated ? (
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> {group.supervisor}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-semibold mt-1 cursor-pointer hover:text-primary transition underline">
                              Change Supervisor
                            </p>
                          </div>
                        ) : (
                          <Button size="sm" className="shadow-sm rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white">
                            Allocate Now
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT: DETAILED ALLOCATION PANEL */}
            <div className="lg:col-span-1 space-y-6">
              
              {!selectedGroupId ? (
                <div className="bg-muted/10 border border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center py-32 text-muted-foreground">
                  <UserCheck className="w-14 h-14 mb-4 opacity-20 text-primary" />
                  <h4 className="font-bold text-lg text-foreground">Allocate Supervisor</h4>
                  <p className="text-sm mt-1 max-w-[280px] mx-auto text-muted-foreground leading-relaxed">
                    Select any group from the list on the left to begin the auto-balanced or manual allocation process.
                  </p>
                </div>
              ) : (
                <div className="bg-card border rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden">
                  
                  {/* Feedback overlay on success */}
                  {allocatedTo && (
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="font-extrabold text-xl text-emerald-800">Allocation Successful!</h4>
                      <p className="text-sm font-semibold text-muted-foreground mt-2 leading-relaxed">
                        Group <span className="font-extrabold text-foreground">{selectedGroupId}</span> has been allocated to
                      </p>
                      <p className="font-black text-lg text-primary mt-1.5">{allocatedTo}</p>
                    </div>
                  )}

                  {/* Header info */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h3 className="font-black text-xl text-foreground">Allocate Supervisor</h3>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Group: {selectedGroupId}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedGroupId(null)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
                    >
                      Deselect
                    </Button>
                  </div>

                  {/* Selected Group Info Panel */}
                  {activeSelectedGroup && (
                    <div className="bg-muted/20 border rounded-2xl p-4 space-y-2">
                      <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Project Name</p>
                      <p className="text-sm font-bold text-foreground leading-snug">{activeSelectedGroup.projectTitle || "No Project Assigned"}</p>
                      
                      <div className="pt-2 flex justify-between items-center border-t border-border/50">
                        <span className="text-xs font-semibold text-muted-foreground">Current Supervisor:</span>
                        <span className={`text-xs font-extrabold ${activeSelectedGroup.supervisor && activeSelectedGroup.supervisor !== "Not Assigned" ? "text-emerald-700" : "text-amber-600"}`}>
                          {activeSelectedGroup.supervisor || "None"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* MODE TOGGLES */}
                  <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1.5 rounded-2xl border">
                    <button
                      onClick={() => setMode("auto")}
                      className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5
                        ${mode === "auto" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Sparkles className="w-4 h-4" /> Auto Balanced
                    </button>
                    <button
                      onClick={() => setMode("manual")}
                      className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5
                        ${mode === "manual" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Users className="w-4 h-4" /> Manual List
                    </button>
                  </div>

                  {/* CONTENT BASED ON SELECTED MODE */}
                  {mode === "auto" ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                          <Sparkles className="w-5 h-5 text-emerald-600" /> Recommended Supervisor
                        </div>
                        
                        {getAutoAllocationRecommendation() ? (
                          <div className="space-y-2 pt-1">
                            <h4 className="font-black text-lg text-emerald-950">{getAutoAllocationRecommendation().SupervisorName}</h4>
                            <p className="text-xs font-semibold text-emerald-700/80">
                              This supervisor has the lowest allocation load ({getAutoAllocationRecommendation().TotalGroups} groups).
                            </p>
                            
                            <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-emerald-500/10 text-xs font-bold text-emerald-800">
                              <span>Current Load:</span>
                              <Badge className="bg-emerald-600 text-white rounded-full font-extrabold">
                                {getAutoAllocationRecommendation().TotalGroups} Groups
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No supervisors available for auto allocation.</p>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed italic text-center">
                        💡 Auto Balanced mode assigns the supervisor with the lowest number of active groups to ensure even workflow distribution.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Filter supervisor..."
                          value={supervisorSearch}
                          onChange={(e) => setSupervisorSearch(e.target.value)}
                          className="pl-8 bg-muted/20 border-border/50 rounded-xl text-xs h-9"
                        />
                      </div>

                      <div className="border rounded-2xl overflow-hidden max-h-[30vh] overflow-y-auto custom-scrollbar divide-y bg-muted/10">
                        {filteredSupervisors.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground italic">
                            No matching supervisors.
                          </div>
                        ) : (
                          filteredSupervisors.map((s) => (
                            <div 
                              key={s.SupervisorId}
                              onClick={() => setSelectedSupervisor(s.SupervisorId)}
                              className={`p-3.5 flex justify-between items-center cursor-pointer transition
                                ${selectedSupervisor === s.SupervisorId ? "bg-primary/5 text-primary" : "hover:bg-muted/30"}`}
                            >
                              <div className="space-y-1">
                                <p className="font-bold text-sm text-foreground">{s.SupervisorName}</p>
                                <p className="text-[11px] text-muted-foreground font-semibold">Active Load: {s.TotalGroups} groups</p>
                              </div>
                              <input
                                type="radio"
                                name="supervisor"
                                checked={selectedSupervisor === s.SupervisorId}
                                onChange={() => setSelectedSupervisor(s.SupervisorId)}
                                className="w-4 h-4 text-primary accent-primary border-border focus:ring-primary cursor-pointer shrink-0"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTION SUBMIT BUTTON */}
                  <Button 
                    className="w-full h-12 shadow-md rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                    disabled={actionLoading || (mode === "manual" && !selectedSupervisor)}
                    onClick={handleAllocation}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Allocating...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" /> Allocate Supervisor
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CommitteeLayout>
  );
}
