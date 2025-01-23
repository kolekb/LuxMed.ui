import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { ErrorType } from '../../enums/error-type.enum';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      declarations: [],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([
          { path: 'exchange-rates', component: LoginComponent },
          { path: 'logout', component: LoginComponent },
        ]),
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loginForm', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should be valid when username and password are provided', () => {
      component.loginForm.controls['username'].setValue('testuser');
      component.loginForm.controls['password'].setValue('password123');
      expect(component.loginForm.valid).toBeTrue();
    });

    it('should show validation error when form is invalid', () => {
      component.loginForm.controls['username'].setValue('');
      component.loginForm.controls['password'].setValue('');
      component.login();
      expect(component.errorMessage).toBe('Please fill in all required fields correctly.');
      expect(component.errorType).toBe(ErrorType.ValidationError);
    });
  });

  describe('login', () => {
    it('should navigate to /exchange-rates on successful login', async () => {
      authServiceSpy.login.and.returnValue(of(undefined));
      const navigateSpy = spyOn(router, 'navigate').and.callThrough();

      component.loginForm.controls['username'].setValue('testuser');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(navigateSpy).toHaveBeenCalledWith(['/exchange-rates']);
      expect(component.errorMessage).toBe('');
      expect(component.errorType).toBeNull();
    });

    it('should handle Unauthorized error', () => {
      authServiceSpy.login.and.returnValue(
        throwError(() => ({
          error: { errorType: ErrorType.Unauthorized },
        }))
      );

      component.loginForm.controls['username'].setValue('testuser');
      component.loginForm.controls['password'].setValue('wrongpassword');
      component.login();

      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'wrongpassword');
      expect(component.errorMessage).toBe('Unauthorized: Invalid username or password.');
      expect(component.errorType).toBe(ErrorType.Unauthorized);
    });

    it('should handle ValidationError with details', () => {
      authServiceSpy.login.and.returnValue(
        throwError(() => ({
          error: { errorType: ErrorType.ValidationError, details: ['Invalid username'] },
        }))
      );

      component.loginForm.controls['username'].setValue('invalid');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(component.errorMessage).toBe('Validation error: Please check your input.');
      expect(component.errorDetails).toEqual(['Invalid username']);
      expect(component.errorType).toBe(ErrorType.ValidationError);
    });

    it('should handle TokenExpired error and navigate to /logout', async () => {
      authServiceSpy.login.and.returnValue(
        throwError(() => ({
          error: { errorType: ErrorType.TokenExpired },
        }))
      );

      const navigateSpy = spyOn(router, 'navigate').and.callThrough();

      component.loginForm.controls['username'].setValue('testuser');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(component.errorMessage).toBe('Session expired. Please log in again.');
      expect(component.errorType).toBe(ErrorType.TokenExpired);
      expect(navigateSpy).toHaveBeenCalledWith(['/logout']);
    });

    it('should handle InternalError', () => {
      authServiceSpy.login.and.returnValue(
        throwError(() => ({
          error: { errorType: ErrorType.InternalError },
        }))
      );

      component.loginForm.controls['username'].setValue('testuser');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(component.errorMessage).toBe('An unexpected error occurred. Please try again later.');
      expect(component.errorType).toBe(ErrorType.InternalError);
    });
  });

  describe('ngOnInit', () => {
    it('should set loggedOut to true if queryParams contain loggedOut=true', () => {
      const route = TestBed.inject(ActivatedRoute);
      (route.queryParams as any) = of({ loggedOut: 'true' });
      component.ngOnInit();
      expect(component.loggedOut).toBeTrue();
    });

    it('should set loggedOut to false if queryParams do not contain loggedOut=true', () => {
      const route = TestBed.inject(ActivatedRoute);
      (route.queryParams as any) = of({});
      component.ngOnInit();
      expect(component.loggedOut).toBeFalse();
    });
  });
});
