import GroupDetail from "../../pages/common/GroupDetail";
import { NavigationProvider } from "@/lib/navigation";

export default function GroupDetailExample() {
  return (
    <NavigationProvider>
      <GroupDetail />
    </NavigationProvider>
  );
}
