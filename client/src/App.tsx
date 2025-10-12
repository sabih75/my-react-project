import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavigationProvider } from "@/lib/navigation";

import Login from "@/pages/Login";
import RoleSelection from "@/pages/RoleSelection";
import Profile from "@/pages/Profile";

import StudentDashboard from "@/pages/student/StudentDashboard";
import TaskList from "@/pages/student/TaskList";
import FYP1Tasks from "@/pages/student/FYP1Tasks";
import FYP2Tasks from "@/pages/student/FYP2Tasks";

import SupervisorDashboard from "@/pages/supervisor/SupervisorDashboard";
import AssignTask from "@/pages/supervisor/AssignTask";

import CommitteeDashboard from "@/pages/committee/CommitteeDashboard";
import StudentSelection from "@/pages/committee/StudentSelection";
import Allocation from "@/pages/committee/Allocation";
import MarkAttendance from "@/pages/committee/MarkAttendance";
import GroupList from "@/pages/committee/GroupList";

import QueueDashboard from "@/pages/queue/QueueDashboard";
import QueueDetail from "@/pages/queue/QueueDetail";
import QueueAssignment from "@/pages/queue/QueueAssignment";
import QueueAnalytics from "@/pages/queue/QueueAnalytics";
import NotificationsCenter from "@/pages/queue/NotificationsCenter";

import TaskDetail from "@/pages/common/TaskDetail";
import MeetingList from "@/pages/common/MeetingList";
import MeetingDetail from "@/pages/common/MeetingDetail";
import GroupDetail from "@/pages/common/GroupDetail";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/tasks" component={TaskList} />
      <Route path="/student/fyp1-tasks" component={FYP1Tasks} />
      <Route path="/student/fyp2-tasks" component={FYP2Tasks} />
      <Route path="/student/task-detail" component={TaskDetail} />
      <Route path="/student/meetings" component={MeetingList} />
      <Route path="/student/meeting-detail" component={MeetingDetail} />
      <Route path="/student/queue" component={QueueDashboard} />
      <Route path="/student/profile" component={Profile} />
      
      {/* Supervisor Routes */}
      <Route path="/supervisor/dashboard" component={SupervisorDashboard} />
      <Route path="/supervisor/group-detail" component={GroupDetail} />
      <Route path="/supervisor/assign-task" component={AssignTask} />
      <Route path="/supervisor/task-detail" component={TaskDetail} />
      <Route path="/supervisor/meetings" component={MeetingList} />
      <Route path="/supervisor/meeting-detail" component={MeetingDetail} />
      <Route path="/supervisor/tasks" component={TaskList} />
      <Route path="/supervisor/queue" component={QueueDashboard} />
      <Route path="/supervisor/profile" component={Profile} />
      
      {/* Committee Routes */}
      <Route path="/committee/dashboard" component={CommitteeDashboard} />
      <Route path="/committee/student-selection" component={StudentSelection} />
      <Route path="/committee/allocation" component={Allocation} />
      <Route path="/committee/group-detail" component={GroupDetail} />
      <Route path="/committee/groups" component={GroupList} />
      <Route path="/committee/attendance" component={MarkAttendance} />
      <Route path="/committee/task-detail" component={TaskDetail} />
      <Route path="/committee/meetings" component={MeetingList} />
      <Route path="/committee/meeting-detail" component={MeetingDetail} />
      <Route path="/committee/tasks" component={TaskList} />
      <Route path="/committee/queue" component={QueueDashboard} />
      <Route path="/committee/profile" component={Profile} />
      
      {/* Queue Handler Routes */}
      <Route path="/queue/dashboard" component={QueueDashboard} />
      <Route path="/queue/detail" component={QueueDetail} />
      <Route path="/queue/assignment" component={QueueAssignment} />
      <Route path="/queue/analytics" component={QueueAnalytics} />
      <Route path="/queue/notifications" component={NotificationsCenter} />
      <Route path="/queue/meetings" component={MeetingList} />
      <Route path="/queue/tasks" component={TaskList} />
      <Route path="/queue/profile" component={Profile} />

      {/* Common Routes */}
      <Route path="/meeting-detail" component={MeetingDetail} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </NavigationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
