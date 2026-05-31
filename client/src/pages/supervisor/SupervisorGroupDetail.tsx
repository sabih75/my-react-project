import { useState, useEffect } from "react";
import { AppBar } from "@/components/AppBar";
import { 
  Mail, 
  Trash2, 
  UserPlus, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Users,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useParams, useLocation } from "wouter";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorGroupDetail() {
  const { groupId, fypType } = useParams();
  const [, setLocation] = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [committeeMeetings, setCommitteeMeetings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [remarksHistory, setRemarksHistory] = useState<any[]>([]);

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "members") {
        const res = await axios.get(`${API_BASE}/committee-meetings/groups-details/${groupId}`);
        setGroup(res.data);
      } else if (activeTab === "meetings") {
        const res = await axios.get(`${API_BASE}/supervisor/getSupervisorMeetings/${user.id}/${fypType}`);
        setMeetings(res.data.filter((m: any) => m.GroupId === parseInt(groupId || "0")));
        const committeeRes = await axios.get(`${API_BASE}/supervisor/get-committee-meetings/${groupId}`);
        setCommitteeMeetings(committeeRes.data);
      } else if (activeTab === "tasks") {
        const res = await axios.get(`${API_BASE}/supervisor/GroupTasks/${groupId}`);
        setTasks(res.data);
      } else if (activeTab === "remarks") {
        const res = await axios.get(`${API_BASE}/supervisor/get-all-remarks-history/${groupId}`);
        setRemarksHistory(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <AppBar title="Group Management" showBack />

        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* ================= GROUP HEADER ================= */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">Group {groupId}</h2>
                  <Badge className="bg-primary/10 text-primary border-none">{fypType}</Badge>
                </div>
                <p className="text-muted-foreground font-medium">{group?.projectTitle || "Loading project..."}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setLocation(`/supervisor/schedule-meetings?groupId=${groupId}`)}
                  className="rounded-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Schedule
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation(`/supervisor/assign-task?groupId=${groupId}`)}
                  className="rounded-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Task
                </Button>
              </div>
            </div>
          </div>

          {/* ================= TABS NAVIGATION ================= */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-12 bg-card border p-1 rounded-xl shadow-sm">
              <TabsTrigger value="members" className="rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4" /> <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="meetings" className="rounded-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Meetings</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="remarks" className="rounded-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Remarks</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* MEMBERS CONTENT */}
              <TabsContent value="members" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group?.members.map((member: any, index: number) => (
                    <div key={index} className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                          {member.studentName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-base">{member.studentName}</p>
                          <p className="text-xs text-muted-foreground">{member.RegNum}</p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" /> {member.Email || "No Email"}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                          <span className="text-xs font-bold text-primary">{member.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${member.progress || 0}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* MEETINGS CONTENT */}
              <TabsContent value="meetings" className="space-y-6">
                
                {/* 1. SUPERVISOR MEETINGS */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    My Scheduled Meetings
                  </h3>
                  {meetings.length === 0 && !loading ? (
                    <p className="text-sm text-muted-foreground bg-card border border-dashed rounded-xl p-6 text-center">
                      No supervisor meetings found for this group.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {meetings.map((m: any) => (
                        <div key={m.Id} className="bg-card border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{m.Title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {new Date(m.Date).toLocaleDateString()} at {m.Time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={m.status === "Completed" ? "default" : "secondary"} className="text-xs font-semibold">
                              {m.status}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setLocation(`/supervisor/meeting-details?meetingId=${m.Id}`)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. COMMITTEE EVALUATION MEETINGS */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Committee Evaluation Meetings
                  </h3>
                  {committeeMeetings.length === 0 && !loading ? (
                    <p className="text-sm text-muted-foreground bg-card border border-dashed rounded-xl p-6 text-center">
                      No committee evaluation meetings scheduled for this group.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {committeeMeetings.map((c: any) => (
                        <div key={c.id} className="bg-card border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{c.MeetingTitle}</p>
                              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                                <span><Clock className="w-3 h-3 inline mr-1" /> {c.Date} at {c.Time}</span>
                                <span>•</span>
                                <span>Venue: {c.Venue}</span>
                              </p>
                            </div>
                          </div>
                          <div>
                            <Badge 
                              className={`text-xs font-semibold px-2.5 py-0.5 ${
                                c.Status === "Completed" ? "bg-emerald-500 text-white" :
                                c.Status === "In Progress" ? "bg-blue-500 text-white animate-pulse" :
                                "bg-amber-500 text-white"
                              }`}
                            >
                              {c.Status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TASKS CONTENT */}
              <TabsContent value="tasks" className="space-y-4">
                {tasks.length === 0 && !loading ? (
                  <div className="text-center py-10 bg-card border rounded-xl border-dashed">
                    <p className="text-muted-foreground">No tasks assigned to this group yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((t: any) => (
                      <div key={t.id} className="bg-card border rounded-xl p-4 shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">
                            {t.AssignedType}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground font-bold">DUE: {new Date(t.dueDate).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-sm mb-1">{t.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-[10px] font-medium text-primary">Assigned to: {t.name || "Group"}</span>
                          <Badge className={t.Status === "Completed" ? "bg-green-500" : "bg-yellow-500"}>
                            {t.Status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* REMARKS CONTENT */}
              <TabsContent value="remarks" className="space-y-4">
                {remarksHistory.length === 0 && !loading ? (
                  <div className="text-center py-10 bg-card border rounded-xl border-dashed">
                    <p className="text-muted-foreground">No remarks history available.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-8">
                    {remarksHistory.map((r: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2 hover:shadow transition-shadow">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={r.Type === "Meeting" ? "default" : "secondary"} className="text-[10px]">
                                {r.Type}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                For: {r.Target}
                              </Badge>
                              <span className="text-xs font-semibold text-foreground">
                                {r.Context}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                              {new Date(r.Date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm italic text-foreground bg-muted/20 rounded-lg p-3 border border-border/50">
                            "{r.Remarks}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </SupervisorLayout>
  );
}