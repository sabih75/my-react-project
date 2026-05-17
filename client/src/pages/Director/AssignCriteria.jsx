import { useState,useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2 } from "lucide-react";
import axios from "axios";

export default function AssignCriteria() {

  useEffect(() => {
  axios.get("http://localhost/ProgressMonitoringProject/api/committee-meetings/GetComitteeMembers") // dynamic later
    .then(res => setCommitteeMembers(res.data))
    .catch(() => alert("Failed to load members"));
}, []);
  // ================= COMMITTEE MEMBERS =================
const [committeeMembers, setCommitteeMembers] = useState([]);
  // ================= STATE =================
  const [parameters, setParameters] = useState([
    {
      id: Date.now(),
      label: "Pitching",
      percentage: "",
      allowEvaluation: false,
      selectedMembers: [],
      subParameters: [],
    },
  ]);

  // ================= PARAMETER HANDLERS =================
  const updateParam = (id, field, value) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addParameter = () => {
    setParameters((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "",
        percentage: "",
        allowEvaluation: false,
        selectedMembers: [],
        subParameters: [],
      },
    ]);
  };

  const removeParameter = (id) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  // ================= SUB PARAMETER HANDLERS =================
  const addSubParameter = (paramId) => {
    setParameters((prev) =>
      prev.map((p) =>
        p.id === paramId
          ? {
              ...p,
              subParameters: [
                ...p.subParameters,
                { id: Date.now(), label: "", percentage: "" },
              ],
            }
          : p
      )
    );
  };

  const updateSubParam = (paramId, subId, field, value) => {
    setParameters((prev) =>
      prev.map((p) =>
        p.id === paramId
          ? {
              ...p,
              subParameters: p.subParameters.map((s) =>
                s.id === subId ? { ...s, [field]: value } : s
              ),
            }
          : p
      )
    );
  };

  const removeSubParam = (paramId, subId) => {
    setParameters((prev) =>
      prev.map((p) =>
        p.id === paramId
          ? {
              ...p,
              subParameters: p.subParameters.filter((s) => s.id !== subId),
            }
          : p
      )
    );
  };

  // ================= COMMITTEE HANDLERS =================
  const toggleMember = (paramId, memberId) => {
    setParameters((prev) =>
      prev.map((p) =>
        p.id === paramId
          ? {
              ...p,
              selectedMembers: p.selectedMembers.includes(memberId)
                ? p.selectedMembers.filter((m) => m !== memberId)
                : [...p.selectedMembers, memberId],
            }
          : p
      )
    );
  };

  // ================= CALCULATIONS =================
  const totalMainPercentage = parameters.reduce(
    (sum, p) => sum + Number(p.percentage || 0),
    0
  );

  const subTotal = (param) =>
    param.subParameters.reduce(
      (sum, s) => sum + Number(s.percentage || 0),
      0
    );

  // ================= SAVE =================
  const handleSave = () => {
    if (totalMainPercentage !== 100) {
      alert("Main parameters must total exactly 100%");
      return;
    }

    // 🛡️ Sub-parameter validation
    for (const p of parameters) {
      if (p.subParameters.length > 0) {
        const totalSub = subTotal(p);
        if (totalSub !== 100) {
          alert(`Sub-parameters for "${p.label}" must total 100%. Current: ${totalSub}%`);
          return;
        }
      }
    }

    const payload = {
      sessionID: 7, // dynamic later
      parameters: parameters.map(p => ({
        name: p.label,
        percentage: Number(p.percentage),
        allowEvaluation: p.allowEvaluation,
        evaluators: p.selectedMembers,
        subParameters: p.subParameters.map(s => ({
          name: s.label,
          percentage: Number(s.percentage)
        }))
      }))
    };

    axios.post("http://localhost/ProgressMonitoringProject/api/committee-meetings/save-criteria", payload)
      .then(() => alert("Saved Successfully ✅"))
      .catch((err) => {
        const errorData = err.response?.data;
        const detailedMsg = typeof errorData === 'string'
          ? errorData
          : (errorData?.Message || errorData?.ExceptionMessage || "Error saving ❌");

        alert(detailedMsg);
      });
  };
  // ================= UI =================
  return (
    <MobileLayout>
      <AppBar title="Set Evaluation Criteria" showBack />

      <div className="p-4 space-y-4">
        {parameters.map((param) => (
          <div
            key={param.id}
            className="p-4 border rounded-xl bg-card space-y-3"
          >
            {/* PARAMETER NAME */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Parameter Name"
                value={param.label}
                onChange={(e) =>
                  updateParam(param.id, "label", e.target.value)
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeParameter(param.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            {/* PARAMETER PERCENTAGE */}
            <Input
              placeholder="Parameter %"
              type="number"
              value={param.percentage}
              onChange={(e) =>
                updateParam(param.id, "percentage", e.target.value)
              }
            />

            {/* COMMITTEE EVALUATION */}
            <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={param.allowEvaluation}
                  onChange={(e) =>
                    updateParam(
                      param.id,
                      "allowEvaluation",
                      e.target.checked
                    )
                  }
                />
                <Label className="text-sm font-medium">
                  Allow Committee Evaluation
                </Label>
              </div>

              {param.allowEvaluation && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Select Evaluators
                  </Label>

                  {committeeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 border rounded-lg bg-card"
                    >
                      <span className="text-sm">{member.name}</span>
                      <input
                        type="checkbox"
                        checked={param.selectedMembers.includes(member.id)}
                        onChange={() =>
                          toggleMember(param.id, member.id)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUB PARAMETERS */}
            <div className="space-y-2 bg-muted/40 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <Label className="font-medium">Sub Parameters</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSubParameter(param.id)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {param.subParameters.map((sub) => (
                <div key={sub.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Sub parameter"
                    value={sub.label}
                    onChange={(e) =>
                      updateSubParam(
                        param.id,
                        sub.id,
                        "label",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="%"
                    type="number"
                    className="w-24"
                    value={sub.percentage}
                    onChange={(e) =>
                      updateSubParam(
                        param.id,
                        sub.id,
                        "percentage",
                        e.target.value
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeSubParam(param.id, sub.id)
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <p
                className={`text-sm font-medium ${
                  subTotal(param) === 100
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Sub Total: {subTotal(param)}%
              </p>
            </div>
          </div>
        ))}

        {/* ADD MAIN PARAMETER */}
        <Button variant="outline" className="w-full" onClick={addParameter}>
          <Plus className="w-4 h-4 mr-2" /> Add Parameter
        </Button>

        {/* TOTAL */}
        <div
          className={`p-3 rounded-lg text-center font-semibold ${
            totalMainPercentage === 100
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Total Main Percentage: {totalMainPercentage}%
        </div>

        <Button className="w-full" onClick={handleSave}>
          Save Criteria
        </Button>
      </div>
    </MobileLayout>
  );
}