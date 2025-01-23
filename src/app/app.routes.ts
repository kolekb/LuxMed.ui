import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ExchangeRatesComponent } from './components/exchange-rates/exchange-rates.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'exchange-rates', component: ExchangeRatesComponent},
];
