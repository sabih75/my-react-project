import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { add } from "date-fns";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function ManageGroup() {
  const [, setLocation] = useLocation();
const [showAddMembers, setShowAddMembers] = useState(false);

  const [group, setGroup] = useState<any>(null);
    const [session, setSession] = useState<any>(null);  

    const [search, setSearch] = useState("");
      const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [section, setSection] = useState("ALL");

  const [technology, setTechnology] = useState<any>(null);
  const [department, setDepartment] = useState("ALL");

  const [requests, setRequests] = useState<any[]>([]);
  const [newMembers, setNewMembers] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loggedStudent, setLoggedStudent] = useState<any>(null);
  const [isAdmin, setisAdmin] = useState<any>(false);
  
// var IsAdmin =false;
  useEffect(() => {
     const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const student = JSON.parse(storedUser);
  setLoggedStudent(student);
axios.get(`${API_BASE}/users/IsAdmin/${student.regNum}`)
    .then((res) => 
                setisAdmin(res.data));
    
    axios
      .get(`${API_BASE}/users/StudentByTech/${technology}/${student.regNum}`)
      .then((res) => {
       setStudents(res.data);
      })
      .catch(() => alert("Unable to fetch students"));
  
    axios.get(`${API_BASE}/users/GetGroupRequests/${student.regNum}`)
      .then((res) => setRequests(res.data))
      .catch(() => alert("Unable to fetch students"));
    
    axios
      .get(`${API_BASE}/users/GetMyGroup/${student.regNum}`)
      .then((res) => setGroup(res.data))
      .catch(() => alert("Failed to load group"));
      axios.get(`${API_BASE}/users/CurrentSession`)
      .then((res) => {
       setSession(res.data.id);
      })
      .catch(() => alert("Unable to fetch students"));  
axios
    .get(`${API_BASE}/users/StudentDetails/${student.regNum}`)
    .then((res) => {
      const studentData = res.data[0]; // ✅ array → object

       // if later you want to list students
      setTechnology(studentData.TechnologyName); 
      setDepartment(studentData.DepartmentName);
setSection(studentData.SectionName);
    })
    .catch(() => {
      alert("Failed to load student details");
    });
      
  }, []);
 

  // ================= ADD MEMBERS =================
 const addMembers = () => {
  setShowAddMembers(true);
};


  // ================= REMOVE MEMBER =================
  const removeMember = (regNum: string) => {
    
    axios
      .delete(`${API_BASE}/users/RemoveGroupMember`, {
        data: { groupId: group.groupId, MemberRegNum: regNum },
      })
      .then(() => alert("Member removed ❌"));
  };
  
 const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNum.includes(search);

    // ❌ exclude logged-in student
    const notSelf = s.regNum !== loggedStudent?.regNum;

    return matchSearch && notSelf ;
  });
const toggleSelect = (regNum: string) => {
    setSelectedMembers((prev) =>
      prev.includes(regNum)
        ? prev.filter((m) => m !== regNum)
        : [...prev, regNum]
    );
  };
  const sendRequests = () => {
  if (selectedMembers.length === 0) {
    alert("Please select at least one student ❌");
    return;
  }

  axios.post(`${API_BASE}/users/CreateGroup`, {
    createdBy: loggedStudent.regNum,
    supervisorId: null, 
    projectId:null,
    isFinalized: 0,
    createdSession: session,  
  }).then(() => {
    alert("Group created Successfully ✅");
  }).catch(() => alert("Failed to send request"));

  axios.post(`${API_BASE}/users/CreateGroupRequest`, {
      fromRegNum: loggedStudent.regNum,
      sessionId: session,
      members: selectedMembers,
    }).then((res) => {
      alert("Group request sent ✅");
      setLocation("/group/manage"); 
    }).catch(() => alert("Failed to send request"));
};

  // ================= FINALIZE =================
  const finalizeGroup = () => {
    if (group.members.length < 3) {
      alert("⚠️ A group must have at least 3 members to finalize. Please add more members.");
      return;
    }

    axios
      .post(`${API_BASE}/users/FinalizeGroup`, {
        groupId: group.groupId,
      })
      .then(() => {
        alert("Group finalized 🎉");
           setLocation("/student/dashboard");
      })
      .catch(() => alert("Failed to finalize group ❌"));
  };

  if (!group) return null;

  // const isAdmin = loggedStudent.regNum === group.studentId && group.members.isAdmin===1;
