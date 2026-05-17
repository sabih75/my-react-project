"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useParams } from "wouter";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";
import { AppBar } from "@/components/AppBar";
import {
  ArrowLeft,
  User,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function StudentProgress() {
  const [, setLocation] = useLocation();
  const { studentId, type } = useParams();

  // ============================
  // STATE
  // ============================

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Swipe Indexes
  const [committeeHeadIndex, setCommitteeHeadIndex] = useState(0);
  const [supervisorIndex, setSupervisorIndex] = useState(0);
  const [supervisorGroupIndex, setSupervisorGroupIndex] = useState(0);
  const [committeeIndex, setCommitteeIndex] = useState(0);

  // ============================
  // FETCH DATA
  // ============================

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/fyp2-scores/student-progress/${studentId}/${type}`
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // PERCENTAGE
  // ============================

  const percent = (attended, total) => {
    if (!total || total === 0) return 0;
    return Math.round((attended / total) * 100);
  };

  // ============================
  // SWIPEABLE REMARK CARD
  // ============================

  const SwipeableRemarks = ({
    title,
    remarks,
    index,
    setIndex,
    color = "blue",
  }) => {
    const hasRemarks = remarks && remarks.length > 0;
    const currentRemark = hasRemarks ? remarks[index] : null;

    const next = () => {
      if (index < remarks.length - 1) {
        setIndex(index + 1);
      }
    };

    const prev = () => {
      if (index > 0) {
        setIndex(index - 1);
      }
    };

    // Helper to safely extract remark text whether it's an object or a plain string
    const getRemarkText = (r) => {
      if (!r) return "";
      return typeof r === 'object' ? r.Remarks : r;
    };

    return (
      <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">{title}</h4>

          {hasRemarks && (
            <div className="text-xs text-gray-500 font-medium">
              {index + 1} / {remarks.length}
            </div>
          )}
        </div>

        {!hasRemarks ? (
          <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg text-center">
            No remarks available yet.
          </div>
        ) : (
          <>
            <div
              className={`border-l-4 border-${color}-500 bg-white rounded-lg p-5 min-h-[120px] flex flex-col shadow-sm relative`}
            >
              {typeof currentRemark === 'object' && (
                <div className="mb-3 pb-3 border-b flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-gray-400">Meeting Context</span>
                    <span className={`text-sm font-semibold text-${color}-600 line-clamp-1`}>{currentRemark.Meeting}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold uppercase text-gray-400">Evaluator</span>
                    <span className="text-sm font-medium text-gray-800">{currentRemark.Evaluator}</span>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                {getRemarkText(currentRemark)}
              </p>

              {typeof currentRemark === 'object' && currentRemark.Date && (
                <div className="text-xs text-gray-400 mt-3 text-right">
                  {new Date(currentRemark.Date).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                onClick={prev}
                disabled={index === 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  index === 0
                    ? "opacity-40 cursor-not-allowed bg-gray-100"
                    : "hover:bg-white bg-gray-50 shadow-sm"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={next}
                disabled={index === remarks.length - 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  index === remarks.length - 1
                    ? "opacity-40 cursor-not-allowed bg-gray-100"
                    : "hover:bg-white bg-gray-50 shadow-sm"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <CommitteeHeadLayout>
        <AppBar title="Student Progress">
          <button onClick={() => setLocation(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </AppBar>

        <div className="p-6 text-center text-gray-500">
          Loading...
        </div>
      </CommitteeHeadLayout>
    );
  }

  // ============================
  // NO DATA
  // ============================

  if (!data) {
    return (
      <CommitteeHeadLayout>
        <AppBar title="Student Progress">
          <button onClick={() => setLocation(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </AppBar>

        <div className="p-6 text-center text-gray-500">
          No Data Found
        </div>
      </CommitteeHeadLayout>
    );
  }

  return (
    <CommitteeHeadLayout>
      <AppBar title="Student Progress">
        <button onClick={() => setLocation(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </AppBar>

      <div className="p-4 space-y-6">

        {/* ========================= */}
        {/* STUDENT INFO */}
        {/* ========================= */}

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h2 className="font-bold text-lg">
                {data.studentName}
              </h2>

              <p className="text-sm text-gray-500">
                Group: {data.groupName}
              </p>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* ATTENDANCE */}
        {/* ========================= */}

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            Attendance Overview
          </h3>

          {[
            {
              label: "Supervisor",
              data: data.attendance.supervisor,
              color: "bg-blue-600",
            },
            {
              label: "Committee",
              data: data.attendance.committee,
              color: "bg-green-500",
            },
          ].map((a) => {
            const p = percent(
              a.data.attended,
              a.data.total
            );

            return (
              <div key={a.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{a.label}</span>

                  <span className="font-medium">
                    {p}% ({a.data.attended}/{a.data.total})
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${a.color}`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================= */}
        {/* REMARKS */}
        {/* ========================= */}

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Remarks History
          </h3>

          {/* Committee Head */}
          <SwipeableRemarks
            title="Committee Head Remarks"
            remarks={data.committeeHeadRemarks}
            index={committeeHeadIndex}
            setIndex={setCommitteeHeadIndex}
            color="blue"
          />

          {/* Supervisor Individual */}
          <SwipeableRemarks
            title="Supervisor Individual Remarks"
            remarks={data.supervisorRemarks}
            index={supervisorIndex}
            setIndex={setSupervisorIndex}
            color="green"
          />

          {/* Supervisor Group */}
          <SwipeableRemarks
            title="Supervisor Group Remarks"
            remarks={data.supervisorGroupRemarks}
            index={supervisorGroupIndex}
            setIndex={setSupervisorGroupIndex}
            color="purple"
          />

          {/* Committee */}
          <SwipeableRemarks
            title="Committee Remarks"
            remarks={data.committeeRemarks}
            index={committeeIndex}
            setIndex={setCommitteeIndex}
            color="orange"
          />
        </div>

        {/* ========================= */}
        {/* TASK PROGRESS */}
        {/* ========================= */}

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Work Progress
          </h3>

          <div className="flex justify-between text-sm">
            <span>Task Completion</span>

            <span className="font-semibold text-green-600">
              {data.taskProgress}%
            </span>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-4 rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${data.taskProgress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </CommitteeHeadLayout>
  );
}