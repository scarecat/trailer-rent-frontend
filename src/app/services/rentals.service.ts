import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rental, CreateRentalDto } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class RentalsService {
  private url = `${environment.apiUrl}/rentals`;

  constructor(private http: HttpClient) {}

  create(dto: CreateRentalDto): Observable<Rental> {
    return this.http.post<Rental>(this.url, dto);
  }

  getMy(): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.url}/my`);
  }

  getAll(): Observable<Rental[]> {
    return this.http.get<Rental[]>(this.url);
  }

  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/approve`, {});
  }

  reject(id: number, note?: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/reject`, note ? JSON.stringify(note) : null, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  cancel(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cancel`, {});
  }
}
