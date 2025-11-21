import { NextResponse } from "next/server";

const currencyApiUrl =
  process.env.CURRENCY_API || "https://cbu.uz/ru/arkhiv-kursov-valyut/json";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const res = await fetch(currencyApiUrl, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Currency API responded with ${res.status}`);
    }

    const currencyData = await res.json();
    const findData = Array.isArray(currencyData)
      ? currencyData.find((cr) => cr.Ccy === "USD")
      : null;
    const data = Number(findData?.Rate);

    if (Number.isFinite(data)) {
      return NextResponse.json(data, { headers: CORS_HEADERS });
    }
  } catch (err) {
    console.error("[currency] fetch failed", err);
  }

  return NextResponse.json(12000, { headers: CORS_HEADERS, status: 200 });
}
