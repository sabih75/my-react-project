import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function StudentTechSelection() {
  const [, setLocation] = useLocation();
  const studentId = "2018-ARID-0996";

  const [selectedTech, setSelectedTech] = useState("");
  const [customTech, setCustomTech] = useState("");
  // const [technologies,setTechnologies] = useState([]);

  const [technologies, setTechnologies] = useState<any[]>([]);
  useEffect(() => {
    axios.get(`http://localhost/ProgressMonitoringProject/api/users/allTech`).then(res => setTechnologies(res.data))
      .catch(err => console.error(err));
  }, []);


  const handleSave = () => {
    if (!selectedTech) return alert("Please select a technology");

    let finalTech = selectedTech;
    if (selectedTech === "Any Other Web Technology") {
      if (!customTech.trim())
        return alert("Please enter your technology");
      finalTech = customTech;
    }

    localStorage.setItem(
      `studentTech-${studentId}`,
      JSON.stringify({ technology: finalTech })
    );
    const user1 = localStorage.getItem("user");
    const userJ = JSON.parse(user1 || "{}");

    axios.post(
      `http://localhost/ProgressMonitoringProject/api/users/UpdateSelectedTech/${userJ.id}`,
      { selectedTech: finalTech }
    );

    setLocation("/student/group-setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-xl bg-card border rounded-xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Select Your FYP Technology
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {technologies.map((tech) => (
            <Button
              key={tech.id}
              variant={selectedTech === tech.id ? "default" : "outline"}
              onClick={() => setSelectedTech(tech.id)}
            >
              {tech.name}
            </Button>
          ))}
        </div>

        {selectedTech === "Any Other Web Technology" && (
          <Input
            placeholder="Enter technology"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
          />
        )}

        <Button className="w-full" onClick={handleSave}>
          Continue
        </Button>
      </div>
    </div>
  );
}
