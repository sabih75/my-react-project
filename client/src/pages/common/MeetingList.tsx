import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { MeetingCard } from "@/components/MeetingCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function MeetingList() {
  const [, setLocation] = useLocation();

  const meetings = [
    {
      title: "Progress Review Meeting",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      location: "Room 301, CS Block",
      attendees: 5,
    },
    {
      title: "Project Discussion",
      date: "Dec 18, 2024",
      time: "2:00 PM",
      location: "Conference Room A",
      attendees: 8,
    },
    {
      title: "Final Presentation Prep",
      date: "Dec 22, 2024",
      time: "11:00 AM",
      location: "Auditorium",
      attendees: 12,
    },
  ];

  return (
    <MobileLayout>
      <AppBar
        title="Meetings"
        actions={
          <Button size="icon" variant="ghost" data-testid="button-add-meeting">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming</h2>
          <span className="text-sm text-muted-foreground">{meetings.length} meetings</span>
        </div>

        {meetings.map((meeting, index) => (
          <MeetingCard
            key={index}
            {...meeting}
            onClick={() => setLocation("/meeting-detail")}
          />
        ))}

        <div className="pt-4">
          <h2 className="text-lg font-semibold mb-3">Past Meetings</h2>
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">No past meetings</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
