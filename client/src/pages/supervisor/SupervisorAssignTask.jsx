"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorAssignTask() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const paramGroupId = searchParams.get("groupId");
  const paramMeetingId = searchParams.get("meetingId");

  const supervisorId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : "S001";

  const [fypType, setFypType] = useState("FYP-1");
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(paramGroupId || "");

  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(paramMeetingId || "none");

  const [assigneeType, setAssigneeType] = useState("group");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPptRequired, setIsPptRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD GROUPS ---------------- */
  useEffect(() => {
    axios
      .get(`${API_BASE}/supervisor/GetSupervisorGroups/${supervisorId}/${fypType}`)
      .then(res => {
        setGroups(res.data);
        setSelectedGroupId("");
      })
      .catch(console.error);
  }, [fypType, supervisorId]);

  /* ---------------- LOAD MEMBERS + MEETINGS ---------------- */
  useEffect(() => {
    if (!selectedGroupId) return;

    setSelectedMemberId("");

    Promise.all([
      axios.get(`${API_BASE}/supervisor/GetGroupStudents/${selectedGroupId}`),
      axios.get(`${API_BASE}/supervisor/getSupervisorMeetings/${supervisorId}/${fypType}`)
    ])
      .then(([studentsRes, meetingsRes]) => {
        setMembers(studentsRes.data);
        setMeetings(
          meetingsRes.data.filter(m => m.GroupId === parseInt(selectedGroupId))
        );
      })
      .catch(console.error);
  }, [selectedGroupId, supervisorId, fypType]);

  /* ---------------- MEETING AUTO-FILL ---------------- */
  const handleMeetingChange = (val) => {
    setSelectedMeetingId(val);

    if (val === "none") return;

    const meeting = meetings.find(m => m.Id.toString() === val);
    if (!meeting) return;

    setTitle(meeting.Title || "");
    setDescription(meeting.Description || "");
    if (meeting.Date) {
      setDueDate(new Date(meeting.Date).toISOString().split("T")[0]);
    }
  };

  // ✅ Auto-fill if pre-selected from URL
  useEffect(() => {
    if (selectedMeetingId !== "none" && meetings.length > 0) {
      handleMeetingChange(selectedMeetingId);
    }
  }, [meetings, selectedMeetingId]);

  /* ---------------- SAVE TASK ---------------- */
  const handleSave = async () => {
    if (!selectedGroupId || !title || !dueDate) {
      alert("Group, Title and Due Date are required");
      return;
    }

    if (assigneeType === "individual" && !selectedMemberId) {
      alert("Please select a student");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        Title: title,
        Description: description,
        DueDate: new Date(dueDate).toISOString(), // ✅ FIX
        SupervisorId: supervisorId,
        GroupId: parseInt(selectedGroupId),
        AssigneeType: assigneeType,
        StudentId: assigneeType === "individual" ? selectedMemberId : null,
        IsPptRequired: Boolean(isPptRequired)
      };

      await axios.post(`${API_BASE}/supervisor/assign-task`, payload);

      alert("Task Assigned Successfully ✅");
      setLocation("/supervisor/tasks");
    } catch (err) {
      console.error(err);
      alert("Failed to assign task ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <AppBar title="Assign New Task" showBack />

        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">

            {/* FYP PHASE SELECT */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subject Type</Label>
              <Tabs value={fypType} onValueChange={setFypType} className="w-full">
                <TabsList className="grid grid-cols-2 h-11 bg-muted p-1">
                  <TabsTrigger value="FYP-1" className="rounded-md">FYP-1</TabsTrigger>
                  <TabsTrigger value="FYP-2" className="rounded-md">FYP-2</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* GROUP SELECT */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Target Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a project group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(g => (
                    <SelectItem key={g.GroupId} value={g.GroupId.toString()}>
                      Group {g.GroupId} - {g.ProjectTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroupId && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">

                {/* OPTIONAL MEETING LINK */}
                <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-bold text-primary">Base Task on Meeting (Optional)</Label>
                  </div>
                  <Select value={selectedMeetingId} onValueChange={handleMeetingChange}>
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Choose a recent meeting to auto-fill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No Meeting Link --</SelectItem>
                      {meetings.map(m => (
                        <SelectItem key={m.Id} value={m.Id.toString()}>
                          {m.Title} ({new Date(m.Date).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">Selecting a meeting will automatically fill the title and description.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ASSIGNEE TYPE */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assignee Type</Label>
                    <Tabs value={assigneeType} onValueChange={setAssigneeType} className="w-full">
                      <TabsList className="grid grid-cols-2 h-11 bg-muted p-1">
                        <TabsTrigger value="group">Group</TabsTrigger>
                        <TabsTrigger value="individual">Student</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* MEMBER SELECT (If individual) */}
                  {assigneeType === "individual" && (
                    <div className="space-y-2 animate-in zoom-in-95 duration-200">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Student</Label>
                      <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose student" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => (
                            <SelectItem key={m.RegNum} value={m.RegNum}>
                              {m.StudentName} ({m.RegNum})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* TASK DETAILS */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Task Title</Label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g., Complete Chapter 3 Documentation"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Detail the expectations for this task..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="flex items-end pb-1">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl w-full">
                        <Checkbox
                          id="ppt"
                          checked={isPptRequired}
                          onCheckedChange={v => setIsPptRequired(!!v)}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="ppt" className="text-sm font-medium cursor-pointer select-none">PPT Presentation Required</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                  onClick={handleSave}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Assigning...
                    </div>
                  ) : "Assign Task Now"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}