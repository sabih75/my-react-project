import MobileLayout from "../MobileLayout";
import { AppBar } from "../AppBar";

export default function MobileLayoutExample() {
  return (
    <MobileLayout showBottomNav={false}>
      <AppBar title="Example Screen" showBack={false} />
      <div className="p-4">
        <p className="text-muted-foreground">Mobile layout example content</p>
      </div>
    </MobileLayout>
  );
}
