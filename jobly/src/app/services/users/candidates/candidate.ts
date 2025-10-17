import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class Candidat {
  private apiUrl = `${environment.apiUrl}/candidates/`;

  constructor(private http: HttpClient) {}

  getCandidats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCandidat(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  addCandidat(payload: any): Observable<any> {
    // Accept either a plain object or a pre-built FormData
    const body = payload instanceof FormData ? payload : (() => {
      const fd = new FormData();
      Object.keys(payload || {}).forEach(key => {
        const value = payload[key];
        if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });
      return fd;
    })();

    return this.http.post<any>(this.apiUrl, body);
  }

  updateCandidat(id: number, payload: any): Observable<any> {
    const body = payload instanceof FormData ? payload : (() => {
      const fd = new FormData();
      Object.keys(payload || {}).forEach(key => {
        const value = payload[key];
        if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });
      return fd;
    })();
    return this.http.put<any>(`${this.apiUrl}${id}/`, body);
  }

  deleteCandidat(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}/`);
  }
}
