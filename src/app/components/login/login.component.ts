import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ErrorType } from '../../enums/error-type.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  errorDetails: string[] = [];
  errorType: ErrorType | null = null;
  loggedOut = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {   
    this.route.queryParams.subscribe((params) => {
      this.loggedOut = !!params['loggedOut'];
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.errorType = ErrorType.ValidationError;
      this.errorDetails = [];
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.errorMessage = '';
        this.errorDetails = [];
        this.errorType = null;
        this.router.navigate(['/exchange-rates']); // Przekierowanie po zalogowaniu
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  private handleError(error: any): void {
    this.errorType = error?.error?.errorType as ErrorType;
    this.errorDetails = [];

    switch (this.errorType) {
      case ErrorType.ValidationError:
        this.errorMessage = 'Validation error: Please check your input.';
        this.errorDetails = error?.error?.details || [];
        break;
      case ErrorType.Unauthorized:
        this.errorMessage = 'Unauthorized: Invalid username or password.';
        break;
      case ErrorType.TokenExpired:
        this.errorMessage = 'Session expired. Please log in again.';
        this.router.navigate(['/logout']);
        break;
      case ErrorType.InternalError:
        this.errorMessage = 'An unexpected error occurred. Please try again later.';
        break;
      default:
        this.errorMessage = 'An unknown error occurred.';
    }
  }

  get isValidationError(): boolean {
    return this.errorType === ErrorType.ValidationError;
  }

  get isUnauthorized(): boolean {
    return this.errorType === ErrorType.Unauthorized;
  }

  get isTokenExpired(): boolean {
    return this.errorType === ErrorType.TokenExpired;
  }

  get isInternalError(): boolean {
    return this.errorType === ErrorType.InternalError;
  }
}