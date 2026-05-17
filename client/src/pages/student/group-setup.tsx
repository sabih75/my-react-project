import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GroupSetup() {
  const [, setLocation] = useLocation();
  const [requests, setRequests] = useState<any[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.regNum) return;

    axios
      .get(`${API_BASE}/users/GetMemberRequests/${user.regNum}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, []);
 const acceptRequest = (requestId: number) => {
  axios
    .post(`${API_BASE}/users/UpdateGroupRequestStatus`, {
      requestId: requestId,
      status: "Accepted",
    }).then(() => {

      alert("Request accepted ✅");

      // refresh group data
      setLocation("/group/manage"); 

    
    })};
  const totalNotifications = requests.length;

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl bg-card border rounded-xl shadow p-8 space-y-6">

        {/* 🔔 Notification Icon */}
        <div className="absolute top-5 right-5">
          <button
            className="relative"
            onClick={() => setLocation("/student/notifications")}
          >
            <Bell className="w-7 h-7 text-gray-700" />

            {totalNotifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Group Options</h1>
          <p className="text-muted-foreground">
            Choose how you want to proceed with your project group.
          </p>
        </div>

        {/* 📩 Incoming Requests Section */}
        {requests.length > 0 && (
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-lg">
              Incoming Group Requests
            </h2>

            {requests.map((r) => (
              <div
                key={r.RequestID}
                className="flex justify-between items-center border rounded-md p-3 bg-white"
              >
                <div>
                  <p className="font-medium">
                    {r.FromRegNum}
                  </p>
                  <p className="text-sm text-gray-500">
                    Wants to add you to their group
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => acceptRequest(r.RequestID)}
                >
                  Accept
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-4 pt-4">
          <Button
            className="w-full h-14 text-lg"
            onClick={() => setLocation("/student/create-group")}
          >
            Create New Group
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 text-lg"
            onClick={() => setLocation("/student/join-group")}
          >
            Join Existing Group
          </Button>
        </div>
      </div>
    </div>
  );
 }