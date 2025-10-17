# core/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action

from .models import Notification, User, Recruiter, Candidate, Job, Application
from .serializers import (
    NotificationSerializer,
    UserSerializer,
    RecruiterSerializer,
    CandidateSerializer,
    JobSerializer,
    ApplicationSerializer
)

# -----------------------
# User ViewSet
# -----------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Anyone can list/create users

# -----------------------
# Recruiter ViewSet
# -----------------------
class RecruiterViewSet(viewsets.ModelViewSet):
    queryset = Recruiter.objects.all()
    serializer_class = RecruiterSerializer

    def get_permissions(self):
        if self.action == 'create':  # signup
            return [AllowAny()]
        return [IsAuthenticated()]

# -----------------------
# Candidate ViewSet
# -----------------------
class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer

    def get_permissions(self):
        if self.action == 'create':  # signup
            return [AllowAny()]
        return [IsAuthenticated()]

# -----------------------
# Job ViewSet
# -----------------------
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

# -----------------------
# Application ViewSet
# -----------------------
class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        candidate_id = self.request.query_params.get('candidate')
        if candidate_id:
            qs = qs.filter(candidate_id=candidate_id)
        job_id = self.request.query_params.get('job')
        if job_id:
            qs = qs.filter(job_id=job_id)
        return qs

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update application status and send notification if accepted/rejected"""
        application = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['pending', 'accepted', 'rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        print(f"[DEBUG] Updated application {application.id} status to {new_status}")

        # Send notification to candidate if accepted or rejected
        if new_status in ['accepted', 'rejected']:
            if application.candidate:  # ensure candidate exists
                notif = Notification.objects.create(
                    user=application.candidate,  # candidate is already a User
                    title=f"Application {new_status.capitalize()}",
                    body=f"Your application for {application.job.title} has been {new_status}."
                )
                print(f"[DEBUG] Notification created: {notif.title} for {notif.user.username}")
            else:
                print(f"[DEBUG] Skipping notification: candidate missing for application {application.id}")

        serializer = self.get_serializer(application)
        return Response(serializer.data)

# -----------------------
# Current User API
# -----------------------
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# -----------------------
# Notification ViewSet
# -----------------------
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only notifications for the logged-in user
        qs = self.queryset.filter(user=self.request.user)
        print(f"[DEBUG] Returning {qs.count()} notifications for {self.request.user.username}")
        return qs

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        print(f"[DEBUG] Notification {notif.id} marked as read")
        return Response({'status': 'read'})

    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        notif = self.get_object()
        notif.delete()
        print(f"[DEBUG] Notification {notif.id} deleted")
        return Response({'status': 'deleted'})
