import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StudentGroupList1() {
  const [, setLocation] = useLocation();
  const studentId = "2018-ARID-0996"; // current logged-in student

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    setGroups(savedGroups);
    setStudents(savedStudents);
  }, []);

  // Find the group created by the current student (the "owner" or "leader")
  const myGroup = groups.find((g) => g.createdBy === studentId);

  const handleSendRequest = (studentRegNo) => {
    alert(`Request sent to ${studentRegNo} to join your group.`);
    // Optionally save to localStorage for persistence later
  };

  if (!myGroup) {
    return (
      <MobileLayout>
        <div className="p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">No Group Created</h1>
          <p className="text-muted-foreground">
            You haven't created a group yet. Go to the Group Creation screen to make one.
          </p>
          <Button
            className="w-full"
            onClick={() => setLocation("/student/group-selection")}
          >
            Create Group
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // Get member details from student list
  const memberDetails = myGroup.members
    .map((id) => students.find((s) => s.regNo === id))
    .filter(Boolean);

  // Collect technologies already used in the group
  const usedTechnologies = memberDetails.map((m) => m.technology.toLowerCase());

  // Filter students:
  // - Not in current group
  // - Different technology
  // - Match search (by regNo)
  const filteredStudents = students.filter(
    (s) =>
      !myGroup.members.includes(s.regNo) &&
      !usedTechnologies.includes(s.technology.toLowerCase()) &&
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Your Created Group</h1>

        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle>{myGroup.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{myGroup.description}</p>
            <p className="text-xs text-muted-foreground mb-3">
              Members: {myGroup.members.length}/{myGroup.maxMembers}
            </p>

            <h2 className="font-semibold mb-2">Current Members</h2>
            {memberDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <ul className="space-y-2">
                {memberDetails.map((m) => (
                  <li
                    key={m.regNo}
                    className="flex justify-between items-center text-sm border rounded-md p-2"
                  >
                    <span>
                      {m.name} ({m.regNo})
                    </span>
                    <span className="text-muted-foreground">{m.technology}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Invite Students Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 mt-6">Invite Other Students</h2>
          <Input
            placeholder="Search by Registration No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students found with different technologies.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((s) => (
                <Card key={s.regNo}>
                  <CardContent className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.regNo} — {s.technology}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleSendRequest(s.regNo)}>
                      Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-6"
          onClick={() => setLocation("/student/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    </MobileLayout>
  );
}
