import { useState, useEffect } from "react";
import axios from "axios";
import { AppBar } from "@/components/AppBar";
import { GroupCard } from "@/components/GroupCard";
import { Search, Users, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function DirectorGroupList() {
  const [selectedFyp, setSelectedFyp] = useState<"FYP-1" | "FYP-2">("FYP-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchGroups();
  }, [selectedFyp]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/committee-meetings/groups/approved/${selectedFyp}`
      );
      setGroups(res.data || []);
    } catch (err) {
      console.error("Failed to load groups", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const title = g.projectTitle || "";
    const groupName = String(g.groupName || "");

    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <CommitteeHeadLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <AppBar title="Approved Groups" showBack />

        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Approved Groups</h1>
              <p className="text-muted-foreground text-sm">Monitor and manage all approved project groups.</p>
            </div>

            {/* Phase Toggle */}
            <div className="flex bg-muted rounded-xl p-1 w-fit">
              {(["FYP-1", "FYP-2"] as const).map((fyp) => (
                <button
                  key={fyp}
                  onClick={() => setSelectedFyp(fyp)}
                  className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
                    selectedFyp === fyp
                      ? "bg-background text-primary shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fyp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* SEARCH & FILTERS SIDEBAR */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Search</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Quick Stats</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-xs font-medium">Total Groups</span>
                    <Badge variant="secondary" className="font-bold">{groups.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-xs font-medium">Filtered</span>
                    <Badge variant="outline" className="font-bold">{filteredGroups.length}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUPS LIST AREA */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-20 bg-card border rounded-2xl border-dashed">
                   <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                   <h3 className="font-bold text-lg">No Groups Found</h3>
                   <p className="text-muted-foreground">Try adjusting your search or phase selection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredGroups.map((group, index) => (
                    <GroupCard
                      key={index}
                      groupName={`Group ${group.groupName}`}
                      projectTitle={group.projectTitle || "No Project Assigned"}
                      supervisor={group.supervisor || "Not Assigned"}
                      members={group.members || []}
                      progress={0}
                      onClick={() =>
                        setLocation(
                          `/director/group-detail/${group.groupName}`
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}