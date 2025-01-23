import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ExchangeRate } from '../models/exchange-rate.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private apiUrl = 'http://localhost:5000/api/exchange-rates';

  private exchangeRatesSubject = new BehaviorSubject<ExchangeRate[] | null>(null);
  private lastUpdatedSubject = new BehaviorSubject<Date | null>(null);

  constructor(private http: HttpClient) {}

  // Pobranie kursów walut z API
  fetchExchangeRates(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>(this.apiUrl, { withCredentials: true }).pipe(
      tap((rates) => {
        // Zapisz nowe dane w stanie
        this.exchangeRatesSubject.next(rates);
        this.lastUpdatedSubject.next(new Date());
      }),
      catchError((error) => {
        console.error('Error fetching exchange rates:', error);
        return throwError(() => error);
      })
    );
  }

  getExchangeRates(): Observable<ExchangeRate[] | null> {
    return this.exchangeRatesSubject.asObservable();
  }

  getLastUpdated(): Observable<Date | null> {
    return this.lastUpdatedSubject.asObservable();
  }
}
