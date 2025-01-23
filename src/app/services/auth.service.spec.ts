import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(), 
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should set isAuthenticated to true and start keep-alive on successful login', () => {
      const refreshAfterSeconds = 60;
      service.login('username', 'password').subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'username', password: 'password' });

      req.flush({ refreshAfterSeconds });

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeTrue()
      );
    });

    it('should set isAuthenticated to false on login failure', () => {
      service.login('username', 'password').subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');

      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeFalse()
      );
    });
  });

  describe('logout', () => {
    it('should set isAuthenticated to false and stop keep-alive on logout', () => {
      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');

      req.flush({}); 

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeFalse()
      );
    });
  });

  describe('refreshToken', () => {
    it('should set isAuthenticated to true and reset keep-alive on successful refresh', () => {
      const refreshAfterSeconds = 60;

      service.refreshToken().subscribe((result) =>
        expect(result).toBeTrue()
      );

      const req = httpMock.expectOne('/api/auth/refresh-token');
      expect(req.request.method).toBe('POST');

      req.flush({ refreshAfterSeconds });

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeTrue()
      );
    });

    it('should set isAuthenticated to false on refresh failure', () => {
      service.refreshToken().subscribe((result) =>
        expect(result).toBeFalse()
      );

      const req = httpMock.expectOne('/api/auth/refresh-token');
      expect(req.request.method).toBe('POST');

      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeFalse()
      );
    });
  });

  describe('setSessionExpired', () => {
    it('should set isAuthenticated to false', () => {
      service.setSessionExpired();

      service.isAuthenticated$.subscribe((isAuthenticated) =>
        expect(isAuthenticated).toBeFalse()
      );
    });
  });
});
