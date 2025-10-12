import CommitteeDashboard from "../../pages/committee/CommitteeDashboard";
import { NavigationProvider } from "@/lib/navigation";

export default function CommitteeDashboardExample() {
  return (
    <NavigationProvider>
      <CommitteeDashboard />
    </NavigationProvider>
  );
}
