import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useLocation } from "wouter";


import { set } from "date-fns";
import { log } from "console";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function CreateGroup() {
  // ================= STATES =================
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [, setLocation] = useLocation();

  const [section, setSection] = useState("ALL");

  const [loggedStudent, setLoggedStudent] = useState<any>(null);
  const [technology, setTechnology] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [subject, setSubject] = useState("");

  // ================= LOAD LOGGED-IN STUDENT =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const student = JSON.parse(storedUser);
    setLoggedStudent(student);


    axios
      .get(`${API_BASE}/users/StudentDetails/${student.regNum}`)
      .then((res) => {
        const studentData = res.data[0]; // ✅ array → object

        // if later you want to list students
        setTechnology(studentData.TechnologyName);
        alert(studentData.DepartmentName)// ✅ correct
        setDepartment(studentData.DepartmentName);
        setSection(studentData.SectionName);
setSubject(studentData.Subject);
      })
      .catch(() => {
        alert("Failed to load student details");
      });

    axios.get(`${API_BASE}/users/CurrentSession`)
      .then((res) => {
        setSession(res.data.id);
      })
      .catch(() => alert("Unable to fetch students"));


  }, []);


  // ================= LOAD STUDENTS FROM DB =================
  useEffect(() => {
    if (!technology) return;
    axios
      .get(`${API_BASE}/users/StudentByTech/${technology}/${loggedStudent.regNum}`)
      .then((res) => {
        setStudents(res.data);
      })
      .catch(() => alert("Unable to fetch students"));
  });


  // ================= FILTER =================
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNum.includes(search);

    // ❌ exclude logged-in student
    const notSelf = s.regNum !== loggedStudent?.regNum;

    return matchSearch && notSelf;
  });

  // ================= SELECT =================
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
      projectId: null,
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


  // ================= UI =================
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-card border rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Create New Group</h1>

        {/* Logged Student Tech */}
        <div>
          <label className="text-sm font-medium">Technology</label>
          <Input disabled value={technology} />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="ALL">All Departments</option>

            <option value="BSCS">Computer Science</option>
            <option value="BSAI">Artificial Intelligence</option>
            <option value="BSSE">Software Engineering</option>
          </select>

          <select
            className="border rounded px-3 py-2"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="ALL">All Sections</option>
            <option value="7A">7A</option>
            <option value="7B">7B</option>
            <option value="7C">7C</option>
          </select>
        </div>


        <div className="space-y-3">
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

        <Button className="w-full h-12" onClick={sendRequests}>
          Send Group Request
        </Button>
      </div>
    </div>
  );
}
