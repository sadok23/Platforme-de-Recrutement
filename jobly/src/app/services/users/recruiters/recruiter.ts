import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class Recruiter {
  // Ensure trailing slash — Django REST Framework default router commonly expects it
  apiUrl = `${environment.apiUrl}/recruiters/`;
  constructor(private http: HttpClient) { }
  getRecruiters():Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
addRecruiter(recruiter: any): Observable<any> {
    console.debug('[Recruiter Service] POST', this.apiUrl, recruiter);
    return this.http.post<any>(this.apiUrl, recruiter);
  }
  deleteRecruiter(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getRecruiter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  updateRecruiter(id: number, recruiter: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, recruiter);
  } 

}
