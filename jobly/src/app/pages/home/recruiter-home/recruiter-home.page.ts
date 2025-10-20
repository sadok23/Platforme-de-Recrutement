import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth-service';
import { JobsService, JobDto } from 'src/app/services/jobs/jobs.service';

@Component({
  selector: 'app-recruiter-home',
  templateUrl: './recruiter-home.page.html',
  styleUrls: ['./recruiter-home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel, CommonModule, FormsModule, RouterModule, NgForOf]
})
export class RecruiterHomePage implements OnInit {
  userFullName: string = '';
  userId: number | null = null;
  jobs: JobDto[] = [];
  deleting: Record<number, boolean> = {};

  constructor(private authService: AuthService, private jobsService: JobsService, private router: Router) { }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const first = user?.first_name || '';
        const last = user?.last_name || '';
        this.userFullName = `${first} ${last}`.trim();
        this.userId = user?.id ?? null;
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to load current user on recruiter home', err);
      }
    });
  }

  loadJobs() {
    this.jobsService.listJobs().subscribe({
      next: (jobs) => {
        const recruiterId = this.userId;
        this.jobs = recruiterId ? jobs.filter(j => j.recruiter === recruiterId) : jobs;
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  onAddJob() {
    this.router.navigateByUrl('/add-job');
  }

  viewApplications(job: JobDto) {
    if (!job?.id) return;
    this.router.navigate(['/job', job.id, 'applications']);
  }

  deleteJob(job: JobDto) {
    if (!job?.id) return;
    this.deleting[job.id] = true;
    this.jobsService.deleteJob(job.id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== job.id);
      },
      error: (err) => console.error('Failed to delete job', err),
      complete: () => { if (job.id) delete this.deleting[job.id]; }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
