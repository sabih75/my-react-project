import Profile from "../../pages/Profile";
import { NavigationProvider } from "@/lib/navigation";

export default function ProfileExample() {
  return (
    <NavigationProvider>
      <Profile />
    </NavigationProvider>
  );
}
