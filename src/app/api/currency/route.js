import { NextResponse } from "next/server";

const TARGET_CURRENCY = process.env.CURRENCY_TARGET_CODE || "UZS";
const PRIMARY_SOURCE =
  process.env.CURRENCY_SOURCE_URL || "https://open.er-api.com/v6/latest/USD";
const FALLBACK_SOURCE =
  process.env.CURRENCY_FALLBACK_URL ||
  "https://api.exchangerate.host/latest?base=USD&symbols=UZS";

const extractRate = (payload) => {
  if (typeof payload === "number" && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const directRate = payload.rate ?? payload.value;
    if (typeof directRate === "number" && Number.isFinite(directRate)) {
      return directRate;
    }

    const rates =
      payload.conversion_rates || payload.rates || payload.result || payload.data;
    if (rates && typeof rates === "object") {
      const rate = rates[TARGET_CURRENCY];
      if (typeof rate === "number" && Number.isFinite(rate)) {
        return rate;
      }
    }
  }

  return null;
};

async function loadRateFrom(sourceUrl) {
  const response = await fetch(sourceUrl, { next: { revalidate: 600 } });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Source returned ${response.status}${text ? `: ${text}` : ""}`);
  }

  const payload = await response.json();
  const rate = extractRate(payload);

  if (!rate) {
    throw new Error("Unable to parse rate from payload");
  }

  return rate;
}

export async function GET() {
  const sources = [PRIMARY_SOURCE, FALLBACK_SOURCE].filter(Boolean);
  const errors = [];

  for (const source of sources) {
    try {
      const rate = await loadRateFrom(source);
      return NextResponse.json({ rate });
    } catch (error) {
      errors.push(`${source}: ${error.message}`);
    }
  }

  console.error("Currency fetch failed:", errors.join(" | "));
  return NextResponse.json(
    { error: "Unable to fetch currency rate" },
    { status: 502 }
  );
}
