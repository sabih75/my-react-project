import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Users, FileCheck, Search, BookOpen, UserCircle, CheckCircle2 } from "lucide-react";
import CommitteeLayout from "./CommitteeLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function GroupAssignmentScreen2() {
  const { meetingId, groupId } = useParams();
  const [, setLocation] = useLocation();

  const [group, setGroup] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [remarks, setRemarks] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch group students
      const groupRes = await axios.get(
        `${API_BASE}/committee-meetings/getSpecificGroup/${groupId}`
      );

      const formattedGroup = {
        id: groupId,
        name: `Group ${groupId}`,
        members: groupRes.data.map((s) => ({
          name: s.studentName,
          regNo: s.studentID,
          technology: s.Tech || "N/A",
          cgpa: s.currentCGPA,
        })),
      };

      setGroup(formattedGroup);

      // Fetch projects
      const projectsRes = await axios.get(
        `${API_BASE}/committee-meetings/getAllOfferedProjects`
      );

      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching allocation data:", error);
    }

    setLoading(false);
  };

  const handleSaveAssignment = async () => {
    if (!selectedProjectTitle) {
      return alert("⚠️ Please select a project before saving.");
    }

    const selectedProject = projects.find(
      (p) => p.Title === selectedProjectTitle
    );

    if (!selectedProject) return;

    try {
      setLoading(true);
      await axios.put(
        `${API_BASE}/committee-meetings/allocateProject`,
        {
          groupId: groupId,
          projectId: selectedProject.ProjectId,
        }
      );

      alert("✅ Project Allocated Successfully");
      setLocation(-1);
    } catch (error) {
      console.error("Allocation error:", error);
      alert("❌ Allocation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommitteeLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500 font-medium">Loading allocation data...</p>
        </div>
      </CommitteeLayout>
    );
  }

  if (!group) {
    return (
      <CommitteeLayout>
        <div className="p-8 text-center text-gray-500">No group data found.</div>
      </CommitteeLayout>
    );
  }

  // 🔎 Filter projects based on Title or Objectives
  const filteredProjects = projects.filter((p) =>
    (p.Title?.toLowerCase() || "").includes(projectSearchTerm.toLowerCase()) ||
    (p.Objectives?.toLowerCase() || "").includes(projectSearchTerm.toLowerCase())
  );

  return (
    <CommitteeLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <button 
            onClick={() => setLocation(-1)} 
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Allocation</h1>
            <p className="text-gray-500 text-sm mt-1">Assigning a new project to {group.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT SIDE - GROUP INFO */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4">
              <Users className="w-5 h-5 text-blue-600" /> Team Members
            </h3>
            
            <div className="space-y-4">
              {group.members.map((m, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <strong className="text-gray-900 block">{m.name}</strong>
                      <span className="text-xs font-mono text-gray-500">{m.regNo}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-sm">
                    <div>
                      <span className="text-gray-500 text-xs block">Technology</span>
                      <span className="font-medium text-gray-800">{m.technology}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">CGPA</span>
                      <span className="font-medium text-gray-800">{m.cgpa}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - ASSIGN PROJECT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ASSIGNMENT ACTION CARD */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm border-blue-100">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-900">
                <FileCheck className="w-5 h-5 text-blue-600" /> Assign Selected Project
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Selected Project</label>
                  <select
                    value={selectedProjectTitle}
                    onChange={(e) => setSelectedProjectTitle(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 transition-all font-medium text-gray-800"
                  >
                    <option value="">-- Choose a project from the list below --</option>
                    {projects.map((proj) => (
                      <option key={proj.ProjectId} value={proj.Title}>
                        {proj.Title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Committee Remarks (Optional)</label>
                  <textarea
                    placeholder="Enter any specific requirements or remarks for this group..."
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 transition-all text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveAssignment}
                  disabled={!selectedProjectTitle || loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" /> 
                  {loading ? "Allocating..." : "Confirm & Save Allocation"}
                </button>
              </div>
            </div>

            {/* PROJECT DISCOVERY */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600" /> Project Discovery Bank
              </h3>

              <div className="relative mb-6">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by title or objectives..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-gray-50 transition-all text-sm"
                />
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredProjects.map((p) => {
                  const isSelected = selectedProjectTitle === p.Title;
                  return (
                    <div
                      key={p.ProjectId}
                      onClick={() => setSelectedProjectTitle(p.Title)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50 shadow-sm" 
                          : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className={`font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                            {p.Title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider">
                            Suggested by: <span className="text-gray-700">{p.SuggestedBy || "Faculty"}</span>
                          </p>
                        </div>
                        {isSelected && (
                          <div className="bg-blue-500 text-white p-1 rounded-full shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      {p.Objectives && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {p.Objectives}
                        </p>
                      )}
                    </div>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No matching projects found.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
