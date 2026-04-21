import { apiRequest } from './client';
import type { ExchangeRatesSnapshot } from '@/lib/exchange-rates';

export async function getExchangeRates(base: string, symbols: string[]) {
  const params = new URLSearchParams({
    base,
    symbols: symbols.join(','),
  });

  return apiRequest<ExchangeRatesSnapshot>(`/api/exchange-rates?${params.toString()}`);
}
