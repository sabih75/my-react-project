import { useState } from "react";
import { AppBar } from "@/components/AppBar";
import { useLocation } from "wouter";
import CommitteeLayout from "../committee/CommitteeLayout";
export default function CreateSemesterAgenda() {
  const [, setLocation] = useLocation();

  const [program, setProgram] = useState("FYP-1");
  const [agenda, setAgenda] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
  });

  const handleChange = (e) => {
    setAgenda({ ...agenda, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("New Agenda:", {
      program,
      ...agenda,
    });

    alert("Semester Agenda Created Successfully ✅");
    setLocation("/committee/semester-agenda");
  };

  return (
    <CommitteeLayout>
      <AppBar title="Create Semester Agenda">
        <button
          onClick={() => setLocation("/committee/semester-agenda")}
          className="px-3 py-1 text-sm bg-muted rounded-lg"
        >
          Back
        </button>
      </AppBar>

      <div className="p-4 space-y-4">
        {/* Program */}
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg bg-background"
        >
          <option value="FYP-1">FYP-1</option>
          <option value="FYP-2">FYP-2</option>
        </select>

        <input
          name="title"
          placeholder="Meeting Title"
          value={agenda.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        <input
          type="date"
          name="date"
          value={agenda.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        <input
          name="time"
          placeholder="Time (10:30 AM – 7:00 PM)"
          value={agenda.time}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        <input
          name="location"
          placeholder="Location"
          value={agenda.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Create Agenda
        </button>
      </div>
    </CommitteeLayout>
  );
}