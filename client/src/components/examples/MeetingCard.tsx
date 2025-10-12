import { MeetingCard } from "../MeetingCard";

export default function MeetingCardExample() {
  return (
    <div className="p-4 space-y-3">
      <MeetingCard
        title="Progress Review Meeting"
        date="Dec 15, 2024"
        time="10:00 AM"
        location="Room 301, CS Block"
        attendees={5}
      />
    </div>
  );
}
