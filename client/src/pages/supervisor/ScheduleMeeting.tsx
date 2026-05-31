import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Calendar as CalendarIcon,
  HardDrive,
  Repeat2,
  Users,
  Clock,
  ArrowLeft,
  User,
  FileText
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupervisorLayout from "./SupervisorLayout";
import { AppBar } from "@/components/AppBar";
import axios from "axios";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function ScheduleMeeting() {
  const [, setLocation] = useLocation();

  const [groups, setGroups] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const supervisorId = user?.id;
  const [fypType, setFypType] = useState("FYP-1");
  const [mode, setMode] = useState("group"); // group | individual
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [meeting, setMeeting] = useState({
    groupId: "",
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    time: "10:00",
    pptRequired: false,
    memberId: "",
    selectedDays: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    } as Record<string, boolean>,
  });

  const [message, setMessage] = useState<string | null>(null);

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramGroupId = params.get("groupId");
    if (paramGroupId) {
      setMeeting(prev => ({ ...prev, groupId: paramGroupId }));
    }
  }, []);

  useEffect(() => {
    if (mode === "individual" && meeting.groupId) {
      fetchStudents(meeting.groupId);
    }
  }, [mode, meeting.groupId]);

  useEffect(() => {
    if (supervisorId) {
      fetchGroups(supervisorId);
    }
  }, [supervisorId, fypType]);

  const fetchGroups = async (supId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/GetSupervisorGroups/${supId}/${fypType}`
      );
      setGroups(res.data);
      setMeeting(prev => ({ ...prev, groupId: "", memberId: "" }));
    } catch {
      console.error("Failed to fetch groups");
    }
  };

  const fetchStudents = async (groupId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE}/supervisor/GetGroupStudents/${groupId}`
      );
      setStudents(res.data);
    } catch {
      console.error("Failed to fetch students");
    }
  };

  const handleGroupChange = (groupId: string) => {
    setMeeting(prev => ({ ...prev, groupId, memberId: "" }));
  };

  const handleChange = (field: string, value: any) => {
    setMeeting(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setMeeting(prev => ({
      ...prev,
      selectedDays: {
        ...prev.selectedDays,
        [day]: !prev.selectedDays[day],
      },
    }));
  };

  const handleSave = async () => {
    setMessage(null);

    if (!meeting.groupId) {
      alert("Please select a group");
      return;
    }

    if (mode === "individual" && !meeting.memberId) {
      alert("Please select a student");
      return;
    }

    if (!meeting.title || !meeting.startDate || !meeting.endDate) {
      alert("Please fill all required fields");
      return;
    }

    const selectedDaysArr = Object.keys(meeting.selectedDays).filter(
      (d) => meeting.selectedDays[d]
    );

    if (selectedDaysArr.length === 0) {
      alert("Please select at least one day");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        SupervisorId: supervisorId,
        GroupId: parseInt(meeting.groupId),
        MemberId: mode === "individual" ? meeting.memberId : null,
        Title: meeting.title,
        Description: meeting.description,
        StartDate: meeting.startDate,
        EndDate: meeting.endDate,
        Time: meeting.time + ":00",
        Days: selectedDaysArr.join(","),
        Location: meeting.location,
        PptRequired: meeting.pptRequired,
      };

      await axios.post(`${API_BASE}/supervisor/schedule-meeting`, payload);

      alert("Meeting(s) Scheduled Successfully ✅");
      setLocation("/supervisor/meetings");
    } catch (err) {
      console.error(err);
      alert("Failed to schedule meeting ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <AppBar title="Schedule New Meeting" showBack />

        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-8">

            {/* FYP PHASE SELECT */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject Type</Label>
              <Tabs value={fypType} onValueChange={setFypType} className="w-full">
                <TabsList className="grid grid-cols-2 h-11 bg-muted p-1">
                  <TabsTrigger value="FYP-1" className="rounded-md font-bold">FYP-1</TabsTrigger>
                  <TabsTrigger value="FYP-2" className="rounded-md font-bold">FYP-2</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* MODE SELECTOR */}
            <div className="flex bg-muted rounded-xl p-1.5 h-12">
              <button
                onClick={() => setMode("group")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all ${mode === "group" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Users className="w-4 h-4" /> Group Meeting
              </button>
              <button
                onClick={() => setMode("individual")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all ${mode === "individual" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <User className="w-4 h-4" /> Individual Meeting
              </button>
            </div>

            {/* TARGET SELECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Project Group</Label>
                <Select value={meeting.groupId} onValueChange={handleGroupChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.GroupId} value={g.GroupId.toString()}>
                        Group {g.GroupId} - {g.ProjectTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === "individual" && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Student</Label>
                  <Select value={meeting.memberId || ""} onValueChange={(v) => handleChange("memberId", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.RegNum} value={s.RegNum}>
                          {s.StudentName} ({s.RegNum})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* CONTENT DETAILS */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Title</Label>
                <Input
                  placeholder="e.g., Weekly Progress Sync"
                  value={meeting.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agenda / Description</Label>
                <Textarea
                  placeholder="What will be discussed?"
                  value={meeting.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Venue / Link</Label>
                <div className="relative">
                  <HardDrive className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Room 302 or Zoom Link"
                    value={meeting.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* SCHEDULING DETAILS */}
            <div className="space-y-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> Start Date
                  </Label>
                  <Input
                    type="date"
                    value={meeting.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> End Date
                  </Label>
                  <Input
                    type="date"
                    value={meeting.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Start Time
                  </Label>
                  <Input
                    type="time"
                    value={meeting.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-xl">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Repeat2 className="w-4 h-4" /> Recurrence Days
                </Label>
                <div className="flex flex-wrap gap-2">
                  {dayKeys.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDayToggle(d)}
                      className={`flex-1 min-w-[60px] py-2 text-xs font-bold rounded-lg border transition-all ${meeting.selectedDays[d]
                          ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                          : "bg-background hover:bg-muted text-muted-foreground"
                        }`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">Meetings will be automatically generated for every selected day between the start and end dates.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="font-bold cursor-pointer" htmlFor="ppt-req">PPT Required</Label>
                    <p className="text-[10px] text-muted-foreground">Students must upload a presentation before the meeting.</p>
                  </div>
                </div>
                <input
                  id="ppt-req"
                  type="checkbox"
                  className="w-5 h-5 accent-primary"
                  checked={meeting.pptRequired}
                  onChange={(e) => handleChange("pptRequired", e.target.checked)}
                />
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </div>
              ) : "Generate & Save Schedule"}
            </Button>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
