import StudentLayout from "../student/StudentLayout";
import { AppBar } from "@/components/AppBar";
import { Calendar, Clock, MapPin, MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MeetingDetail() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const { id, type, groupId } = useParams();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMeetingDetail();
  }, [id]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost/ProgressMonitoringProject/api/committee-meetings/schedule/${id}`);
      setMeeting(res.data);
    } catch (err) {
      console.error("Failed to fetch meeting detail:", err);
      setMeeting(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scheduleId", id || "");

    try {
      setUploading(true);
      await axios.post(
        "http://localhost/ProgressMonitoringProject/api/committee-meetings/upload-ppt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("File uploaded successfully ✅");
      setFile(null);
      fetchMeetingDetail();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <AppBar title="Meeting Details" showBack />
        <div className="p-6 text-center text-muted-foreground">Loading meeting details...</div>
      </StudentLayout>
    );
  }

  if (!meeting) {
    return (
      <StudentLayout>
        <AppBar title="Meeting Details" showBack />
        <div className="p-6 text-center text-muted-foreground">No meeting data found.</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <AppBar title="Meeting Details" showBack />

      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">
            {meeting.title}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(meeting.date).toDateString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {meeting.time}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {meeting.location || "Not Specified"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MessageCircleIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {meeting.description || "No description provided."}
              </span>
            </div>
          </div>
        </div>

        {/* Upload File Section */}
        {meeting.isFileRequired && (
          <div className="bg-card border border-card-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-md text-foreground">Upload Presentation PPT</h3>
            
            {meeting.filePath ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <p className="text-sm text-emerald-700 font-medium">✓ A presentation file is currently uploaded.</p>
                <a
                  href={`http://localhost/ProgressMonitoringProject${meeting.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline font-semibold"
                >
                  Download / View PPT File
                </a>
              </div>
            ) : (
              <p className="text-sm text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ No presentation file uploaded yet. Please upload your presentation PPT below.
              </p>
            )}

            <div className="space-y-3">
              <input
                type="file"
                accept=".ppt,.pptx,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="w-full border rounded p-2 text-sm bg-background"
              />

              <Button
                className="w-full font-semibold"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading File..." : "Upload File"}
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full font-semibold"
          onClick={() => setLocation(`/queue/assignment/${type}/${groupId}`)}
        >
          View Queue
        </Button>
      </div>
    </StudentLayout>
  );
}