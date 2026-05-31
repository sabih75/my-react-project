using Microsoft.AspNetCore.Http;
using ProgressMonitoringProject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Http;
using static System.Net.WebRequestMethods;

namespace ProgressMonitoringProject.Controllers
{
    [RoutePrefix("api/grading-analysis")]
    public class GradingAnalysisController : ApiController
    {
        private readonly FypProjectProgDBEntities db = new FypProjectProgDBEntities();

        // 1. Session-Wise Grade Distribution
        [HttpGet]
        [Route("session-wise")]
        public IHttpActionResult GetSessionWiseDistribution(string fyp = "FYP-1")
        {
            var sessions = db.Sessions.ToList();
            var enrollments = db.Enrollments.Where(e => e.subject == fyp).ToList();

            var result = sessions.Select(s => new
            {
                SessionId = s.id,
                SessionName = s.name,
                TotalStudents = enrollments.Count(e => e.sessionID == s.id),
                Grades = new
                {
                    APlus = enrollments.Count(e => e.sessionID == s.id && e.grade == "A+"),
                    A = enrollments.Count(e => e.sessionID == s.id && e.grade == "A"),
                    AMinus = enrollments.Count(e => e.sessionID == s.id && e.grade == "A-"),
                    BPlus = enrollments.Count(e => e.sessionID == s.id && e.grade == "B+"),
                    B = enrollments.Count(e => e.sessionID == s.id && e.grade == "B"),
                    BMinus = enrollments.Count(e => e.sessionID == s.id && e.grade == "B-"),
                    CPlus = enrollments.Count(e => e.sessionID == s.id && e.grade == "C+"),
                    C = enrollments.Count(e => e.sessionID == s.id && e.grade == "C"),
                    CMinus = enrollments.Count(e => e.sessionID == s.id && e.grade == "C-"),
                    DPlus = enrollments.Count(e => e.sessionID == s.id && e.grade == "D+"),
                    D = enrollments.Count(e => e.sessionID == s.id && e.grade == "D"),
                    F = enrollments.Count(e => e.sessionID == s.id && e.grade == "F"),
                    Ungraded = enrollments.Count(e => e.sessionID == s.id && (e.grade == null || e.grade == "" || e.grade == "Select Grade"))
                }
            }).ToList();

            return Ok(result);
        }

        // 2. Supervisor-Wise Grade Distribution
        [HttpGet]
        [Route("supervisor-wise")]
        public IHttpActionResult GetSupervisorWiseDistribution(string fyp = "FYP-2")
        {
            var supervisors = db.Users.Where(u => u.role == "Supervisor" || u.role == "Faculty").ToList();
            var groups = db.ProjectGroups.ToList();
            var groupMembers = db.GroupMembers.ToList();
            var enrollments = db.Enrollments.ToList();
            var sessions = db.Sessions.ToList();

            var result = supervisors.Select(sup =>
            {
                var supGroupIds = groups.Where(g => g.supervisorID == sup.id).Select(g => g.id).ToList();
                var memberRegNums = groupMembers.Where(gm => supGroupIds.Contains(gm.groupID ?? 0)).Select(gm => gm.studentID).ToList();
                var supEnrollments = enrollments.Where(e => memberRegNums.Contains(e.studentID)).ToList();

                var sessionBreakdowns = sessions.Where(a => a.id == 13).Select(s =>
                {
                    var sessEnrollments = supEnrollments.Where(e => e.sessionID == s.id).ToList();
                    return new
                    {
                        SessionId = s.id,
                        SessionName = s.name,
                        TotalSupervised = sessEnrollments.Count,
                        Grades = new
                        {
                            APlus = sessEnrollments.Count(e => e.grade == "A+"),
                            A = sessEnrollments.Count(e => e.grade == "A"),
                            AMinus = 6 * sessEnrollments.Count(e => e.grade == "A-"),
                            BPlus = sessEnrollments.Count(e => e.grade == "B+"),
                            B = sessEnrollments.Count(e => e.grade == "B"),
                            BMinus = sessEnrollments.Count(e => e.grade == "B-"),
                            C = sessEnrollments.Count(e => e.grade == "C"),
                            D = sessEnrollments.Count(e => e.grade == "D"),
                            F = sessEnrollments.Count(e => e.grade == "F"),
                            Ungraded = sessEnrollments.Count(e => e.grade == null || e.grade == "" || e.grade == "Select Grade")
                        }
                    };
                }).ToList();

                return new
                {
                    SupervisorId = sup.id,
                    SupervisorName = sup.name,
                    TotalSupervised = supEnrollments.Count,
                    SessionBreakdowns = sessionBreakdowns,
                    Grades = new
                    {
                        APlus = supEnrollments.Count(e => e.grade == "A+"),
                        A = supEnrollments.Count(e => e.grade == "A"),
                        AMinus = supEnrollments.Count(e => e.grade == "A-"),
                        BPlus = supEnrollments.Count(e => e.grade == "B+"),
                        B = supEnrollments.Count(e => e.grade == "B"),
                        BMinus = supEnrollments.Count(e => e.grade == "B-"),
                        C = supEnrollments.Count(e => e.grade == "C"),
                        D = supEnrollments.Count(e => e.grade == "D"),
                        F = supEnrollments.Count(e => e.grade == "F"),
                        Ungraded = supEnrollments.Count(e => e.grade == null || e.grade == "" || e.grade == "Select Grade")
                    }

                };
            }).ToList();
            var result1 = supervisors.Select(sup =>
            {
                var supGroupIds = groups.Where(g => g.supervisorID == sup.id).Select(g => g.id).ToList();
                var memberRegNums = groupMembers.Where(gm => supGroupIds.Contains(gm.groupID ?? 0)).Select(gm => gm.studentID).ToList();
                var supEnrollments = enrollments.Where(e => memberRegNums.Contains(e.studentID)).ToList();


                return new
                {
                    SupervisorId = sup.id,
                    SupervisorName = sup.name,
                    TotalSupervised = supEnrollments.Count,
                    Grades = new
                    {
                        APlus = 8 * supEnrollments.Count(e => e.grade == "A+"),
                        A = 7 * supEnrollments.Count(e => e.grade == "A"),
                        AMinus = 6 * supEnrollments.Count(e => e.grade == "A-"),
                        BPlus = 5 * supEnrollments.Count(e => e.grade == "B+"),
                        B = 4 * supEnrollments.Count(e => e.grade == "B"),
                        BMinus = 3 * supEnrollments.Count(e => e.grade == "B-"),
                        C = 2 * supEnrollments.Count(e => e.grade == "C"),
                        D = 1 * supEnrollments.Count(e => e.grade == "D"),
                        F = 0 * supEnrollments.Count(e => e.grade == "F"),
                        Ungraded = supEnrollments.Count(e => e.grade == null || e.grade == "" || e.grade == "Select Grade"),
                        AverageScore = 8 * supEnrollments.Count(e => e.grade == "A+") + 7 * supEnrollments.Count(e => e.grade == "A") + 6 * supEnrollments.Count(e => e.grade == "A-") +
                        5 * supEnrollments.Count(e => e.grade == "B+") + 4 * supEnrollments.Count(e => e.grade == "B") + 3 * supEnrollments.Count(e => e.grade == "B-") + 2 * supEnrollments.Count(e => e.grade == "C") + 1 * supEnrollments.Count(e => e.grade == "D") +
                        0 * supEnrollments.Count(e => e.grade == "F")


                    }
                };
            }).ToList();

            return Ok(result);
        }


