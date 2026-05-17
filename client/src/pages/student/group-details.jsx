import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import StudentLayout from "../student/StudentLayout";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GroupDetails() {
  const [, setLocation] = useLocation();
const [loggedStudent,SetLoggedStudent] = useState();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const student = JSON.parse(localStorage.getItem("user") || "{}");

      if (!student?.id) {
        alert("Student registration not found.");
        return;
      }
      SetLoggedStudent(student.id);

      const res = await axios.get(
        `${API_BASE}/users/GetMyGroup/${student.id}`
      );

      setGroup(res.data);
    } catch (error) {
      alert("Failed to load group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    alert("Request successfully sent to this group!");
    setLocation("/student/group-setup");
  };

  return (
    <StudentLayout>
      <AppBar title="My Group" showBack />

      <div className="p-6 space-y-5">

        {loading && (
          <p className="text-center text-muted-foreground">
            Loading group details...
          </p>
        )}

        {!loading && !group && (
          <p className="text-center text-muted-foreground">
            You are not assigned to any group.
          </p>
        )}

        {!loading && group && (
          <>
            <h1 className="text-2xl font-bold text-center">
              {group.groupName || `Group ${group.groupId}`}
            </h1>

            <h2 className="text-lg font-semibold mt-4">
              Group Members
            </h2>

            <div className="space-y-3">
              {group.members?.map((m, index) => (
                <div
                  key={index}
                  className="border p-3 rounded-xl bg-card"
                >
                  {m.isAdmin ? (<p style={{ color: "red" }}>(Admin)</p>):(<></>)}
                 
                  <p className="font-semibold">{m.name}</p>
                  {loggedStudent==m.regNum ?(<p className="text-sm" style={{ color: "Green" }} >RegNo: {m.regNum} (You)</p>):(<p className="text-sm">RegNo: {m.regNum}</p>)}
                  

                  <p className="text-sm">
                    Technology: {m.technology}
                  </p>
                  <p className="text-sm">CGPA: {m.Cgpa}</p>
                </div>
              ))}
            </div>

            
          </>
        )}

      </div>
    </StudentLayout>
  );
}