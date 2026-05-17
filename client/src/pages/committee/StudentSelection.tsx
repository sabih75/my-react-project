import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import CommitteeHeadLayout from "../Director/ComitteeHeadLayoutScreen";
import axios from "axios";
import CommitteeLayout from "./CommitteeLayout";
const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function StudentSelection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [fypType,SetFypType]=useState("FYP-1");
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
useEffect(() => {
  
  fetchStudents();
   
}, []);

const fetchStudents = async () => {
  try {
  const userType=localStorage.getItem("type");
    if(userType){
const type = JSON.parse(userType);


   
    const res = await axios.get(`${API_BASE}/committee-meetings/all-students-with-group/${type}`);
    setStudents(res.data);
    }
  } catch (error) {
    console.error("Failed to fetch students", error);
  }
};
  
 const filteredStudents = students
  .filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.regNum.includes(searchQuery)
  )
  .filter((s) =>
    showUnassignedOnly ? s.group === 0 : true
  );
  const handleSelect = (student: any) => {
    if (student.group === 0) {
      // navigate to group assignment page and pass student info
setLocation(`/group-assignment/${student.regNum}`);
      localStorage.setItem("selectedStudent", JSON.stringify(student));
    } else {
      alert("This student is already assigned to a group.");
    }
  };

  return (
    <CommitteeLayout>
      <AppBar title="Student Selection" showBack />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-student"
          />
        </div>
        <div className="flex items-center justify-between">
  <h2 className="font-semibold">All Students</h2>

  <Button
    size="sm"
    variant={showUnassignedOnly ? "default" : "outline"}
    onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
  >
    {showUnassignedOnly ? "Unassigned Only" : "All Students"}
  </Button>
</div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">All Students</h2>
          <span className="text-sm text-muted-foreground">
            {filteredStudents.length} students
          </span>
        </div>

        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {student.name
                        .split(" ")
                        .map((n:any) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">RegNum:{student.regNum}</p>
                      <p className="text-xs text-muted-foreground">Cgpa:{student.cgpa}</p>
                      
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Group:{" "}
                    <span
                      className={
                        student.group === 0
                          ? "text-chart-3"
                          : "text-chart-2"
                      }
                    >
                      {student.group}
                    </span>
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid={`button-select-${student.regNum}`}
                  onClick={() => handleSelect(student)}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CommitteeLayout>
  );
}
