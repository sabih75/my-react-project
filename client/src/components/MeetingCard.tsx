import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";

interface MeetingCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees?: number;
  onClick?: () => void;
}

export function MeetingCard({ title, date, time, location, attendees, onClick }: MeetingCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2 cursor-pointer"
      data-testid={`card-meeting-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{location}</span>
            </div>
          </div>
          {attendees && (
            <p className="text-xs text-muted-foreground mt-2">{attendees} attendees</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
      </div>
    </div>
  );
}
