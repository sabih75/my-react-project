import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Users, Clock, CheckCircle2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function QueueAssignmentScreen() {
  const [, setLocation] = useLocation();

  const progressGroups = [
    {
      name: "Group A",
      topic: "Database Schema Implementation",
      time: "10:00 AM - 10:30 AM",
      members: 5,
      status: "in-progress",
    },
    {
      name: "Group B",
      topic: "Frontend API Integration",
      time: "10:30 AM - 11:00 AM",
      members: 4,
      status: "in-progress",
    },
  ];

  const pendingGroups = [
    {
      name: "Group C",
      topic: "Mobile UI Review",
      time: "Waiting",
      members: 6,
      status: "pending",
    },
    {
      name: "Group D",
      topic: "Testing and QA Discussion",
      time: "Waiting",
      members: 3,
      status: "pending",
    },
  ];

  return (
    <MobileLayout>
      <AppBar title="Meeting Queue" showBack />

      <div className="p-4 space-y-6">
        {/* In Progress Groups */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Ongoing Meetings</h2>
          <div className="space-y-3">
            {progressGroups.map((group, index) => (
              <div
                key={index}
                className="bg-card border border-card-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    In Progress
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {group.topic}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{group.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{group.members} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Groups */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Pending Groups</h2>
          <div className="space-y-3">
            {pendingGroups.map((group, index) => (
              <div
                key={index}
                className="bg-card border border-card-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                    Waiting
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {group.topic}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4" />
                    <span>{group.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{group.members} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setLocation("/")}
          className="w-full mt-4"
          variant="default"
        >
          Back to Home
        </Button>
      </div>
    </MobileLayout>
  );
}
