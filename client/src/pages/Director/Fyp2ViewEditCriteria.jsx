"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Save } from "lucide-react";

const API = "http://localhost/ProgressMonitoringProject/api/committee-meetings";

export default function ViewEditCriteria() {
  const sessionId = 13; // TODO: dynamic later

  const [criteria, setCriteria] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= LOAD =================
  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/GetCriteriaFyp2/${sessionId}`);

      // 🔄 Map backend → frontend
      const mapped = res.data.map((p) => ({
        id: p.id,
        name: p.name,
        percentage: p.percentage,
        subParameters: p.subParameters.map((s) => ({
          id: s.id,
          name: s.name,
          percentage: s.percentage,
        })),
      }));

      setCriteria(mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to load criteria ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLERS =================
  const updateParam = (id, field, value) => {
    setCriteria((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const updateSubParam = (pid, sid, field, value) => {
    setCriteria((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
            ...p,
            subParameters: p.subParameters.map((s) =>
              s.id === sid ? { ...s, [field]: value } : s
            ),
          }
          : p
      )
    );
  };

  // ================= CALCULATIONS =================
  const totalMainPercentage = criteria.reduce(
    (sum, p) => sum + Number(p.percentage || 0),
    0
  );

  const subTotal = (param) =>
    param.subParameters.reduce(
      (sum, s) => sum + Number(s.percentage || 0),
      0
    );

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (totalMainPercentage !== 100) {
      alert("Main percentage must be 100%");
      return;
    }

    try {
      const payload = criteria.map((p) => ({
        id: p.id,
        name: p.name,
        percentage: Number(p.percentage),
        allowEvaluation: false, // not used in FYP2
        evaluators: [],
        subParameters: p.subParameters.map((s) => ({
          name: s.name,
          percentage: Number(s.percentage),
        })),
      }));

      await axios.post(`${API}/EditCriteriaFyp2/${sessionId}`, payload);

      alert("Updated Successfully ✅");
      setEditMode(false);
      loadCriteria(); // refresh
    } catch (err) {
      const errorData = err.response?.data;
      const detailedMsg = typeof errorData === 'string'
        ? errorData
        : (errorData?.Message || errorData?.ExceptionMessage || "Update failed ❌");

      alert(detailedMsg);
    }
  };

  // ================= UI =================
  return (
    <MobileLayout>
      <AppBar title="FYP-2 Criteria" showBack />

      <div className="p-4 space-y-4">
        <Button
          variant="outline"
          onClick={() => setEditMode(!editMode)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          {editMode ? "Cancel Edit" : "Edit Criteria"}
        </Button>

        {criteria.map((param) => (
          <div
            key={param.id}
            className="p-4 border rounded-xl space-y-3"
          >
            {/* PARAM NAME */}
            <Input
              disabled={!editMode}
              value={param.name}
              placeholder="Parameter Name"
              onChange={(e) =>
                updateParam(param.id, "name", e.target.value)
              }
            />

            {/* PARAM % */}
            <Input
              disabled={!editMode}
              type="number"
              value={param.percentage}
              placeholder="Percentage"
              onChange={(e) =>
                updateParam(param.id, "percentage", e.target.value)
              }
            />

            {/* SUB PARAMS */}
            <div className="space-y-2">
              {param.subParameters.map((sub) => (
                <div key={sub.id} className="flex gap-2">
                  <Input
                    disabled={!editMode}
                    value={sub.name}
                    placeholder="Sub parameter"
                    onChange={(e) =>
                      updateSubParam(
                        param.id,
                        sub.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    disabled={!editMode}
                    type="number"
                    value={sub.percentage}
                    placeholder="%"
                    className="w-24"
                    onChange={(e) =>
                      updateSubParam(
                        param.id,
                        sub.id,
                        "percentage",
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}

              <p
                className={`text-sm font-medium ${subTotal(param) === Number(param.percentage || 0)
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                Sub Total: {subTotal(param)}%
              </p>
            </div>
          </div>
        ))}

        {/* TOTAL */}
        <div
          className={`p-3 text-center rounded-lg font-semibold ${totalMainPercentage === 100
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          Total Main Percentage: {totalMainPercentage}%
        </div>

        {/* UPDATE BUTTON */}
        {editMode && (
          <Button onClick={handleUpdate}>
            <Save className="w-4 h-4 mr-2" />
            Update Criteria
          </Button>
        )}
      </div>
    </MobileLayout>
  );
}