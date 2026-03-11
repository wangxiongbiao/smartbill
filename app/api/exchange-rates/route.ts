import { NextRequest, NextResponse } from 'next/server';

const OPEN_EXCHANGE_API_BASE_URL = 'https://open.er-api.com/v6/latest';
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

function parseCurrencyList(rawValue: string | null) {
  if (!rawValue) return [];

  return Array.from(
    new Set(
      rawValue
        .split(',')
        .map((item) => item.trim().toUpperCase())
        .filter((item) => CURRENCY_CODE_PATTERN.test(item))
    )
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const base = (searchParams.get('base') || 'USD').trim().toUpperCase();
  const symbols = parseCurrencyList(searchParams.get('symbols'));

  if (!CURRENCY_CODE_PATTERN.test(base)) {
    return NextResponse.json({ error: 'Invalid base currency' }, { status: 400 });
  }

  try {
    const response = await fetch(`${OPEN_EXCHANGE_API_BASE_URL}/${base}`, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 502 });
    }

    const payload = await response.json() as {
      result?: string;
      provider?: string;
      documentation?: string;
      time_last_update_utc?: string;
      time_next_update_utc?: string;
      rates?: Record<string, number>;
    };

    if (payload.result !== 'success' || !payload.rates) {
      return NextResponse.json({ error: 'Exchange rate provider returned an invalid response' }, { status: 502 });
    }

    const filteredRates = symbols.length > 0
      ? Object.fromEntries(
          symbols
            .filter((symbol) => symbol === base || typeof payload.rates?.[symbol] === 'number')
            .map((symbol) => [symbol, symbol === base ? 1 : payload.rates?.[symbol] as number])
        )
      : { ...payload.rates, [base]: 1 };

    return NextResponse.json({
      base,
      rates: filteredRates,
      providerName: 'ExchangeRate-API',
      providerUrl: payload.provider || 'https://www.exchangerate-api.com',
      providerDocumentation: payload.documentation || 'https://www.exchangerate-api.com/docs/free',
      lastUpdatedAt: payload.time_last_update_utc || null,
      nextUpdatedAt: payload.time_next_update_utc || null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to load exchange rates:', error);
    return NextResponse.json({ error: 'Failed to load exchange rates' }, { status: 500 });
  }
}
