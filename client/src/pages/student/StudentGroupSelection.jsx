import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileLayout } from "@/components/MobileLayout";

export default function StudentGroupSelection() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState(null); // "create" or "join"
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");

  const studentId = "2018-ARID-0996"; // Replace with logged-in user ID

  const handleCreateGroup = () => {
    if (!groupName) return alert("Please enter a group name");

    // Save in Firebase or localStorage
    localStorage.setItem(`group-${studentId}`, groupName);

    alert("Group created successfully!");
    setLocation("/student/dashboard");
  };

  const handleJoinGroup = () => {
    if (!groupCode) return alert("Please enter group code");
    // Example validation logic
    localStorage.setItem(`group-${studentId}`, groupCode);

    alert("Joined group successfully!");
    setLocation("/student/dashboard");
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Join or Create Group</h1>
        <p className="text-center text-muted-foreground">
          To continue, you must be part of a project group.
        </p>

        {!mode && (
          <div className="flex flex-col gap-4 mt-8">
            <Button onClick={() => setMode("create")} className="w-full">
              Create New Group
            </Button>
            <Button onClick={() => setMode("join")} variant="outline" className="w-full">
              Join Existing Group
            </Button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <Input
              placeholder="Enter Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button className="w-full" onClick={handleCreateGroup}>
              Create Group
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setMode(null)}>
              Back
            </Button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <Input
              placeholder="Enter Group Code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
            />
            <Button className="w-full" onClick={handleJoinGroup}>
              Join Group
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setMode(null)}>
              Back
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
