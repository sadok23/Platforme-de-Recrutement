# core/serializers.py
from rest_framework import serializers
from .models import User, Recruiter, Candidate, Job, Application, Notification

# -----------------------
# User Serializer
# -----------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

# -----------------------
# Recruiter Serializer
# -----------------------
class RecruiterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Recruiter
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'role', 'company_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True},
        }

    def validate_company_name(self, value):
        if not value:
            raise serializers.ValidationError('company_name is required for recruiters')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['role'] = 'recruiter'
        # Use create_user so password is hashed
        recruiter = Recruiter.objects.create_user(**validated_data, password=password)
        return recruiter

# -----------------------
# Candidate Serializer
# -----------------------
class CandidateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Candidate
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'role', 'cv']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['role'] = 'candidate'
        # Use create_user so password is hashed
        candidate = Candidate.objects.create_user(**validated_data, password=password)
        return candidate

# -----------------------
# Job Serializer
# -----------------------
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

# -----------------------
# Application Serializer
# -----------------------
class ApplicationSerializer(serializers.ModelSerializer):
    # Expose nested job details for read operations
    job_detail = JobSerializer(source='job', read_only=True)
    candidate_detail = CandidateSerializer(source='candidate', read_only=True)
    class Meta:
        model = Application
        fields = ['id', 'candidate', 'job', 'status', 'date_applied', 'job_detail', 'candidate_detail']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'created_at', 'is_read']