        [HttpGet]
        [Route("getSortedSUpervisorGrades/{fyp}")]
        public IHttpActionResult GetSortedSupervisorGrades(string fyp)
        {
            var supervisors = db.Users.Where(u => u.role == "Supervisor" || u.role == "Faculty").ToList();
            var enrolledStudents = db.Enrollments
                    .Select(s => s.studentID)
                    .Distinct()
                    .ToList();

            // 2?? Fetch groups + required data (NO custom method here)
            var groups = db.ProjectGroups
                .Where(g =>
                    enrolledStudents.Contains(g.createdBy)
                ).Select(s => new { s.id, s.supervisorID }).ToList();

            var groupMembers = db.GroupMembers.ToList();
            var enrollments = db.Enrollments.Where(e => e.subject == fyp).ToList();
            var sessions = db.Sessions.ToList();


            var result = supervisors.Select(sup =>
            {
                var supGroupIds = groups.Where(g => g.supervisorID == sup.id).Select(g => g.id).ToList();
                var memberRegNums = groupMembers.Where(gm => supGroupIds.Contains(gm.groupID ?? 0)).Select(gm => gm.studentID).ToList();
                var supEnrollments = enrollments.Where(e => memberRegNums.Contains(e.studentID)).ToList();


                return new
                {
                    SupervisorId = sup.id,
                    SupervisorName = sup.name,
                    TotalSupervised = supEnrollments.Count,
                    Grades = new
                    {
                        APlus = 8 * supEnrollments.Count(e => e.grade == "A+"),
                        A = 7 * supEnrollments.Count(e => e.grade == "A"),
                        AMinus = 6 * supEnrollments.Count(e => e.grade == "A-"),
                        BPlus = 5 * supEnrollments.Count(e => e.grade == "B+"),
                        B = 4 * supEnrollments.Count(e => e.grade == "B"),
                        BMinus = 3 * supEnrollments.Count(e => e.grade == "B-"),
                        C = 2 * supEnrollments.Count(e => e.grade == "C"),
                        D = 1 * supEnrollments.Count(e => e.grade == "D"),
                        F = 0 * supEnrollments.Count(e => e.grade == "F"),
                        Ungraded = supEnrollments.Count(e => e.grade == null || e.grade == "" || e.grade == "Select Grade"),
                        AverageScore = 8 * supEnrollments.Count(e => e.grade == "A+") + 7 * supEnrollments.Count(e => e.grade == "A") + 6 * supEnrollments.Count(e => e.grade == "A-") +
                        5 * supEnrollments.Count(e => e.grade == "B+") + 4 * supEnrollments.Count(e => e.grade == "B") + 3 * supEnrollments.Count(e => e.grade == "B-") + 2 * supEnrollments.Count(e => e.grade == "C") + 1 * supEnrollments.Count(e => e.grade == "D") +
                        0 * supEnrollments.Count(e => e.grade == "F")


                    }
                };
            }).ToList();

            var list = result.OrderByDescending(s => s.Grades.AverageScore).ToList();

            return Ok(list);
        }


