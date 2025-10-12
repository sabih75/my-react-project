import { GroupCard } from "../GroupCard";

export default function GroupCardExample() {
  return (
    <div className="p-4 space-y-3">
      <GroupCard
        groupName="Group Alpha"
        projectTitle="AI-Based Student Management System"
        members={["Ali", "Hassan", "Ahmed"]}
        supervisor="Dr. Khan"
        progress={65}
      />
    </div>
  );
}
