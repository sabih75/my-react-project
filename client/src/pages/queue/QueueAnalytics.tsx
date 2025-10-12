import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, Clock, CheckCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function QueueAnalytics() {
  const chartData = [
    { day: "Mon", items: 12 },
    { day: "Tue", items: 19 },
    { day: "Wed", items: 15 },
    { day: "Thu", items: 22 },
    { day: "Fri", items: 18 },
  ];

  return (
    <MobileLayout>
      <AppBar title="Queue Analytics" showBack />
      
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={TrendingUp} label="Processed Today" value={24} />
            <StatCard icon={Clock} label="Avg. Wait Time" value="2.5h" color="bg-chart-3" />
            <StatCard icon={CheckCircle} label="Completion Rate" value="94%" color="bg-chart-2" />
            <StatCard icon={Activity} label="Active Items" value={12} color="bg-chart-4" />
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-4">Queue Activity (This Week)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="items" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Queue Distribution</h3>
          <div className="space-y-3">
            {[
              { type: "Task Assignment", count: 8, percentage: 40 },
              { type: "Meeting Approval", count: 6, percentage: 30 },
              { type: "Grade Review", count: 4, percentage: 20 },
              { type: "Others", count: 2, percentage: 10 },
            ].map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.type}</span>
                  <span className="font-medium">{item.count} items</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
