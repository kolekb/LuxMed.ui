import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const clonedRequest = req.clone({
          withCredentials: true,
        });
    
        return next.handle(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Intercepted error:', error);
    
            if (error.status === 401) {
              // Obsługa błędu 401: przekierowanie na login
              console.warn('Unauthorized - redirecting to login');
              this.authService.setSessionExpired(); 
            }
    
            return throwError(() => error);
          })
        );
    }
}
