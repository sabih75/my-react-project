import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import CommitteeLayout from "./CommitteeLayout";
import axios from "axios";

export default function GroupAssignmentScreen() {
  const [, setLocation] = useLocation();

  const [student, setStudent] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // ✅ Fetch eligible groups
  const fetchEligibleGroups = async (regNum: string) => {
    try {
      const res = await axios.get(
        `http://localhost/ProgressMonitoringProject/api/committee-meetings/EligibleGroups/${regNum}`
      );

      setGroups(res.data || []);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  // ✅ Load selected student
  useEffect(() => {
    const stored = localStorage.getItem("selectedStudent");

    if (stored) {
      const st = JSON.parse(stored);
      setStudent(st);

      // call API AFTER student is available
      fetchEligibleGroups(st.regNum);
    }
  }, []);

  // 🚫 If no student
  if (!student)
    return (
      <CommitteeLayout>
        <AppBar title="Assign to Group" showBack />
        <div className="p-4 text-center text-muted-foreground">
          No student selected.
        </div>
      </CommitteeLayout>
    );

  // ✅ Assign student to existing group
  const handleAssign = async (groupId: number) => {
    try {
      alert(groupId);
      alert(student.regNum);
      await axios.post(
        `http://localhost/ProgressMonitoringProject/api/committee-meetings/AddStudentToGroup?groupId=${groupId}&regNum=${student.regNum}`
      );
      alert(student.regNum);


      setLocation("/committee/student-selection");
    } catch (error) {
      console.error(error);
      alert("Failed to assign student");
    }
  };

  // ✅ Create new group
  const handleCreateGroup = async () => {
  try {

    const payload = {
      createdBy: student.regNum,      // 🔹 REQUIRED
      supervisorID: null,             // or selected supervisor id
      projectID: null,                // optional for now
      isFinalized: 0,                 // default
      createdSession: student.sessionID // 🔹 REQUIRED
    };

    await axios.post(
      "http://localhost/ProgressMonitoringProject/api/users/CreateGroup",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    alert("Group created successfully");

    setNewGroupName("");
    setCreatingGroup(false);

    setLocation("/committee/student-selection");
  } catch (error) {
    console.error(error);
    alert("Failed to create group");
  }
};

  return (
    <CommitteeLayout>
      <AppBar title="Assign to Group" showBack />

      <div className="p-4 space-y-5">

        {/* Student Info */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Student Info</h3>
          <p className="text-sm font-medium">{student.name}</p>
          <p className="text-xs text-muted-foreground">{student.regNum}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Technology:{" "}
            <span className="font-medium">{student.technology}</span>
          </p>
        </div>

        {/* Eligible Groups */}
        <h3 className="font-semibold">Eligible Groups</h3>

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No eligible groups available for this technology.
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-lg bg-card border border-card-border"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{group.name}</h4>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Users className="w-3 h-3" />

                    {group.members?.length
                      ? group.members.map((m: any) => m.name).join(", ")
                      : "No members"}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAssign(group.id)}
                >
                  Add
                </Button>
              </div>
            </div>
          ))
        )}

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Create Group */}
        {!creatingGroup ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setCreatingGroup(true)}
            >
              <PlusCircle className="w-4 h-4" />
              Create New Group
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold mb-2">Create New Group</h3>

            
            <div className="flex justify-end gap-2">
             

              <Button onClick={handleCreateGroup}>
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </CommitteeLayout>
  );
}