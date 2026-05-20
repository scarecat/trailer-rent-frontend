import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trailer } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrailersService {
  private url = `${environment.apiUrl}/trailers`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { status?: string; type?: string; maxPrice?: number }): Observable<Trailer[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    return this.http.get<Trailer[]>(this.url, { params });
  }

  getById(id: number): Observable<Trailer> {
    return this.http.get<Trailer>(`${this.url}/${id}`);
  }

  create(dto: any): Observable<Trailer> {
    return this.http.post<Trailer>(this.url, dto);
  }

  update(id: number, dto: any): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
