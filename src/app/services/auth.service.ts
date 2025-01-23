import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private refreshTokenTimer: any; // Timer do automatycznego odświeżania tokena

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient){}

  login(username: string, password: string): Observable<void> {
    return this.http.post<{ refreshAfterSeconds: number }>('/api/auth/login', { username, password }, { withCredentials: true }).pipe(
      map((response) => {
        this.isAuthenticatedSubject.next(true);
  
        // Rozpocznij cykl odświeżania tokena na podstawie czasu z odpowiedzi
        const refreshAfterMs = response.refreshAfterSeconds * 1000;
        this.startSessionKeepAlive(refreshAfterMs);
  
        return;
      }),
      catchError((error) => {
        this.isAuthenticatedSubject.next(false);
        this.stopSessionKeepAlive();
        throw error;
      })
    );
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        this.isAuthenticatedSubject.next(false);
        this.stopSessionKeepAlive();
      },
      error: () => console.error('Logout failed'),
    });
  }

  private startSessionKeepAlive(refreshAfterMs: number): void {
    this.stopSessionKeepAlive(); // Upewnij się, że poprzedni timer został usunięty
    this.refreshTokenTimer = timer(refreshAfterMs).subscribe(() => {
      this.refreshToken().subscribe();
    });
  }

  private stopSessionKeepAlive(): void {
    if (this.refreshTokenTimer) {
      this.refreshTokenTimer.unsubscribe();
      this.refreshTokenTimer = null;
    }
  }

  refreshToken(): Observable<boolean> {
    return this.http.post<{ refreshAfterSeconds: number }>('/api/auth/refresh-token', {}, { withCredentials: true }).pipe(
      map((response) => {
        this.isAuthenticatedSubject.next(true);

        // Ustawienie interwału dla kolejnego odświeżenia
        const refreshAfterMs = response.refreshAfterSeconds * 1000;
        this.startSessionKeepAlive(refreshAfterMs);

        return true;
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        this.stopSessionKeepAlive();

        return of(false);
      })
    );
  }

  setSessionExpired(): void {
    this.isAuthenticatedSubject.next(false);
  }
}
