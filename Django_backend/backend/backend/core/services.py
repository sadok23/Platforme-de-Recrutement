# core/services.py
from .models import Application, Notification

def set_application_status(application: Application, new_status: str):
    application.status = new_status
    application.save()

    if new_status in ["accepted", "rejected"]:
        Notification.objects.create(
            user=application.candidate,
            title=f"Application {new_status.capitalize()}",
            body=f"Your application for {application.job.title} has been {new_status}."
        )
