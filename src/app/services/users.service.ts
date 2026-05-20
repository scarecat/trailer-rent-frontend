import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  block(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/block`, {});
  }

  unblock(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/unblock`, {});
  }
}
