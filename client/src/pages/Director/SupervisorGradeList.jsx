import { useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { useLocation,useParams } from "wouter";
import { useEffect } from "react";
import axios from "axios";
const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorGradeList() {
  const [program, setProgram] = useState("FYP-1");
 const { supervisorId, grade } = useParams();
  const [, setLocation] = useLocation();
  const [studentData,setStudentData]=useState([]);


useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {

alert(supervisorId);
  
      const res = await axios.get(
        `${API_BASE}/grading-analysis/GetGradeStudents/${supervisorId}/${grade}`
      );

      setStudentData(res.data);
      alert("h");
    } catch (error) {
      alert("Failed to load group");
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };
  return (
    <>
    <div>

<div>
{studentData.map((student)=>(
<div key={student.StudentId} >
<h1>
  RegNum
</h1>
{student.StudentId}
<h1>
Name</h1>
{student.StudentName}
<h1>
ProjectName</h1>
{student.Project}

</div>




))}





</div>
    </div>
    </>
  );
}