using ProgressMonitoringProject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace ProgressMonitoringProject.Controllers
{
    [RoutePrefix("api/notifications")]

    public class NotificationsController : ApiController
    {

        private readonly FypProjectProgDBEntities db = new FypProjectProgDBEntities();

        [HttpGet]
        [Route("get-all/{userId}")]
        public IHttpActionResult GetUserNotifications(string userId)
        {
            try
            {
                var notifications = (
                    from nr in db.NotificationRecipients
                    join n in db.Notifications on nr.NotificationID equals n.NotificationID
                    where nr.RecipientID == userId
                    orderby n.CreatedAt descending
                    select new 
                    {
                        Id = n.NotificationID,
                        Title = n.Title,
                        Message = n.Message,
                        Type = n.Type,
                        ReferenceID = n.ReferenceID,
                        CreatedAt = n.CreatedAt,
                        IsRead = nr.IsRead
                    }
                ).ToList();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("mark-read/{notificationId}/{userId}")]
        public IHttpActionResult MarkAsRead(int notificationId, string userId)
        {
            var record = db.NotificationRecipients
                .FirstOrDefault(n =>
                    n.NotificationID == notificationId &&
                    n.RecipientID == userId
                );

            if (record == null)
                return NotFound();

            record.IsRead = 1;
            record.ReadAt = DateTime.Now;

            db.SaveChanges();

            return Ok("Marked as read");
        }

        public void CreateNotification(
    string senderId,
    string senderRole,
    string type,
    int referenceId,
    string title,
    string message,
    List<string> recipientIds,
    string recipientRole
)
        {
            // 1️⃣ Create main notification
            var notification = new Notification
            {
                SenderID = senderId,
                SenderRole = senderRole,
                Type = type,
                ReferenceID = referenceId,
                Title = title,
                Message = message,
                CreatedAt = DateTime.Now
            };

            db.Notifications.Add(notification);
            db.SaveChanges(); // get NotificationID

            // 2️⃣ Add recipients
            var recipients = recipientIds.Select(id => new NotificationRecipient
            {
                NotificationID = notification.NotificationID,
                RecipientID = id,
                RecipientRole = recipientRole,
                IsRead = 0
            }).ToList();

            db.NotificationRecipients.AddRange(recipients);
            db.SaveChanges();
        }

        [HttpPost]
        [Route("create")]
        public IHttpActionResult CreateNotificationApi(NotificationInputModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Title) || model.RecipientIds == null)
                    return BadRequest("Invalid model data");

                CreateNotification(
                    model.SenderId,
                    model.SenderRole,
                    model.Type,
                    model.ReferenceId,
                    model.Title,
                    model.Message,
                    model.RecipientIds,
                    model.RecipientRole
                );

                return Ok("Notification created successfully!");
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }

    public class NotificationInputModel
    {
        public string SenderId { get; set; }
        public string SenderRole { get; set; }
        public string Type { get; set; }
        public int ReferenceId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public List<string> RecipientIds { get; set; }
        public string RecipientRole { get; set; }
    }
}
