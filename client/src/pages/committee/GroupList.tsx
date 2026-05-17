import { useState, useEffect } from "react";
import axios from "axios";
import CommitteeLayout from "../committee/CommitteeLayout";
import { AppBar } from "@/components/AppBar";
import { GroupCard } from "@/components/GroupCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useParams } from "wouter";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GroupList() {
  const {activeFyp}=useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/committee-meetings/groups/approved/${activeFyp}`
      );

      setGroups(res.data || []);
    } catch (err) {
      console.error("Failed to load groups", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED FILTER
  const filteredGroups = groups.filter((g) => {
    const title = g.projectTitle || "";
    const groupName = String(g.groupName || "");

    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <CommitteeLayout>
      <AppBar title="Approved Groups" showBack />

      <div className="p-6 space-y-6">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading groups...
          </p>
        )}

        {/* Groups List */}
        {!loading && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Total Groups</h2>
              <span className="text-sm text-muted-foreground">
                {filteredGroups.length} groups
              </span>
            </div>

            <div className="space-y-3">
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
                      `/committee/group-detail/${group.groupName}`
                    )
                  }
                />
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No groups found.
              </p>
            )}
          </div>
        )}
      </div>
    </CommitteeLayout>
  );
}