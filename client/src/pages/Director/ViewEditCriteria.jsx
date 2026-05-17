import { useEffect, useState } from "react";
import axios from "axios";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Pencil, Save } from "lucide-react";
const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function ViewEditCriteria() {
  const sessionId = 13;
  const [criteria, setCriteria] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // 🔹 LOAD DATA
  useEffect(() => {


    axios.get(`http://localhost/ProgressMonitoringProject/api/committee-meetings/GetCriteriaFyp1/${sessionId}`)
      .then(res => {
        setCriteria(res.data.map(p => ({
          ...p,
          selectedMembers: p.evaluators || []
        })));
      });

    axios.get("http://localhost/ProgressMonitoringProject/api/committee-meetings/GetComitteeMembers")
      .then(res => setCommitteeMembers(res.data));
  }, []);

  // 🔹 HANDLERS
  const updateParam = (id, field, value) => {
    setCriteria(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const updateSubParam = (pid, sid, field, value) => {
    setCriteria(prev =>
      prev.map(p =>
        p.id === pid
          ? {
            ...p,
            subParameters: p.subParameters.map(s =>
              s.id === sid ? { ...s, [field]: value } : s
            )
          }
          : p
      )
    );
  };

  const toggleMember = (pid, mid) => {
    setCriteria(prev =>
      prev.map(p =>
        p.id === pid
          ? {
            ...p,
            selectedMembers: p.selectedMembers.includes(mid)
              ? p.selectedMembers.filter(m => m !== mid)
              : [...p.selectedMembers, mid]
          }
          : p
      )
    );
  };

  // 🔹 UPDATE
  const handleUpdate = () => {
    const payload = criteria.map(p => ({
      id: p.id,
      name: p.name,
      percentage: Number(p.percentage),
      allowEvaluation: p.allowEvaluation,
      evaluators: p.selectedMembers,
      subParameters: p.subParameters.map(s => ({
        name: s.name,
        percentage: Number(s.percentage)
      }))
    }));

    axios.post(
      `http://localhost/ProgressMonitoringProject/api/committee-meetings/EditCriteriaFyp1/${sessionId}`,
      payload
    )
      .then(() => {
        alert("Updated Successfully ✅");
        setEditMode(false);
      })
      .catch((err) => {
        const errorData = err.response?.data;
        const detailedMsg = typeof errorData === 'string'
          ? errorData
          : (errorData?.Message || errorData?.ExceptionMessage || "Update failed ❌");

        alert(detailedMsg);
      });
  };

  return (
    <MobileLayout>
      <AppBar title="View Criteria" showBack />

      <div className="p-4 space-y-4">
        <Button variant="outline" onClick={() => setEditMode(!editMode)}>
          <Pencil className="w-4 h-4 mr-2" />
          {editMode ? "Cancel Edit" : "Edit Criteria"}
        </Button>

        {criteria.map(param => (
          <div key={param.id} className="p-4 border rounded-xl space-y-3">
            <Input disabled={!editMode} value={param.name}
              onChange={e => updateParam(param.id, "name", e.target.value)} />

            <Input disabled={!editMode} type="number" value={param.percentage}
              onChange={e => updateParam(param.id, "percentage", e.target.value)} />

            {param.allowEvaluation && (
              <div className="space-y-2">
                <Label><Users className="inline w-4 h-4 mr-1" /> Evaluators</Label>
                {committeeMembers.map(m => (
                  <div key={m.id} className="flex justify-between">
                    <span>{m.name}</span>
                    <input
                      type="checkbox"
                      disabled={!editMode}
                      checked={param.selectedMembers.includes(m.id)}
                      onChange={() => toggleMember(param.id, m.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {param.subParameters.map(sub => (
              <div key={sub.id} className="flex gap-2">
                <Input disabled={!editMode} value={sub.name}
                  onChange={e => updateSubParam(param.id, sub.id, "name", e.target.value)} />
                <Input disabled={!editMode} type="number" value={sub.percentage}
                  onChange={e => updateSubParam(param.id, sub.id, "percentage", e.target.value)} />
              </div>
            ))}
          </div>
        ))}

        {editMode && (
          <Button onClick={handleUpdate}>
            <Save className="w-4 h-4 mr-2" /> Update Criteria
          </Button>
        )}
      </div>
    </MobileLayout>
  );
}