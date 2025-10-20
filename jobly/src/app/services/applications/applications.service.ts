import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface ApplicationDto {
  id?: number;
  candidate: number;
  job: number;
  status?: 'pending' | 'accepted' | 'rejected';
  date_applied?: string;
  job_detail?: {
    id: number;
    title: string;
    description: string;
    location: string;
    salary: number;
    status: 'open' | 'closed';
  };
  candidate_detail?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: 'candidate';
    cv?: string; // URL
  };
}

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly apiBase = `${environment.apiUrl}/applications/`;

  constructor(private http: HttpClient) {}

  create(payload: ApplicationDto): Observable<ApplicationDto> {
    return this.http.post<ApplicationDto>(`${this.apiBase}`, payload);
  }

  listForCandidate(candidateId: number): Observable<ApplicationDto[]> {
    return this.http.get<ApplicationDto[]>(`${this.apiBase}?candidate=${candidateId}`);
  }

  listForJob(jobId: number): Observable<ApplicationDto[]> {
    return this.http.get<ApplicationDto[]>(`${this.apiBase}?job=${jobId}`);
  }

  updateStatus(appId: number, status: 'pending' | 'accepted' | 'rejected') {
    return this.http.post<ApplicationDto>(`${this.apiBase}${appId}/update_status/`, { status });
  }
  
}


