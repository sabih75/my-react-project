import StudentDashboard from "../../pages/student/StudentDashboard";
import { NavigationProvider } from "@/lib/navigation";

export default function StudentDashboardExample() {
  return (
    <NavigationProvider>
      <StudentDashboard />
    </NavigationProvider>
  );
}