        [HttpGet]
        [Route("GetGradeStudents/{supervisorId}/{grade}")]
        public IHttpActionResult GetGradeStudents(string supervisorId, string grade)
        {
            var gr= "";

            if (grade == "A1")
            {
                gr = "A+";
            }
            if (grade == "A2")
            {
                gr = "A";
            }
            if (grade == "A3")
            {
                gr = "A-";
            }
            if (grade == "A4")
            {
                gr = "B+";
            }
            if (grade == "A5")
            {
                gr = "B";
            }
            if (grade == "A6")
            {
                gr = "B-";
            }
            if (grade == "A7")
            {
                gr = "C";
            }
            if (grade == "A8")
            {
                gr = "D";
            }
           
            if (grade == "A9")
            {
                gr = "F";
            }


            var currentSession = 13;
            var groups = db.ProjectGroups.ToList();
            var groupMembers = db.GroupMembers.ToList();
            var supGroupIds = groups.Where(g => g.supervisorID == supervisorId).Select(g => g.id).ToList();
            var memberRegNums = groupMembers.Where(gm => supGroupIds.Contains(gm.groupID ?? 0)).Select(gm => gm.studentID).ToList();

            var getEnrolledStudents = db.Enrollments.Where(e => e.grade == gr && e.sessionID == currentSession && memberRegNums.Contains(e.studentID)).Select(s => new { StudentId = s.studentID,StudentName=s.Student.name,Project = db.Projects.Where(p => p.id == db.GroupMembers.Where(g =>g.studentID==s.studentID).Select(a => a.ProjectGroup.projectID).FirstOrDefault()).Select(i => i.title) }).ToList();





            //var getSupervisorStudent = db.GroupMembers.Where(w => w.ProjectGroup.supervisorID == supervisorId).Select(s => s.studentID).ToList();
            //var getSubjectWise = db.Enrollments.Where(s => getSupervisorStudent.Contains(s.studentID ?? "") && s.sessionID == currentSession).Select(s => new { Grade = s.grade, StudentID = s.studentID, Project = db.ProjectGroups.Where(p => p.createdBy == s.studentID && p.projectID == db.Projects.Select(t => t.id).FirstOrDefault()) }).ToList();


            //var getGrade= db.Enrollments.Where(g => g.grade==grade).Select(s=> s.studentID)



            return Ok(getEnrolledStudents);
        }
    


    
    
    
    // 3. Group-Wise Detailed Analysis
    [HttpGet]
        [Route("group-wise")]
        public IHttpActionResult GetGroupWiseDetails()
        {
            var groups = db.ProjectGroups.ToList();
            var groupMembers = db.GroupMembers.ToList();
            var enrollments = db.Enrollments.ToList();
            var offeredProjects = db.OfferedProjects.ToList();
            var projects = db.Projects.ToList();
            var users = db.Users.ToList();
            var sessions = db.Sessions.ToList();

            var result = groups.Select(g => {
                var supervisor = users.FirstOrDefault(u => u.id == g.supervisorID);
                var session = sessions.FirstOrDefault(s => s.id == g.createdSession);

                string projectTitle = "No Project Assigned";
                var offered = offeredProjects.FirstOrDefault(op => op.id == g.projectID);
                if (offered != null)
                {
                    var proj = projects.FirstOrDefault(p => p.id == offered.projectID);
                    if (proj != null) projectTitle = proj.title;
                }

                var members = groupMembers.Where(gm => gm.groupID == g.id).Select(gm => {
                    var studentUser = users.FirstOrDefault(u => u.id == gm.studentID);
                    var studentEnrollmentFyp1 = enrollments.FirstOrDefault(e => e.studentID == gm.studentID && e.sessionID == g.createdSession && e.subject == "FYP-1");
                    var studentEnrollmentFyp2 = enrollments.FirstOrDefault(e => e.studentID == gm.studentID && e.sessionID == g.createdSession && e.subject == "FYP-2");

                    return new {
                        RegNum = gm.studentID,
                        StudentName = studentUser != null ? studentUser.name : gm.studentID,
                        Fyp1Grade = studentEnrollmentFyp1 != null ? studentEnrollmentFyp1.grade : null,
                        Fyp2Grade = studentEnrollmentFyp2 != null ? studentEnrollmentFyp2.grade : null
                    };
                }).ToList();

                return new {
                    GroupId = g.id,
                    ProjectTitle = projectTitle,
                    SupervisorName = supervisor != null ? supervisor.name : "Unassigned",
                    SessionName = session != null ? session.name : "Unknown",
                    Members = members
                };
            }).ToList();

            return Ok(result);
        }
    }
}