// alert(isAdmin);
 return (
  <div className="max-w-5xl mx-auto p-6 space-y-8">
    <h1 className="text-3xl font-bold">Manage Group</h1>

    {/* ================= GROUP MEMBERS ================= */}
    <div className="bg-white rounded-lg shadow p-5 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        👥 Group Members
        <span className="text-sm font-normal text-muted-foreground ml-auto">
          {group.members.length} / 4 Members
        </span>
      </h2>

      {group.members.map((m: any) => {
        const isMe = m.regNum === loggedStudent?.regNum;
        return (
          <div
            key={m.regNum}
            className={`flex justify-between items-center border rounded-md p-3 transition-colors ${
              isMe ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-card"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{m.regNum}</p>
                {isMe && (
                  <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {m.isAdmin === 1 ? "(Admin)" : "(Member)"}
              </p>
            </div>

            {isAdmin && m.regNum !== group.studentId && !isMe && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeMember(m.regNum)}
              >
                Remove
              </Button>
            )}
          </div>
        );
      })}
    </div>
{isAdmin && (
      <div className="bg-white rounded-lg shadow p-5">
        <Button className="w-full text-lg" onClick={addMembers} disabled={group.members.length >= 4}>
          {group.members.length >= 4 ? "Group is Full" : "Add More Members"}
        </Button>
      </div>
    )}

   {isAdmin && showAddMembers && (
  <div className="bg-white rounded-lg shadow p-5 space-y-4">
    <h2 className="text-xl font-semibold">➕ Add Members</h2>

    <input
      type="text"
      placeholder="Search by name or reg #"
      className="w-full border rounded p-2"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <div className="space-y-3 max-h-96 overflow-y-auto">
      {filteredStudents.length === 0 && (
        <p className="text-gray-500 text-sm">No students found</p>
      )}

      {filteredStudents.map((s) => (
        <div
          key={s.regNum}
          className="flex items-center justify-between p-4 border rounded"
        >
          <div>
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm">{s.regNum}</p>
            <p className="text-sm">CGPA: {s.currentCGPA}</p>
          </div>

          <Checkbox
            checked={selectedMembers.includes(s.regNum)}
            onCheckedChange={() => toggleSelect(s.regNum)}
          />
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <Button className="w-full" onClick={sendRequests}>
        Send Group Request
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowAddMembers(false)}
      >
        Cancel
      </Button>
    </div>
  </div>
)}
 {/* ================= REQUESTS ================= */}
    {isAdmin && (
      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📩 Pending Requests
        </h2>

        {requests.filter((r: any) => r.Status === "Pending").length === 0 && (
          <p className="text-gray-500 text-sm">No pending requests</p>
        )}

        {requests
          ?.filter((r: any) => r.Status === "Pending")
          .map((r: any) => (
            <div
              key={r.RequestID}
              className="flex justify-between items-center border rounded-md p-3"
            >
              <span className="font-medium">{r.MemberRegNum}</span>

              <div className="flex gap-2">
                {r.Status}
              </div>
            </div>
          ))}
      </div>
    )}

    {/* ================= FINALIZE ================= */}
    {isAdmin && (
      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <Button 
          className="w-full text-lg shadow-lg shadow-primary/20" 
          onClick={finalizeGroup}
          disabled={group.members.length < 3}
        >
          🚀 Finalize Group
        </Button>
        
        {group.members.length < 3 && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse">
            <span>⚠️ At least 3 members are required to finalize. (Currently {group.members.length}/3)</span>
          </div>
        )}
        
        <p className="text-[11px] text-muted-foreground text-center italic">
          Note: Once finalized, you cannot add or remove members without administration approval.
        </p>
      </div>
    )}
  </div>
);

}
