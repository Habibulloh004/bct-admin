'use server';


// Fetch currency rate on the server to avoid client-side CORS issues
export async function fetchCurrencyRate(priceUsd = 100) {
  const explicitEnv = process.env.NEXT_PUBLIC_API_CURRENCY || "http://localhost:3000"

  const apiUrl = `${explicitEnv}/api/currency`;
  const res = await fetch(apiUrl, {
    cache: 'force-cache',
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const message =
      payload?.message || payload?.error || `Currency request failed with ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = payload;
    throw error;
  }

  const rawRate = await res.json();
  const rate =
    typeof rawRate === 'number' ? rawRate : Number(rawRate?.rate ?? rawRate?.value);

  if (!rate || Number.isNaN(rate)) {
    throw new Error('Invalid currency response');
  }

  const markupMultiplier = 1.01;
  let total = priceUsd * rate;
  total = total * markupMultiplier;
  total = Math.round(total / 1000) * 1000;
  const roundedBct = total / priceUsd;
  const bctRate = Number((rate * markupMultiplier).toFixed(4));

  return {
    official: rate,
    bct: bctRate,
    roundedBct,
    lastUpdated: new Date().toISOString(),
  };
}
