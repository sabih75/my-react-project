"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";

const API = "http://localhost/ProgressMonitoringProject/api/fyp2-scores";

export default function AssignCriteria() {
  const sessionID = 7; // TODO: make dynamic later

  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD EXISTING CRITERIA =================
  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/Getcriteria/${sessionID}`);

      if (res.data && res.data.length > 0) {
        // 🔄 Map backend → frontend structure
        const mapped = res.data.map((p) => ({
          id: p.id,
          label: p.name,
          percentage: p.percentage,
          subParameters: p.subParameters.map((s) => ({
            id: s.id,
            label: s.name,
            percentage: s.percentage,
          })),
        }));

        setParameters(mapped);
      } else {
        // default empty state
        setParameters([
          {
            id: Date.now(),
            label: "",
            percentage: "",
            subParameters: [],
          },
        ]);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to load criteria");
    } finally {
      setLoading(false);
    }
  };

  // ================= PARAM HANDLERS =================
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
        subParameters: [],
      },
    ]);
  };

  const removeParameter = (id) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  // ================= SUB PARAM =================
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
  const handleSave = async () => {
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

    try {
      const payload = {
        sessionID: sessionID,
        parameters: parameters.map((p) => ({
          name: p.label,
          percentage: Number(p.percentage),
          allowEvaluation: false,
          evaluators: [],
          subParameters: p.subParameters.map((s) => ({
            name: s.label,
            percentage: Number(s.percentage),
          })),
        })),
      };

      await axios.post(`${API}/save-criteria`, payload);

      alert("Criteria Saved Successfully ✅");
      loadCriteria();
    } catch (err) {
      const errorData = err.response?.data;
      const detailedMsg = typeof errorData === 'string'
        ? errorData
        : (errorData?.Message || errorData?.ExceptionMessage || "Error saving ❌");

      alert(detailedMsg);
    }
  };

  // ================= UI =================
  return (
    <MobileLayout>
      <AppBar title="FYP-2 Evaluation Criteria" showBack />

      <div className="p-4 space-y-4">
        {parameters.map((param) => (
          <div
            key={param.id}
            className="p-4 border rounded-xl bg-card space-y-3"
          >
            {/* PARAM NAME */}
            <div className="flex gap-2">
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

            {/* PERCENT */}
            <Input
              placeholder="Parameter %"
              type="number"
              value={param.percentage}
              onChange={(e) =>
                updateParam(param.id, "percentage", e.target.value)
              }
            />

            {/* SUB PARAMS */}
            <div className="bg-muted/40 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <Label>Sub Parameters</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSubParameter(param.id)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {param.subParameters.map((sub) => (
                <div key={sub.id} className="flex gap-2">
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
                    type="number"
                    placeholder="%"
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

        {/* ADD PARAM */}
        <Button variant="outline" onClick={addParameter} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Parameter
        </Button>

        {/* TOTAL */}
        <div
          className={`p-3 text-center rounded-lg font-semibold ${
            totalMainPercentage === 100
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Total Main Percentage: {totalMainPercentage}%
        </div>

        {/* SAVE */}
        <Button className="w-full" onClick={handleSave}>
          Save Criteria
        </Button>
      </div>
    </MobileLayout>
  );
}