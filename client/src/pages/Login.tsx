import { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { errorMonitor } from "events";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [users, setUsers] = useState([]);
  

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost/ProgressMonitoringProject/api/users/${username}`
      );
      alert(response.data.selectedTech); 
         
      localStorage.setItem("user", JSON.stringify(response.data));

      const user1 = localStorage.getItem("user");
      if (user1) {
        const userJ = JSON.parse(user1);
        alert(userJ.password);

        if (userJ.password != password) {
          setError("Invalid username or password");
          setLoading(false);
          return;
        }
        var resEnrollData=null;
         var IsFinal =null;
         if (userJ.role === "Student") {  
          try{
           resEnrollData = await axios.get(
            `http://localhost/ProgressMonitoringProject/api/users/by-student/${username}`
          );


          alert(resEnrollData.data.studentID);

       
         
            

        const isGroup= await axios.get(
          `http://localhost/ProgressMonitoringProject/api/users/IsInGroup/${username}`
        );
        alert(isGroup.data);
        if (isGroup.data) {
          

         IsFinal = await axios.get(
        `http://localhost/ProgressMonitoringProject/api/users/IsFinalized/${username}`
      );
alert(IsFinal.data.isFinalized);
    }else{
alert("You are not in a group yet. Please create or join a group to proceed.");
      setLocation("/student/group-setup"); 
    }
          }catch{ 
  
setError("YOU ARE NOT ENROLLED IN FYP. Please contact administration.");
          }
  
}    
  

         if (userJ.role === "Student" && userJ.selectedTech===null) setLocation("/select-tech");
         if (userJ.role === "Student" && userJ.selectedTech!==null && IsFinal?.data.isFinalized=== 1 ) setLocation("/student/dashboard"); 
         if (userJ.role === "Student" && userJ.selectedTech!==null && IsFinal?.data.isFinalized=== 0 ) setLocation("/group/manage"); 

         if (userJ.role === "Committee")
          setLocation("/committee/dashboard");
         if (userJ.role === "Supervisor")
          setLocation("/supervisor/dashboard");
         if (userJ.role === "QueueHandler")
          setLocation("/queue/dashboard");
         if (userJ.role === "CommitteeHead")
          setLocation("/director/dashboard");
         if (userJ.role === "DataCell")
          setLocation("/datacell/dashboard");
         
        
         
      }
    } catch {
      setError("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-bold font-heading">
            BIIT FYP Monitor
          </h1>
          <p className="text-sm text-muted-foreground">
            Project Progress Tracking System
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full h-12 text-base"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Forgot password?
          </p>
        </div>
      </div>
    </div>
  );
}
