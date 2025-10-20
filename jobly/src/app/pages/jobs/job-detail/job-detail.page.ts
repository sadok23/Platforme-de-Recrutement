import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonCard, IonCardSubtitle, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { JobsService, JobDto } from 'src/app/services/jobs/jobs.service';
import { ApplicationsService } from 'src/app/services/applications/applications.service';
import { AuthService } from 'src/app/services/auth/auth-service';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  templateUrl: './job-detail.page.html',
  styleUrls: [],
  imports: [IonBackButton, CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonSpinner, IonCard, IonCardSubtitle, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButtons]
})
export class JobDetailPage implements OnInit {
  job: JobDto | null = null;
  userId: number | null = null;
  hasApplied = false;

  constructor(
    private route: ActivatedRoute,
    private jobs: JobsService,
    private apps: ApplicationsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.auth.getCurrentUser().subscribe({
      next: (u) => {
        this.userId = u?.id ?? null;
        this.jobs.getJob(id).subscribe(job => this.job = job);

        this.apps.listForCandidate(this.userId!).subscribe(list => {
          this.hasApplied = !!list.find(a => a.job === id);
        });
      }
    });
  }

  back() {
    this.router.navigateByUrl('/candidate-home');
  }

  apply() {
    if (!this.userId || !this.job?.id || this.hasApplied) return;
    this.apps.create({ candidate: this.userId, job: this.job.id }).subscribe({
      next: () => {
        this.hasApplied = true;
      },
      error: (err) => console.error('Failed to apply', err)
    });
  }
}


