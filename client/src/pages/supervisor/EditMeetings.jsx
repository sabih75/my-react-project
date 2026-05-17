import { useEffect, useState } from "react";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Trash2, Save, ArrowLeft } from "lucide-react";
import SupervisorLayout from "./SupervisorLayout";
import axios from "axios";
import { useLocation } from "wouter";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function EditMeetings() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const meetingId = searchParams.get("meetingId");

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationVenue, setLocationVenue] = useState("");

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/supervisor/meetings/${meetingId}`);
      const data = res.data;
      setMeeting(data);
      setTitle(data.title || "");
      setDate(new Date(data.date).toISOString().split("T")[0]);
      setTime(data.time || "");
      setDescription(data.description || "");
      setLocationVenue(data.venue || "");
    } catch (error) {
      console.error("Failed to fetch meeting", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/supervisor/update-meeting/${meetingId}`, {
        title,
        date,
        time,
        description,
        venue: locationVenue
      });
      alert("Meeting Updated Successfully ✅");
      window.history.back();
    } catch (error) {
      alert("Failed to update meeting ❌");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel and delete this meeting?")) return;
    
    try {
      await axios.delete(`${API_BASE}/supervisor/delete-meeting/${meetingId}`);
      alert("Meeting Cancelled and Deleted 🗑️");
      window.history.back();
    } catch (error) {
      alert("Failed to cancel meeting ❌");
    }
  };

  if (loading) return <SupervisorLayout><div className="p-10 text-center animate-pulse">Loading meeting details...</div></SupervisorLayout>;

  return (
    <SupervisorLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <AppBar 
          title="Edit Meeting" 
          showBack 
          actions={
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          }
        />

        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Refine Meeting</h2>
                <p className="text-xs text-muted-foreground">Adjust the schedule or details for Group {meeting?.groupID}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                  placeholder="e.g., Progress Review"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue / Location</Label>
                <Input
                  value={locationVenue}
                  onChange={(e) => setLocationVenue(e.target.value)}
                  className="h-11"
                  placeholder="Room number or meeting link"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agenda / Instructions</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="What needs to be discussed?"
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 h-12 font-bold shadow-lg shadow-primary/20" 
                onClick={handleUpdate}
              >
                <Save className="w-4 h-4 mr-2" /> Save Updates
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 h-12 font-bold" 
                onClick={handleCancel}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Cancel Meeting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
