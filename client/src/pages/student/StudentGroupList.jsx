import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentGroupList() {
  const [, setLocation] = useLocation();
  const studentId = "2018-ARID-0996"; // Replace with logged-in user ID

  // Simulated existing groups (fetch later from Firebase)
  const [groups] = useState([
    { id: "grp1", name: "AI Innovators", members: 3 },
    { id: "grp2", name: "Code Masters", members: 4 },
    { id: "grp3", name: "Tech Titans", members: 2 },
  ]);

  // Store join requests and status
  const [requests, setRequests] = useState({});

  // Load any previously saved request data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`join-requests-${studentId}`);
    if (saved) {
      setRequests(JSON.parse(saved));
    }
  }, [studentId]);

  // Auto-redirect if any request is accepted
  useEffect(() => {
    const acceptedGroup = Object.values(requests).find((r) => r.status === "accepted");
    if (acceptedGroup) {
      alert(`Your join request to '${acceptedGroup.groupName}' was accepted!`);
      localStorage.setItem(`group-${studentId}`, acceptedGroup.groupName);
      setLocation("/student/dashboard");
    }
  }, [requests, setLocation, studentId]);

  const handleRequestJoin = (group) => {
    // Check if already requested
    if (requests[group.id]) {
      alert("You have already sent a request to this group.");
      return;
    }

    const updatedRequests = {
      ...requests,
      [group.id]: {
        groupName: group.name,
        status: "pending",
      },
    };

    setRequests(updatedRequests);
    localStorage.setItem(`join-requests-${studentId}`, JSON.stringify(updatedRequests));

    alert(`Join request sent to '${group.name}'!`);
  };

  // Simulate request updates (e.g., admin accepts/rejects)
  // In real app, you'd poll Firebase or listen for updates
  const simulateAcceptRequest = (groupId) => {
    const updated = { ...requests };
    if (updated[groupId]) {
      updated[groupId].status = "accepted";
      setRequests(updated);
      localStorage.setItem(`join-requests-${studentId}`, JSON.stringify(updated));
    }
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Available Groups</h1>
        <p className="text-center text-muted-foreground">
          Browse existing groups and send a join request.
        </p>

        <div className="space-y-4">
          {groups.map((group) => {
            const request = requests[group.id];
            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Members: {group.members}
                  </p>
                  {!request ? (
                    <Button size="sm" onClick={() => handleRequestJoin(group)}>
                      Request to Join
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={
                        request.status === "accepted"
                          ? "default"
                          : request.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      disabled
                    >
                      {request.status === "pending" && "Pending..."}
                      {request.status === "accepted" && "Accepted"}
                      {request.status === "rejected" && "Rejected"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-lg font-semibold">Your Join Requests</h2>
          {Object.keys(requests).length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests sent yet.</p>
          ) : (
            <ul className="list-disc ml-5 text-sm space-y-1">
              {Object.entries(requests).map(([id, req]) => (
                <li key={id}>
                  {req.groupName} —{" "}
                  <span
                    className={
                      req.status === "pending"
                        ? "text-yellow-600"
                        : req.status === "accepted"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {req.status}
                  </span>
                  {/* Demo only: simulate acceptance */}
                  {req.status === "pending" && (
                    <Button
                      size="xs"
                      className="ml-2"
                      onClick={() => simulateAcceptRequest(id)}
                    >
                      Simulate Accept
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-6"
          onClick={() => setLocation("/student/group-selection")}
        >
          Back
        </Button>
      </div>
    </MobileLayout>
  );
}
