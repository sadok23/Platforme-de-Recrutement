import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth-service';

export interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications$ = new BehaviorSubject<Notification[]>([]);
  apiUrl = `${environment.apiUrl}/notifications/`;

  constructor(private http: HttpClient, private authService: AuthService) {
    // Wait until logged in to fetch notifications
    this.authService.isLoggedIn$
      .pipe(
        filter(loggedIn => loggedIn), // only when logged in
        switchMap(() => this.http.get<Notification[]>(this.apiUrl))
      )
      .subscribe({
        next: data => this.notifications$.next(data),
        error: err => console.error('Failed to load notifications', err)
      });

    // Optional: refresh periodically after login
    setInterval(() => {
      if (this.authService.getToken()) this.loadNotifications();
    }, 10000);
  }

  loadNotifications() {
    this.http.get<Notification[]>(this.apiUrl).subscribe(data => {
      this.notifications$.next(data);
    });
  }

  markAsRead(id: number) {
    this.http.post(`${this.apiUrl}${id}/mark_as_read/`, {}).subscribe(() => {
      const updated = this.notifications$.value.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      );
      this.notifications$.next(updated);
    });
  }

  deleteNotification(id: number) {
    this.http.delete(`${this.apiUrl}${id}/delete_notification/`).subscribe(() => {
      const updated = this.notifications$.value.filter(n => n.id !== id);
      this.notifications$.next(updated);
    });
  }
}
