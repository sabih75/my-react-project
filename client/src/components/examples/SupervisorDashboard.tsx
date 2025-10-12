import SupervisorDashboard from "../../pages/supervisor/SupervisorDashboard";
import { NavigationProvider } from "@/lib/navigation";

export default function SupervisorDashboardExample() {
  return (
    <NavigationProvider>
      <SupervisorDashboard />
    </NavigationProvider>
  );
}
