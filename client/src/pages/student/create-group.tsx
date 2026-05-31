import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useLocation } from "wouter";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function CreateGroup() {
  // ================= STATES =================
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [gender, setGender] = useState("ALL");

  const [, setLocation] = useLocation();

  const [loggedStudent, setLoggedStudent] = useState<any>(null);
  const [studentSemester, setStudentSemester] = useState<number | null>(null);
  const [technology, setTechnology] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [subject, setSubject] = useState("");

  // ================= DYNAMIC DROPDOWNS STATES =================
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);

  // ================= LOAD INITIAL CONFIG AND LOGGED-IN STUDENT =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const student = JSON.parse(storedUser);
    setLoggedStudent(student);

    // 1️⃣ Fetch Departments from DB
    axios.get(`${API_BASE}/users/getAllDepartments`)
      .then((res) => {
        setDepartmentsList(res.data || []);
      })
      .catch((err) => console.error("Failed to load departments from DB", err));

    // 2️⃣ Fetch raw Section list from DB (e.g. A, B, C)
    axios.get(`${API_BASE}/users/getAllSections`)
      .then((res) => {
        const sorted = (res.data || []).sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        setSectionsList(sorted);
      })
      .catch((err) => console.error("Failed to load sections from DB", err));

    // 3️⃣ Fetch Student Info to pre-populate filters and extract semester
    axios
      .get(`${API_BASE}/users/StudentDetails/${student.regNum}`)
      .then((res) => {
        const studentData = res.data[0]; // ✅ array → object
        if (!studentData) return;

        setTechnology(studentData.TechnologyName);
        setSubject(studentData.Subject);
        setStudentSemester(studentData.semesterNo || null);

        // ✅ Pre-select student's exact department name from DB
        setDepartment(studentData.DepartmentName || "ALL");

        // ✅ Pre-select student's exact section name (e.g. "A" or "B")
        setSection(studentData.SectionName || "ALL");
      })
      .catch(() => {
        alert("Failed to load student details");
      });

    // 4️⃣ Get Current Session
    axios.get(`${API_BASE}/users/CurrentSession`)
      .then((res) => {
        setSession(res.data.id);
      })
      .catch(() => alert("Unable to fetch current session"));
  }, []);

  // ================= LOAD CLASSMATES FROM DB =================
  useEffect(() => {
    if (!technology || !loggedStudent?.regNum) return;
    axios
      .get(`${API_BASE}/users/StudentByTech/${technology}/${loggedStudent.regNum}`)
      .then((res) => {
        setStudents(res.data || []);
      })
      .catch(() => alert("Unable to fetch students"));
  }, [technology, loggedStudent]);

  // ================= FILTER LOGIC =================
  const filteredStudents = students.filter((s) => {
    // Search filter (by name or registration number)
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNum.toLowerCase().includes(search.toLowerCase());

    // Exclude logged-in student
    const notSelf = s.regNum !== loggedStudent?.regNum;

    // Semester filter: Only show classmates who are in the same semester as the logged-in student
    const matchesSemester = !studentSemester || s.semesterNo === studentSemester;

    // Department filter (match exact database department name)
    const matchesDept =
      department === "ALL" ||
      s.DepartmentName === department;

    // Section filter (matches s.SectionName directly to selected section name e.g. "A")
    const matchesSection =
      section === "ALL" ||
      s.SectionName === section;

    // Gender filter
    const matchesGender =
      gender === "ALL" ||
      (s.gender && s.gender.toLowerCase() === gender.toLowerCase());

    return matchSearch && notSelf && matchesSemester && matchesDept && matchesSection && matchesGender;
  });

  // ================= SELECT LOGIC =================
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
      axios.post(`${API_BASE}/users/CreateGroupRequest`, {
        fromRegNum: loggedStudent.regNum,
        sessionId: session,
        members: selectedMembers,
      }).then(() => {
        alert("Group request sent successfully! ✅");
        setLocation("/group/manage");
      }).catch(() => alert("Failed to send request"));
    }).catch(() => alert("Failed to create group"));
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-card border rounded-3xl shadow-xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create New Group</h1>
          <p className="text-sm text-muted-foreground">Select classmates to form your FYP group</p>
        </div>

        {/* Logged Student Tech */}
        <div className="bg-muted/30 border p-4 rounded-2xl">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Selected Technology</label>
          <Input disabled value={technology || "Loading..."} className="mt-1 bg-background font-semibold" />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Search</label>
            <Input
              placeholder="Search by name or reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
            <select
              className="w-full h-11 border rounded-xl px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Section</label>
            <select
              className="w-full h-11 border rounded-xl px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="ALL">All Sections</option>
              {sectionsList.map((sec) => {
                const combo = studentSemester ? `${studentSemester}${sec.name}` : sec.name;
                return (
                  <option key={sec.id} value={sec.name}>
                    {combo}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Gender</label>
            <select
              className="w-full h-11 border rounded-xl px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="ALL">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 bg-card border rounded-2xl border-dashed">
              <p className="text-muted-foreground text-sm">No matchable classmates found.</p>
            </div>
          ) : (
            filteredStudents.map((s) => {
              const studentSectionCombo = s.semesterNo && s.SectionName
                ? `${s.semesterNo}${s.SectionName}`
                : s.SectionName;

              return (
                <div
                  key={s.regNum}
                  onClick={() => toggleSelect(s.regNum)}
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition shadow-sm hover:shadow hover:bg-muted/20 ${selectedMembers.includes(s.regNum)
                      ? "ring-2 ring-primary bg-primary/5 border-primary/20"
                      : "bg-card"
                    }`}
                >
                  <div>
                    <p className="font-bold text-foreground">{s.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
                      <span>{s.regNum}</span>
                      <span>•</span>
                      <span>CGPA: {s.currentCGPA}</span>
                      <span>•</span>
                      <span>{s.DepartmentName}</span>
                      <span>•</span>
                      <span>Sec: {studentSectionCombo || "N/A"}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${s.gender?.toLowerCase() === "male"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-pink-50 text-pink-600"
                        }`}>
                        {s.gender || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedMembers.includes(s.regNum)}
                      onCheckedChange={() => toggleSelect(s.regNum)}
                      className="w-5 h-5 rounded-md"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Button */}
        <Button className="w-full h-12 rounded-2xl shadow-lg shadow-primary/10 text-base font-bold" onClick={sendRequests}>
          Send Group Request
        </Button>
      </div>
    </div>
  );
}
