import RoleSelection from "../../pages/RoleSelection";
import { NavigationProvider } from "@/lib/navigation";

export default function RoleSelectionExample() {
  return (
    <NavigationProvider>
      <RoleSelection />
    </NavigationProvider>
  );
}
