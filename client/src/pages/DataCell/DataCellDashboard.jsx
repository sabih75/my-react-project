"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Upload, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataCellLayout from "./DataCellLayout";

/* ================= API URLS ================= */
const STUDENT_API = "http://localhost/ProgressMonitoringProject/api/auth/UploadStudentsData";
const STAFF_API = "http://localhost/ProgressMonitoringProject/api/auth/UploadUsersExcel";

export default function DataCellDashboard() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  const [studentFile, setStudentFile] = useState(null);
  const [staffFile, setStaffFile] = useState(null);

  const [studentFileName, setStudentFileName] = useState("");
  const [staffFileName, setStaffFileName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= EXCEL PARSE ================= */
  const parseExcel = (file, mapper, setter) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setter(mapper(rows));
    };
    reader.readAsBinaryString(file);
  };

  /* ================= STUDENT ================= */
  const handleStudentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStudentFile(file);
    setStudentFileName(file.name);
    setMessage("");

    parseExcel(
      file,
      (rows) =>
        rows
          .filter((r) => r.regNum)
          .map((r, i) => ({
            id: i + 1,
            regNum: r.regNum,
            name: r.name,
            email: r.email,
            department: r.department,
            section: r.section,
          })),
      setStudents
    );
  };

  /* ================= STAFF ================= */
  const handleStaffUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStaffFile(file);
    setStaffFileName(file.name);
    setMessage("");

    parseExcel(
      file,
      (rows) =>
        rows
          .filter((r) => r.id && r.role)
          .map((r, i) => ({
            index: i + 1,
            id: r.id,
            name: r.name,
            email: r.email,
            role: r.role,
          })),
      setStaff
    );
  };

  /* ================= UPLOAD ================= */
  const upload = async (api, file, reset) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("file", file);
      await axios.post(api, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("✅ Upload successful");
      reset();
    } catch {
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAMPLE EXCEL ================= */
  const downloadSample = (type) => {
    const data =
      type === "student"
        ? [{ regNum: "2021-CS-001", name: "Ali", email: "ali@test.com", department: "CS", section: "A" }]
        : [{ id: "EMP01", name: "Ahmed", email: "ahmed@test.com", role: "Teacher" }];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, type === "student" ? "students_sample.xlsx" : "staff_sample.xlsx");
  };

  /* ================= UI ================= */
  return (
    <DataCellLayout>
      <div className="max-w-7xl mx-auto p-6 grid gap-8 md:grid-cols-2">

        {/* STUDENTS */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-green-600" /> Students Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input hidden id="studentsExcel" type="file" accept=".xlsx" onChange={handleStudentUpload} />

            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline">
                <label htmlFor="studentsExcel" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" /> Choose Excel
                </label>
              </Button>
              <Button variant="secondary" onClick={() => downloadSample("student")}>
                <Download className="w-4 h-4 mr-2" /> Sample
              </Button>
            </div>

            {studentFileName && <p className="text-sm text-muted-foreground">{studentFileName}</p>}

            <Button disabled={loading} onClick={() => upload(STUDENT_API, studentFile, () => {
              setStudents([]); setStudentFile(null); setStudentFileName("");
            })}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Upload Students"}
            </Button>

            {students.length > 0 && (
              <div className="max-h-56 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Reg#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Dept</th>
                      <th>Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-muted/40">
                        <td className="p-2">{s.regNum}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>{s.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* STAFF */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Staff Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input hidden id="staffExcel" type="file" accept=".xlsx" onChange={handleStaffUpload} />

            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline">
                <label htmlFor="staffExcel" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" /> Choose Excel
                </label>
              </Button>
              <Button variant="secondary" onClick={() => downloadSample("staff")}>
                <Download className="w-4 h-4 mr-2" /> Sample
              </Button>
            </div>

            {staffFileName && <p className="text-sm text-muted-foreground">{staffFileName}</p>}

            <Button disabled={loading} onClick={() => upload(STAFF_API, staffFile, () => {
              setStaff([]); setStaffFile(null); setStaffFileName("");
            })}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Upload Staff"}
            </Button>

            {staff.length > 0 && (
              <div className="max-h-56 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((u) => (
                      <tr key={u.index} className="border-t hover:bg-muted/40">
                        <td className="p-2">{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td className="font-semibold">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {message && (
          <div className="md:col-span-2 text-center font-medium text-sm">{message}</div>
        )}
      </div>
    </DataCellLayout>
  );
}
