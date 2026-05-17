import { useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { useLocation } from "wouter";
import CommitteeHeadLayout from "../Director/ComitteeHeadLayoutScreen";
export default function SemesterMeetingAgenda() {
  const [program, setProgram] = useState("FYP-1");
  const [, setLocation] = useLocation();

  const meetings = [
    // ===== FYP-1 =====
    {
      id: 1,
      title: "Project Allocation",
      program: "FYP-1",
      date: "12 January 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 3,
      title: "Objective of Project",
      program: "FYP-1",
      date: "26 January 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 5,
      title: "API / Demo",
      program: "FYP-1",
      date: "09 February 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 7,
      title: "Pitching",
      program: "FYP-1",
      date: "23 February 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },

    // ===== FYP-2 =====
    {
      id: 2,
      title: "Mockups Checks",
      program: "FYP-2",
      date: "19 January 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 4,
      title: "30% Project Implementation",
      program: "FYP-2",
      date: "02 February 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 6,
      title: "Project Demo",
      program: "FYP-2",
      date: "16 February 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
    {
      id: 8,
      title: "Final Task",
      program: "FYP-2",
      date: "02 March 2026",
      time: "10:30 AM – 7:00 PM",
      location: "Conference Room",
    },
  ];

  const filteredMeetings = meetings.filter(
    (m) => m.program === program
  );

  return (
    <CommitteeHeadLayout>
      <AppBar title="Semester Meeting Agenda">
        <button
          onClick={() =>
            setLocation("/committee/create-semester-agenda")
          }
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg"
        >
          Create Agenda
        </button>
      </AppBar>

      <div className="p-6 bg-slate-950 min-h-screen text-white">
        <h1 className="text-2xl font-bold mb-1">
          Committee Meeting Agenda
        </h1>
        <p className="text-slate-400 mb-6">
          Meetings Agenda (12 January – 1 June)
        </p>

        {/* Program Switch */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setProgram("FYP-1")}
            className={`px-5 py-2 rounded-xl font-medium ${
              program === "FYP-1"
                ? "bg-blue-600"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            FYP-1
          </button>

          <button
            onClick={() => setProgram("FYP-2")}
            className={`px-5 py-2 rounded-xl font-medium ${
              program === "FYP-2"
                ? "bg-green-600"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            FYP-2
          </button>
        </div>

        {/* Agenda List */}
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md"
            >
              <h3 className="text-lg font-semibold">
                {meeting.title}
              </h3>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <CalendarDays size={16} />
                  <span>{meeting.date}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} />
                  <span>{meeting.time}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={16} />
                  <span>{meeting.location}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredMeetings.length === 0 && (
            <p className="text-center text-slate-400">
              No meetings scheduled.
            </p>
          )}
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}