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
import StudentGroupSelection1 from "@/pages/student/StudentGroupSelection";


import SupervisorDashboard from "@/pages/supervisor/SupervisorDashboard";
import AssignTask from "@/pages/supervisor/AssignTask";

import CommitteeDashboard from "@/pages/committee/CommitteeDashboard";
import StudentSelection from "@/pages/committee/StudentSelection";
import Allocation from "@/pages/committee/Allocation";
import SupervisorAllocation from "@/pages/committee/SupervisorAllocation";
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
import ScheduleMeeting from "./pages/supervisor/ScheduleMeeting";
import ScheduleMeeting1 from "./pages/supervisor/ScheduleMeeting";
import GroupAssignmentScreen1 from "./pages/committee/GroupAssignmentScreen";
import StudentGroupList from "./pages/student/StudentGroupList";
import StudentGroupList1 from "./pages/student/StudentGroupList1";
import StudentTechSelection from "./pages/student/StudentTechSelection";
import DataCellDashboard from "./pages/DataCell/DataCellDashboard";
import StudentGroupManage from "./pages/student/StudentGroupManage";
import CommitteeAllocateProjects from "./pages/committee/CommitteeAllocateProjects";
import GroupSetup from "./pages/student/group-setup";
import CreateGroup from "./pages/student/create-group";
import JoinGroup from "./pages/student/join-group";
import GroupDetails from "./pages/student/group-details";
import SupervisorTasks from "./pages/supervisor/SupervisorTasks";
import SupervisorMeetings from "./pages/supervisor/SupervisorMeetings";
import DirectorDashboard from "./pages/Director/dashboard";
import SupervisorMeetingDetails from "./pages/supervisor/SupervisorMeetingDetails";
import SupervisorAssignTask from "./pages/supervisor/SupervisorAssignTask";
import EditMeetings from "./pages/supervisor/EditMeetings";
import CommitteeMeetingSchedule from "./pages/committee/CommitteeMeetingSchedule";
import CommitteeMeetingQueue from "./pages/committee/CommitteeMeetingQueue";
import AssignCriteria from "./pages/Director/AssignCriteria";
import FinalTaskAllocation from "./pages/Director/FinalTaskAllocation";
import DirectorMidTaskAllocation from "./pages/Director/MidTaskAllocation";
import SemesterMeetingScheduler from "./pages/committee/PreScheduleMeetingScreen";
import ViewEditCriteria from "./pages/Director/ViewEditCriteria";
import MidTaskAllocation from "./pages/supervisor/MidTaskAllocationFyp2";
import AttendanceProgress from "./pages/supervisor/AttendanceProgress";
import StudentProgress from "./pages/Director/StudentProgress";
import DirectorGroupDetails from "./pages/Director/DirectorGroupDetails";
import AttendanceGroupDetails from "./pages/supervisor/AttendanceGroupDetails";
// import MidTaskEvaluation from "./pages/supervisor/MidTaskEvaluation";
import GeneralTaskEvaluation from "./pages/Director/GeneralTaskEvaluation";
import GeneralTaskAllocationDashboard from "./pages/Director/GeneralTaskAllocationDashboard";
import CreateSemesterAgenda from "./pages/Director/CreateSemesterAgenda";
import ManageGroup from "./pages/student/ManageGroup";
import GroupAssignmentScreen from "./pages/committee/GroupAssignmentScreen";
import GroupAssignmentScreen2 from "./pages/committee/ProjectAllocation";
import { BottomNav } from "./components/BottomNav";
import CommitteeProfile from "./pages/committee/CommitteeProfile";
import DirectorGroupList from "./pages/Director/DirectorGroupList";
import CommitteeHeadProfile from "./pages/Director/CommitteeHeadProfile";
import SupervisorProfile from "./pages/supervisor/SupervisorProfile";
import SupervisorGroupDetail from "./pages/supervisor/SupervisorGroupDetail";
import SuggestProject from "./pages/supervisor/SuggestProject";
import ProjectAllocation from "./pages/Director/ProjectAllocation";
import DirectorGroupDetail from "./pages/Director/DirectorGroupDetails";
import CommitteeHeadMeeting from "./pages/Director/ComitteeHeadMeetings";
import EvaluationScreen from "./pages/committee/evaluationScreen";
import Fyp2AssignCriteria from "./pages/Director/Fyp2AssignCriteria";
import Fyp2ViewEditCriteria from "./pages/Director/Fyp2ViewEditCriteria";
import DirectorEvaluationScreen from "./pages/Director/DirectorEvaluationScreen";
import CommitteeMyMeetings from "./pages/committee/CommitteeMyMeetings";
import GradingAnalysis from "./pages/Director/GradingAnalysis";
import SupervisorGradeList from "./pages/Director/SupervisorGradeList";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/select-tech" component={StudentTechSelection} />

      <Route path="/meeting-detail/:id/:type/:groupId" component={MeetingDetail} />

      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/tasks/:groupId" component={TaskList} />
      <Route path="/student/fyp1-tasks" component={FYP1Tasks} />
      <Route path="/student/fyp2-tasks" component={FYP2Tasks} />
      <Route path="/student/task-detail/:taskId" component={TaskDetail} />
      <Route path="/student/meetings/:type/:groupId" component={MeetingList} />
      <Route path="/student/meeting-detail" component={MeetingDetail} />
      <Route path="/student/queue" component={QueueDashboard} />
      <Route path="/student/profile" component={Profile} />



      {/* Supervisor Routes */}
      <Route path="/supervisor/dashboard" component={SupervisorDashboard} />
      <Route path="/supervisor/group-detail/:groupId/:selectedFYP" component={SupervisorGroupDetail} />
      <Route path="/supervisor/assign-task" component={SupervisorAssignTask} />
      <Route path="/supervisor/task-detail" component={TaskDetail} />
      <Route path="/supervisor/meetings" component={MeetingList} />
      <Route path="/supervisor/meeting-detail" component={MeetingDetail} />
      <Route path="/supervisor/tasks" component={SupervisorTasks} />
      <Route
        path="/supervisor/evaluation/:meetingId/:groupId/:parameterId/:activeFYP"
        component={EvaluationScreen}
      />

      <Route path="/supervisor/queue" component={QueueDashboard} />
      <Route path="/supervisor/profile" component={SupervisorProfile} />
      <Route path="/supervisor/schedule-meetings" component={ScheduleMeeting1} />
      <Route path="/supervisor/group-attendance" component={AttendanceGroupDetails} />
      <Route path="/supervisor/edit-meeting" component={EditMeetings} />
      <Route path="/supervisor/mid-task" component={MidTaskAllocation} />
      <Route path="/supervisor/attendance" component={AttendanceProgress} />
      <Route
        path="/committee/group-details"
        component={DirectorGroupDetails}
      />
