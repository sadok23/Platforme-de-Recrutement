import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
      private apiUrl = `${environment.apiUrl}`;
  private tokenKey = 'access_token';

  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/token/`, { username, password })
      .pipe(
        tap((tokens) => {
          localStorage.setItem(this.tokenKey, tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          this.isLoggedIn$.next(true);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('refresh_token');
    this.isLoggedIn$.next(false);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
getCurrentUser() {
  const token = this.getToken();
  if (!token) throw new Error('No access token found');

  return this.http.get<any>(`${this.apiUrl}/me/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
