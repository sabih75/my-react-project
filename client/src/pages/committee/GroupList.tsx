import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { GroupCard } from "@/components/GroupCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";

export default function GroupList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const groups = [
    {
      groupName: "Group Alpha",
      projectTitle: "AI-Based Student Management System",
      members: ["Ali Hassan", "Ahmed Khan", "Sara Ahmad"],
      supervisor: "Dr. Khan",
      progress: 68,
    },
    {
      groupName: "Group Beta",
      projectTitle: "Real-time Traffic Monitoring using IoT",
      members: ["Usman Ali", "Fatima Noor"],
      supervisor: "Dr. Ahmed",
      progress: 45,
    },
    {
      groupName: "Group Gamma",
      projectTitle: "E-Commerce Platform with AR Features",
      members: ["Hassan Ali", "Zainab Khan", "Omar Farooq"],
      supervisor: "Dr. Sara",
      progress: 82,
    },
  ];

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout>
      <AppBar title="All Groups" showBack />
      
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-group"
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Project Groups</h2>
          <span className="text-sm text-muted-foreground">{filteredGroups.length} groups</span>
        </div>

        <div className="space-y-3">
          {filteredGroups.map((group, index) => (
            <GroupCard
              key={index}
              {...group}
              onClick={() => setLocation("/committee/group-detail")}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
