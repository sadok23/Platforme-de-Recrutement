import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSearchbar, IonTitle, IonToolbar, IonImg } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth-service';
import { JobsService, JobDto } from 'src/app/services/jobs/jobs.service';
import { ApplicationsService, ApplicationDto } from '../../../services/applications/applications.service';
import { NotificationService } from 'src/app/services/notifications/notifications';
export interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}
@Component({
  selector: 'app-candidate-home',
  templateUrl: './candidate-home.page.html',
  styleUrls: ['./candidate-home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonBadge, CommonModule, FormsModule, NgForOf, IonImg]
})
export class CandidateHomePage implements OnInit {
gotoMap() {
    this.router.navigate(['/all-jobs-map']);}
  userFullName: string = '';
  userId: number | null = null;
  jobs: JobDto[] = [];
  filteredJobs: JobDto[] = [];
  keywordQuery: string = '';
  locationQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 6;
  pagedJobs: JobDto[] = [];
  appliedJobIds: Set<number> = new Set<number>();

  constructor(private authService: AuthService, private jobsService: JobsService, private applicationsService: ApplicationsService, private router: Router, private notifService: NotificationService) { }
  notifications: Notification[] = [];
  showNotifications = false;

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const first = user?.first_name || '';
        const last = user?.last_name || '';
        this.userFullName = `${first} ${last}`.trim();
        this.userId = user?.id ?? null;
        console.log(this.userId);
        this.loadAppliedJobsThenJobs();
        console.log("for a second time",this.jobs);
      },
      error: (err) => {
        console.error('Failed to load current user on candidate home', err);
      }
    });
    this.notifService.notifications$.subscribe(notifs => this.notifications = notifs);
    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      console.log('Notifications updated:', this.notifications); // <-- debug log
    });

  }

  private loadAppliedJobsThenJobs() {
    if (!this.userId) { this.loadJobs(); return; }
    this.applicationsService.listForCandidate(this.userId).subscribe({
      next: (apps: ApplicationDto[]) => {
        this.appliedJobIds = new Set((apps || []).map(a => a.job));
        this.loadJobs();
      },
      error: () => this.loadJobs()
    });
  }

  loadJobs() {
    console.log('Loading jobs');
    this.jobsService.listJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        console.log(this.jobs);
        // Show all jobs initially
        this.filteredJobs = this.filterOutApplied(jobs);
        this.updatePage(1);
      },
      error: (err: unknown) => console.error('Failed to load jobs', err)
    });
  }

  onKeywordChange(ev: any) {
    this.keywordQuery = (ev?.detail?.value || '').toLowerCase();
    this.applyFilter();
  }

  onLocationChange(ev: any) {
    this.locationQuery = (ev?.detail?.value || '').toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    const kw = this.keywordQuery?.trim();
    const loc = this.locationQuery?.trim();

    if (!kw && !loc) {
      this.filteredJobs = this.filterOutApplied(this.jobs);
      this.updatePage(1);
      return;
    }
    this.filteredJobs = this.filterOutApplied(this.jobs).filter(j => {
      const title = (j.title || '').toLowerCase();
      const desc = (j.description || '').toLowerCase();
      const location = (j.location || '').toLowerCase();
      const kwMatch = kw ? (title.includes(kw) || desc.includes(kw)) : true;
      const locMatch = loc ? location.includes(loc) : true;
      return kwMatch && locMatch;
    });
    this.updatePage(1);
  }

  private filterOutApplied(jobs: JobDto[]): JobDto[] {
    if (!this.appliedJobIds.size) return jobs;
    return jobs.filter(j => j.id ? !this.appliedJobIds.has(j.id) : true);
  }

  updatePage(page: number) {
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedJobs = this.filteredJobs.slice(start, end);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize));
  }

  gotoJob(job: JobDto) {
    if (!job?.id) return;
    this.router.navigate(['/job', job.id]);
  }

  apply(job: JobDto) {
    if (!this.userId || !job?.id) return;
    this.applicationsService.create({ candidate: this.userId, job: job.id }).subscribe({
      next: () => {
        // optionally show toast; for now, log only
        console.log('Applied to job', job.id);
        // Optimistically remove from UI
        if (job.id) {
          this.appliedJobIds.add(job.id);
          this.filteredJobs = this.filterOutApplied(this.jobs);
          this.updatePage(this.currentPage);
        }
      },
      error: (err) => console.error('Failed to apply', err)
    });
  }
  viewApplications() {
    this.router.navigate(['/applications']);
  }
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number) {
    this.notifService.markAsRead(id);
  }

  deleteNotification(id: number) {
    this.notifService.deleteNotification(id);
  }
  flappy()
  {
    this.router.navigate(['/flappy']);
  }
}
