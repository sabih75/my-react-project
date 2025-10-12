import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Calendar, Clock, MapPin, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MeetingDetail() {
  const attendees = [
    { name: "Ali Hassan", status: "present" },
    { name: "Ahmed Khan", status: "present" },
    { name: "Sara Ahmad", status: "absent" },
  ];

  return (
    <MobileLayout>
      <AppBar title="Meeting Details" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Progress Review Meeting</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">December 15, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">10:00 AM - 11:00 AM</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Room 301, CS Block</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">5 participants</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Agenda</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Review current project progress</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Discuss upcoming deadlines</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Address any blockers or issues</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Attendance</h3>
          <div className="space-y-2">
            {attendees.map((attendee, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {attendee.name.charAt(0)}
                  </div>
                  <span className="text-sm">{attendee.name}</span>
                </div>
                <Badge
                  className={
                    attendee.status === "present"
                      ? "bg-chart-2 text-white"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {attendee.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Meeting Notes</h3>
              <p className="text-sm text-muted-foreground">
                Team discussed the implementation of the database schema. Progress is on track. Next milestone: Complete API development by Dec 20.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full" data-testid="button-join-meeting">
          Join Meeting
        </Button>
      </div>
    </MobileLayout>
  );
}
