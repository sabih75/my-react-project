import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Mail, Phone, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import CommitteeLayout from "../committee/CommitteeLayout";
import { useParams } from "wouter";
import { Progress } from "@radix-ui/react-progress";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function DirectorGroupDetail() {
  const {groupId} =useParams();
  const[loggedStudent,setLoggedStudent]=useState();
  const[technology,setTechnology]=useState();
  
  const [isEditing, setIsEditing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
const [technologies, setTechnologies] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({
    studentName: "",
    Cgpa: "",
    RegNum: "",
    Gender: "",
    TechnologyName:"",
    DepartmentName:"",
    SessionName:"",
    studentSection:"",

  });
  const [members, setMembers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
const[supervisor,setSuperVisor]=useState("");
const [search, setSearch] = useState("");
const [selectedStudent, setSelectedStudent] = useState<any>(null);

const filteredStudents = students.filter((student) =>
  student.name.toLowerCase().includes(search.toLowerCase()) ||
  student.regNum.toLowerCase().includes(search.toLowerCase()) ||
  student.TechnologyName.toLowerCase().includes(search.toLowerCase())
);
  // Fetch group details from DB
  useEffect(() => {
   fetchGroupDetails();
  fetchStudents();
  fetchTechnologies();
  }, []);

  const fetchGroupDetails = async () => {
    try {
      // Replace this URL with your actual endpoint for fetching group details
      // and pass necessary params like group ID if required.
      const res = await axios.get(`${API_BASE}/committee-meetings/groups-details/${groupId}`);
      // Example response structure assumption:
      // {
      //   groupName: "Group 1",
      //   projectTitle: "AI-Based Student Management System",
      //   members: [
      //     { name, email, phone, progress }
      //   ]
      // }

      const data = res.data;

      setGroupName(data.groupName);
      setProjectTitle(data.projectTitle);
      setSuperVisor(data.supervisor);
      setMembers(data.members);

    } catch (error) {
      console.error("Failed to fetch group details:", error);
      // Optionally set fallback or show error UI
    }
  };
  const fetchStudents = async () => {
  try {
     axios
      .get(`${API_BASE}/committee-meetings/StudentByGroup/${groupId}`)
      .then((res) => {
       setStudents(res.data);
      })
      .catch(() => alert("Unable to fetch students"));
  } catch (error) {
    console.error("Failed to fetch students");
  }
};
const fetchTechnologies = async () => {
  try {
     axios.get(`http://localhost/ProgressMonitoringProject/api/users/allTech`).then(res => setTechnologies(res.data))
    .catch(err => console.error(err));
  } catch (error) {
    console.error("Failed to fetch technologies");
  }
};

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleViewRemarks = (member: any) => {
    console.log("Viewing remarks for:", member.name);
  };

  const handleAssignTask = (member: any) => {
    console.log("Assigning task to:", member.name);
  };

  const handleRemoveMember = (RegNum:any) => {
     axios
      .delete(`${API_BASE}/users/RemoveGroupMember`, {
        data: { groupId: groupId, MemberRegNum: RegNum },
      })
      .then(() => alert("Member removed ❌"));

              fetchGroupDetails();
fetchStudents();
  };

  const handleAddMember = async () => {
  if (!selectedStudent) {
    alert("Please select a student");
    return;
  }
  alert(selectedStudent.regNum);
alert(groupId);
  
  try {
    // ✅ Call API FIRST
    await axios.post(
      `${API_BASE}/committee-meetings/AddStudentToGroup?groupId=${groupId}&regNum=${selectedStudent.regNum}`
    );
    alert("hehhe");

    // // ✅ Then update UI
    // setMembers((prev) => [
    //   ...prev,
    //   {
    //     RegNum: selectedStudent.regNum,
    //     studentName: selectedStudent.name,
    //     TechnologyName: selectedStudent.TechnologyName,
      
        
    //   },
    // ]);

    // ✅ Clear selection
    setSelectedStudent(null);
    setSearch("");
        fetchGroupDetails();
        fetchStudents();


  } catch (error) {
    alert("Failed to add student ❌");
    console.error(error);
  }
};
  const handleSaveChanges = async () => {
  try {
    const updatedTechnologies = members.map((m) => ({
      RegNum: m.RegNum,
      TechnologyId: m.TechnologyId || m.Technology?.id,
    } ));
alert(updatedTechnologies[0].TechnologyId);
alert(updatedTechnologies[0].RegNum);

    await axios.post(
      `http://localhost/ProgressMonitoringProject/api/students/update-technologies/${groupId}`,
      { Students: updatedTechnologies  }
    );

    alert("Technologies updated successfully ✅");
    setIsEditing(false);

    fetchGroupDetails(); // refresh
  } catch (error) {
    alert("Failed to update technologies ❌");
    console.error(error);
  }
};
  return (
    
    <CommitteeHeadLayout>
      <AppBar title="Group Details" showBack />

      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Group {groupName || "Group"}</h2>
            <p className="text-sm opacity-90">{projectTitle || "No Project"}</p>
            <p className="text-sm opacity-90">{supervisor || "No Supervisor"}</p>
            
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-lg"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel" : "Edit Members"}
          </Button>
        </div>

        {/* Members List */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base">Team Members</h3>
            <Badge variant="secondary">{members.length} members</Badge>
          </div>

          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={index} className="pb-4 border-b border-border last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                      {member.studentName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{member.studentName}</p>
                        <Badge variant="outline" className="text-xs">
                          Member
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {member.Email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress className="w-3 h-3" /> {member.Cgpa}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress className="w-3 h-3" /> {member.DepartmentName} {member.studentSection}
                        </div>
                        <div className="flex items-center gap-2">
                           {isEditing ? (
                            <select
                           value={member.TechnologyId}
                           onChange={(e) => {
                             const techId = Number(e.target.value);
                             const tech = technologies.find(t => t.id === techId);

                             const updated = [...members];
                             updated[index].TechnologyId = techId;           // ✅ store ID
                             updated[index].TechnologyName = tech?.name;     // optional (for UI)

                             setMembers(updated);
                           }}
                           className="border rounded px-2 py-1 text-xs"
                         >
                           {technologies.map((tech) => (
                             <option key={tech.id} value={tech.id}>
                               {tech.name}
                             </option>
                           ))}
                         </select>
                           ) : (
                             <>
                               <Progress className="w-3 h-3" /> {member.TechnologyName}
                             </>
                           )}
                         </div>
                        <div className="flex items-center gap-2">
                          <Progress className="w-3 h-3" /> {member.Gender}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-lg"
                        onClick={() => handleRemoveMember(member.RegNum)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{member.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(member.progress)} transition-all`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member */}
          {isEditing && (
            <div className="mt-5 border-t pt-3 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Add New Member</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
              </div>
              <div className="space-y-3">

  {/* 🔍 Search Input */}
  <Input
    placeholder="Search by name, reg no, technology..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* 📜 Scrollable List */}
  <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">

    {filteredStudents.length === 0 && (
      <div className="p-3 text-sm text-muted-foreground text-center">
        No students found
      </div>
    )}

    {filteredStudents.map((student) => (
      <div
        key={student.regNum}
        onClick={() => setSelectedStudent(student)}
        className={`p-3 cursor-pointer hover:bg-muted transition 
        ${selectedStudent?.regNum === student.regNum ? "bg-primary/10" : ""}`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{student.name}</p>
            <p className="text-xs text-muted-foreground">
              {student.regNum} • {student.TechnologyName}
            </p>
          </div>
        </div>
      </div>
    ))}

  </div>

 {/* ➕ Add Button */}
  <Button
    size="sm"
    variant="secondary"
    disabled={!selectedStudent}
    onClick={() => {
      setSelectedStudent(null);
      setSearch("");
      handleAddMember();
      

    }}
    className="w-full"
  >
    Add Selected Student
  </Button>


</div>

           
            </div>
          )}
        </div>

        {/* Footer */}
        <div>
          {isEditing ? (
            <Button className="w-full" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          ) : (
          <>
          </>
          )}
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}