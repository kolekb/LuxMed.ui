import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ExchangeRate } from '../../models/exchange-rate.model';
import { AuthService } from '../../services/auth.service';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exchange-rates',
  templateUrl: './exchange-rates.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./exchange-rates.component.css']
})

export class ExchangeRatesComponent implements OnInit, OnDestroy {
  exchangeRates: ExchangeRate[] | null = null;
  paginatedRates: ExchangeRate[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 20; // Liczba elementów na stronie
  totalPages: number = 1;

  lastUpdated: Date | null = null;
  errorMessage: string = '';
  intervalMinutes: number = 5; // Domyślny czas odświeżania w minutach
  private subscriptions: Subscription = new Subscription();
  private intervalSubscription: Subscription | null = null;

  constructor(
    private exchangeRateService: ExchangeRateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchExchangeRates();
    this.subscribeToRates();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.intervalSubscription?.unsubscribe();
  }

  private subscribeToRates(): void {
    this.exchangeRateService.getExchangeRates().subscribe((rates) => {
      this.exchangeRates = rates;
    });

    this.exchangeRateService.getLastUpdated().subscribe((date) => {
      this.lastUpdated = date;
    });
  }

  fetchExchangeRates(): void {
    this.exchangeRateService.fetchExchangeRates().subscribe({
      next: () => {
        this.errorMessage = '';
        this.updatePagination();
      },
      error: () => {
        this.errorMessage = 'Failed to fetch exchange rates. Showing last known rates.';
      },
    });
  }

  // Rozpocznij automatyczne odświeżanie
  startAutoRefresh(): void {
    this.intervalSubscription?.unsubscribe(); // Usuń poprzedni interwał, jeśli istnieje
    this.intervalSubscription = interval(this.intervalMinutes * 60 * 1000) // Czas w milisekundach
      .pipe(switchMap(() => this.exchangeRateService.fetchExchangeRates()))
      .subscribe({
        next: () => {
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'Failed to fetch exchange rates. Showing last known rates.';
        },
      });
  }

  // Ustawienie nowego interwału
  updateInterval(newInterval: number): void {
    if (newInterval >= 1 && newInterval <= 60) {
      this.intervalMinutes = newInterval;
      this.startAutoRefresh();
    } else {
      this.errorMessage = 'Interval must be between 1 and 60 minutes.';
    }
  }

  refreshManually(): void {
    this.fetchExchangeRates();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { loggedOut: true } });
  }

  updatePagination(): void {
    if (this.exchangeRates) {
      this.totalPages = Math.ceil(this.exchangeRates.length / this.itemsPerPage);
      this.paginate();
    } else {
      this.totalPages = 1;
      this.paginatedRates = [];
    }
  }

  paginate(): void {
    if (this.exchangeRates) {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedRates = this.exchangeRates.slice(start, end);
    } else {
      this.paginatedRates = [];
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }
}
