import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LoginComponent } from "./components/login/login.component";
import { ExchangeRatesComponent } from "./components/exchange-rates/exchange-rates.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, LoginComponent, ExchangeRatesComponent],
})
export class AppComponent implements OnInit{
  isAuthenticated = false;
  isLoading = true;

  constructor (private authService: AuthService){
    this.authService.isAuthenticated$.subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
    });
    this.authService.refreshToken().subscribe();
  }

  ngOnInit(): void {
    this.isLoading = false;
  }
}