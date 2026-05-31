import React, { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { 
  Lightbulb, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Bookmark
} from "lucide-react";
import SupervisorLayout from "./SupervisorLayout";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SuggestProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State Management
  const [title, setTitle] = useState("");
  const [objectives, setObjectives] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a descriptive project title.",
        variant: "destructive"
      });
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast({
        title: "Session Expired",
        description: "Please login again to suggest a project.",
        variant: "destructive"
      });
      return;
    }

    const supervisorId = JSON.parse(userStr).id;

    setLoading(true);
    try {
      const payload = {
        Title: title,
        Objectives: objectives,
        SupervisorId: supervisorId,
        ProjectStatus: isActive
      };

      const res = await axios.post(`${API_BASE}/supervisor/suggest-project`, payload);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        toast({
          title: "Suggestion Submitted!",
          description: "Your project idea has been successfully offered and registered.",
        });

        // Reset form after a brief delay
        setTimeout(() => {
          setTitle("");
          setObjectives("");
          setIsActive(true);
          setSuccess(false);
          setLocation("/supervisor/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit project suggestion:", error);
      toast({
        title: "Submission Failed",
        description: "An error occurred while saving in db. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorLayout>
      <div className="bg-muted/40 min-h-screen pb-12">
        <AppBar title="Suggest Project Idea" showBack />

        <div className="max-w-xl mx-auto p-4 md:p-6 mt-4">
          
          {/* Main Card Container */}
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
            
            {/* Feedback success overlay */}
            {success && (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h4 className="font-extrabold text-xl text-emerald-800">Idea Registered!</h4>
                <p className="text-sm font-semibold text-muted-foreground mt-2 leading-relaxed max-w-[280px]">
                  Your suggested project has been successfully saved to the active session list in the database.
                </p>
              </div>
            )}

            {/* Mockup-Matching Info Banner */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-blue-800">New Idea Suggestion</h5>
                <p className="text-xs font-medium text-blue-600/90 leading-relaxed">
                  Submit a project idea. Once submitted, it will be listed under Offered Projects for student groups to allocate.
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-primary" /> Project Title
                </label>
                <Input
                  placeholder="Enter a descriptive title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary h-12 text-sm font-semibold"
                  disabled={loading}
                />
              </div>

              {/* Objectives / description textarea */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Objectives & Description
                </label>
                <Textarea
                  placeholder="List key goals, scope, and technical requirements..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary min-h-[140px] text-sm font-medium leading-relaxed"
                  disabled={loading}
                />
              </div>

              {/* Styled Mockup Switch (Active Switch) */}
              <div className="flex justify-between items-center bg-muted/15 border rounded-2xl p-4 transition-all duration-200">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-foreground">Set as Active Idea</p>
                  <p className="text-xs font-semibold text-muted-foreground leading-normal">
                    Allows instant discovery in student allocation search
                  </p>
                </div>
                
                {/* Visual Switch */}
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none shrink-0 ${
                    isActive ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  disabled={loading}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                      isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 shadow-md rounded-2xl font-bold bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting suggestion...
                  </>
                ) : (
                  "Submit Suggestion"
                )}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
