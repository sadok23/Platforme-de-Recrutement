import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface JobDto {
  id?: number;
  recruiter: number;
  title: string;
  description: string;
  location: string;
  salary: number;
  status?: 'open' | 'closed';
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly apiBase = `${environment.apiUrl}/jobs/`;

  constructor(private http: HttpClient) {}

  listJobs(): Observable<JobDto[]> {
    return this.http.get<unknown>(`${this.apiBase}`).pipe(
      map((res: any) => Array.isArray(res) ? res as JobDto[] : (res?.results as JobDto[] ?? []))
    );
  }

  createJob(payload: JobDto): Observable<JobDto> {
    return this.http.post<JobDto>(`${this.apiBase}`, payload);
  }

  getJob(id: number): Observable<JobDto> {
    return this.http.get<JobDto>(`${this.apiBase}${id}/`);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}${id}/`);
  }
}


