import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentGroupManage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const groupId = params.get("groupId");

  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);

  const currentUserId = "2018-ARID-0996";

  // Dummy student list (you can replace this with your real data later)
  const allStudents = [
    { id: "2018-ARID-0997", name: "Ali Khan", technology: "React JS" },
    { id: "2018-ARID-0998", name: "Sara Malik", technology: "Flutter" },
    { id: "2018-ARID-0999", name: "Ahmed Raza", technology: "Node.js" },
    { id: "2018-ARID-1000", name: "Iqra Noor", technology: "Python" },
    { id: "2018-ARID-1001", name: "Bilal Hussain", technology: "Java" },
  ];

  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const foundGroup = savedGroups.find((g) => g.id === groupId);
    if (foundGroup) setGroup(foundGroup);

    const savedRequests = JSON.parse(localStorage.getItem("joinRequests") || "[]");
    setRequests(savedRequests);

    setStudents(allStudents.filter((s) => s.id !== currentUserId));
  }, [groupId]);

  const handleRequestJoin = (studentId) => {
    const savedRequests = JSON.parse(localStorage.getItem("joinRequests") || "[]");

    // Check if request already exists
    const exists = savedRequests.some(
      (r) => r.groupId === groupId && r.to === studentId && r.from === currentUserId
    );
    if (exists) return alert("You already sent a request to this student.");

    const newRequest = {
      id: `req-${Date.now()}`,
      groupId,
      from: currentUserId,
      to: studentId,
      status: "pending",
    };

    const updatedRequests = [...savedRequests, newRequest];
    localStorage.setItem("joinRequests", JSON.stringify(updatedRequests));
    setRequests(updatedRequests);

    alert(`Join request sent to ${studentId}!`);
  };

  if (!group) {
    return (
      <MobileLayout>
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold">Group not found</h1>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        {/* Group Info */}
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{group.description}</p>
            <p className="text-sm">
              <strong>Technology:</strong>{" "}
              {group.technology || "Not specified"}
            </p>
            <p className="text-sm">
              <strong>Members:</strong>{" "}
              {group.members?.length || 0} / {group.maxMembers}
            </p>
          </CardContent>
        </Card>

        {/* Student List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Invite Students to Join
          </h2>

          {students.map((student) => {
            const hasRequested = requests.some(
              (r) =>
                r.groupId === groupId &&
                r.to === student.id &&
                r.from === currentUserId
            );

            return (
              <div
                key={student.id}
                className="border rounded-lg p-4 flex justify-between items-center shadow-sm bg-card"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.technology}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={hasRequested}
                  onClick={() => handleRequestJoin(student.id)}
                >
                  {hasRequested ? "Requested" : "Request to Join"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
