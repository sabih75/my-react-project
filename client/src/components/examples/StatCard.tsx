import { StatCard } from "../StatCard";
import { Users } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      <StatCard icon={Users} label="Total Groups" value={12} />
      <StatCard icon={Users} label="Active Tasks" value={28} color="bg-chart-2" />
    </div>
  );
}
