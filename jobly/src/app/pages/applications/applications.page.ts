import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, DatePipe, CurrencyPipe } from '@angular/common';
import { IonBadge, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApplicationsService, ApplicationDto } from '../../services/applications/applications.service';
import { AuthService } from '../../services/auth/auth-service';
import { NotificationService } from '../../services/notifications/notifications';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.page.html',
  styleUrls: ['./applications.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    CommonModule,
    NgForOf,
    DatePipe,
    CurrencyPipe
  ]
})
export class ApplicationsPage implements OnInit {
  applications: ApplicationDto[] = [];
  userId: number | null = null;

  constructor(
    private authService: AuthService,
    private applicationsService: ApplicationsService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userId = user?.id ?? null;
        if (this.userId) {
          this.loadApplications(this.userId);
        }
      },
      error: (err) => console.error('Failed to load current user', err)
    });
  }

  private loadApplications(candidateId: number) {
    this.applicationsService.listForCandidate(candidateId).subscribe({
      next: (apps) => this.applications = apps,
      error: (err) => console.error('Failed to load applications', err)
    });
  }

  // -----------------------
  // Actions for recruiters
  // -----------------------
  updateStatus(app: ApplicationDto, newStatus: 'accepted' | 'rejected') {
    if (!app.id) return;

    this.applicationsService.updateStatus(app.id, newStatus).subscribe({
      next: (updatedApp) => {
        // Update the local list
        const idx = this.applications.findIndex(a => a.id === app.id);
        if (idx > -1) this.applications[idx] = updatedApp;

        // Optionally trigger a notification refresh
        this.notifService.loadNotifications();
      },
      error: (err) => console.error(`Failed to ${newStatus} application`, err)
    });
  }

  // -----------------------
  // Navigation
  // -----------------------
  back() {
    this.router.navigateByUrl('/candidate-home');
  }
}
