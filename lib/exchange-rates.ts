export interface ExchangeRatesSnapshot {
  base: string;
  rates: Record<string, number>;
  providerName: string;
  providerUrl: string;
  providerDocumentation: string;
  lastUpdatedAt: string | null;
  nextUpdatedAt: string | null;
}

function normalizeCurrencyCode(currency: string) {
  return currency.trim().toUpperCase();
}

export function convertAmountWithRates(params: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  baseCurrency: string;
  rates: Record<string, number> | null | undefined;
}) {
  const { amount, fromCurrency, toCurrency, baseCurrency, rates } = params;
  const normalizedFrom = normalizeCurrencyCode(fromCurrency);
  const normalizedTo = normalizeCurrencyCode(toCurrency);
  const normalizedBase = normalizeCurrencyCode(baseCurrency);

  if (!Number.isFinite(amount)) return null;
  if (normalizedFrom === normalizedTo) return amount;
  if (!rates) return null;

  const amountInBase = normalizedFrom === normalizedBase
    ? amount
    : rates[normalizedFrom]
      ? amount / rates[normalizedFrom]
      : null;

  if (amountInBase === null) return null;

  return normalizedTo === normalizedBase
    ? amountInBase
    : rates[normalizedTo]
      ? amountInBase * rates[normalizedTo]
      : null;
}