<Route
        path="/director/gradeDetails/:supervisorId/:grade"
        component={SupervisorGradeList}
      />


      <Route
        path="/supervisor/attendance/group-details"
        component={AttendanceGroupDetails}
      />
      {/* <Route
        path="/supervisor/mid-task-evaluation"
        component={MidTaskEvaluation}
      /> */}
      <Route
        path="/committee/student-progress"
        component={StudentProgress}
      />
      <Route
        path="/student-progress/:studentId/:type"
        component={StudentProgress}
      />

      <Route
        path="/committee/create-semester-agenda"
        component={CreateSemesterAgenda}
      />
      {/* Committee Routes */}
      <Route path="/committee/dashboard" component={CommitteeDashboard} />
      <Route path="/committee/student-selection" component={StudentSelection} />
      <Route path="/committee/allocation/:groupId" component={Allocation} />
      <Route path="/committee/supervisor-allocation" component={SupervisorAllocation} />
      <Route path="/committee/group-detail/:groupId" component={GroupDetail} />
      <Route path="/committee/groups/:activeFyp" component={GroupList} />
      <Route path="/director/groups/:activeFyp" component={DirectorGroupList} />
      <Route path="/director/group-detail/:groupId" component={DirectorGroupDetail} />

      <Route path="/committee/attendance" component={MarkAttendance} />
      <Route path="/committee/task-detail" component={TaskDetail} />
      <Route path="/committee/meetings" component={MeetingList} />
      <Route path="/committee/meeting-detail" component={MeetingDetail} />
      <Route path="/committee/tasks" component={TaskList} />
      <Route path="/committee/queue" component={QueueDashboard} />
      <Route path="/committee/profile" component={CommitteeProfile} />
      <Route path="/group-assignment/:id" component={GroupAssignmentScreen1} />
      <Route path="/committee/schedule-meeting" component={CommitteeMeetingSchedule} />
      <Route path="/committee/preschedule-meeting" component={SemesterMeetingScheduler} />
      <Route path="/committee/my-meetings" component={CommitteeMyMeetings} />

      <Route path="/committee/meeting-queue/:meetingId?" component={CommitteeMeetingQueue} />
      <Route path="/director/assign-criteria" component={AssignCriteria} />
      <Route path="/director/assign-criteriafyp2" component={Fyp2AssignCriteria} />

      <Route path="/director/profile" component={CommitteeHeadProfile} />


      <Route path="/director/view-criteria" component={ViewEditCriteria} />
      <Route path="/director/view-criteriafyp2" component={Fyp2ViewEditCriteria} />

      <Route
        path="/committee/allocate-projects/:meetingId/:groupId"
        component={GroupAssignmentScreen2}
      />

      <Route path="/committee-head/meeting-queue" component={CommitteeHeadMeeting} />

      <Route path="/committee-head/final-task" component={FinalTaskAllocation} />
      <Route path="/BottomNav" component={BottomNav} />


      {/* Queue Handler Routes */}
      <Route path="/queue/dashboard" component={QueueDashboard} />
      <Route path="/queue/detail" component={QueueDetail} />
      <Route path="/queue/assignment/:type/:groupId" component={QueueAssignment} />
      <Route path="/queue/analytics" component={QueueAnalytics} />
      <Route path="/queue/notifications" component={NotificationsCenter} />
      <Route path="/queue/meetings" component={MeetingList} />
      <Route path="/queue/tasks" component={TaskList} />
      <Route path="/queue/profile" component={Profile} />
      <Route path="/student/groups" component={StudentGroupList} />
      <Route path="/student/group-list" component={StudentGroupList1} />
      <Route path="/datacell/dashboard" component={DataCellDashboard} />

      <Route path="/student/group-manage" component={StudentGroupManage} />
      <Route path="/committee/allocate-projects" component={CommitteeAllocateProjects} />
      <Route path="/student/group-setup" component={GroupSetup} />

      <Route path="/group/manage" component={ManageGroup} />

      <Route path="/student/create-group" component={CreateGroup} />
      <Route path="/student/join-group" component={JoinGroup} />
      <Route path="/student/group-details" component={GroupDetails} />

      <Route path="/supervisor/tasks1" component={SupervisorTasks} />
      <Route path="/supervisor/meetings1" component={SupervisorMeetings} />

      <Route path="/director/dashboard" component={DirectorDashboard} />
      <Route path="/supervisor/meeting-details" component={SupervisorMeetingDetails} />
      <Route path="/supervisor/suggest-project" component={SuggestProject} />
      <Route path="/director/project-allocation" component={ProjectAllocation} />



      <Route
        path="/committee/evaluation/:meetingId/:groupId/:parameterId/:activeFYP"
        component={EvaluationScreen}
      />
      <Route
        path="/Director/evaluation/:meetingId/:groupId/:parameterId/:activeFYP"
        component={DirectorEvaluationScreen}
      />

      <Route path="/director/grading-analysis" component={GradingAnalysis} />
      <Route path="/committee-head/general-task-evaluation" component={GeneralTaskEvaluation} />
      <Route path="/supervisor/general-task-evaluation" component={GeneralTaskEvaluation} />
      <Route path="/committee/general-task-evaluation" component={GeneralTaskEvaluation} />
      <Route path="/committee-head/general-task-allocation" component={GeneralTaskAllocationDashboard} />

      <Route path="/committee/final-task/:selectedGroup" component={FinalTaskAllocation} />
      <Route path="/committee/mid-task/:selectedGroup" component={DirectorMidTaskAllocation} />


      {/* Common Routes */}
      <Route path="/meeting-detail" component={MeetingDetail} />
      {/* <Route path="/common/assignment" component={QueueAssignmentScreen} /> */}
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
