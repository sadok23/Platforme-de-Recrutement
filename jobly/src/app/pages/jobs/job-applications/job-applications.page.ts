import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBadge, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { ApplicationsService, ApplicationDto } from '../../../services/applications/applications.service';
import { JobsService, JobDto } from '../../../services/jobs/jobs.service';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonBadge, IonButton, IonSelect, IonSelectOption, CommonModule, NgForOf],
  templateUrl: './job-applications.page.html',
  styleUrls: ['./job-applications.page.scss']
})
export class JobApplicationsPage implements OnInit {
  jobId!: number;
  job?: JobDto;
  applications: ApplicationDto[] = [];
  saving: Record<number, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationsService: ApplicationsService,
    private jobsService: JobsService,
  ) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.jobId) {
      this.back();
      return;
    }

    this.jobsService.getJob(this.jobId).subscribe({
      next: (job) => this.job = job,
      error: (err) => console.error('Failed to load job', err)
    });

    this.loadApplications();
  }

  loadApplications() {
    this.applicationsService.listForJob(this.jobId).subscribe({
      next: (apps) => {
        this.applications = apps;
        console.log('[DEBUG] Loaded applications:', this.applications);
      },
      error: (err) => console.error('Failed to load applications', err)
    });
  }

  setStatus(app: ApplicationDto, status: 'pending' | 'accepted' | 'rejected' | undefined) {
    if (!status || !app?.id) return;

    this.saving[app.id] = true;

    // Use custom update_status POST action to trigger notifications
    this.applicationsService.updateStatus(app.id, status).subscribe({
      next: (updated) => {
        const idx = this.applications.findIndex(a => a.id === app.id);
        if (idx >= 0) this.applications[idx] = { ...this.applications[idx], ...updated };
        console.log(`[DEBUG] Updated application ${app.id} status to ${status}`);
        console.log('[DEBUG] Notification should be created on backend now');
      },
      error: (err) => console.error('Failed to update status', err),
      complete: () => { if (app.id) delete this.saving[app.id]; }
    });
  }

  back() {
    this.router.navigateByUrl('/recruiter-home');
  }
}
