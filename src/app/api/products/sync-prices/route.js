import { NextResponse } from "next/server";
import { apiRequest } from "@/actions/api";
import {
  columnLetterToIndex,
  fetchSheetValues,
} from "@/lib/googleSheets";

const PRODUCT_ID_COLUMN =
  process.env.GOOGLE_SHEET_PRODUCT_ID_COLUMN || "AE";
const PRODUCT_PRICE_COLUMN =
  process.env.GOOGLE_SHEET_PRICE_COLUMN || "AU";
const API_REVALIDATE =
  process.env.NEXT_PUBLIC_API_REVALIDATE ||
  "https://bct-shop.vercel.app/api/revalidate";
const PRODUCTS_REVALIDATE_TAG =
  process.env.PRODUCTS_REVALIDATE_TAG || "products";
const TARGET_IDS_COLUMN =
  process.env.GOOGLE_SHEET_FILTER_IDS_COLUMN || "AE";

const resolveColumnIndex = (column) => {
  try {
    return columnLetterToIndex(column);
  } catch (error) {
    console.error("Invalid column letter", column, error);
    throw error;
  }
};

const PRODUCT_ID_INDEX = resolveColumnIndex(PRODUCT_ID_COLUMN);
const PRODUCT_PRICE_INDEX = resolveColumnIndex(PRODUCT_PRICE_COLUMN);
const TARGET_IDS_INDEX = TARGET_IDS_COLUMN
  ? resolveColumnIndex(TARGET_IDS_COLUMN)
  : null;

const normalizePriceValue = (value) => {
  if (value === undefined || value === null) return null;

  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  const raw = String(value).replace(/\u00A0/g, " ").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[^0-9.,-]/g, "");
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized = cleaned;

  if (lastComma > lastDot) {
    const whole = cleaned.slice(0, lastComma).replace(/[.,]/g, "");
    const fractional = cleaned.slice(lastComma + 1);
    normalized = `${whole}.${fractional}`;
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(2);
};

const normalizeProductIdValue = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
};

const collectTargetProductIds = (rows) => {
  if (TARGET_IDS_INDEX === null) {
    return null;
  }

  const targets = new Set();

  rows.forEach((row = []) => {
    const rawValue = row[TARGET_IDS_INDEX];
    if (rawValue === undefined || rawValue === null) {
      return;
    }

    const stringValue = String(rawValue);
    const candidates = stringValue
      .split(/[,;\n]/)
      .map((token) => token.trim())
      .filter(Boolean);

    candidates.forEach((candidate) => {
      const normalized = normalizeProductIdValue(candidate);
      if (normalized) {
        targets.add(normalized);
      }
    });
  });

  return targets.size ? targets : null;
};

const determineHeaderRowIndex = (rows) => {
  if (!Array.isArray(rows)) return -1;
  return rows.findIndex((row = []) => {
    const value = row[PRODUCT_ID_INDEX];
    return (
      typeof value === "string" &&
      value.trim().toLowerCase() === "key"
    );
  });
};

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid Authorization header" },
        { status: 401 }
      );
    }

    const sheetValues = await fetchSheetValues();

    if (!sheetValues.length) {
      return NextResponse.json(
        { success: false, error: "Google Sheet returned no data" },
        { status: 404 }
      );
    }

    const targetProductIds = collectTargetProductIds(sheetValues);
    const headerRowIndex = determineHeaderRowIndex(sheetValues);
    const dataRows =
      headerRowIndex >= 0
        ? sheetValues.slice(headerRowIndex + 1)
        : sheetValues;

    let updated = 0;
    let skipped = 0;
    const updatedProducts = [];
    const unchangedProducts = [];
    const failures = [];

    for (const row of dataRows) {
      const productIdRaw = row?.[PRODUCT_ID_INDEX];
      const priceRaw = row?.[PRODUCT_PRICE_INDEX];
      const productId = normalizeProductIdValue(productIdRaw);
      const price = normalizePriceValue(priceRaw);

      if (!productId || !price) {
        skipped += 1;
        continue;
      }

      if (targetProductIds && !targetProductIds.has(productId)) {
        skipped += 1;
        continue;
      }

      try {
        const productResponse = await apiRequest({
          path: `products/${productId}`,
          method: "GET",
          token,
        });

        const previousPriceRaw = productResponse?.data?.price ?? null;
        const previousPrice = normalizePriceValue(previousPriceRaw);

        if (previousPrice === price) {
          unchangedProducts.push({
            productId,
            price: previousPriceRaw ?? price,
          });
          continue;
        }

        await apiRequest({
          path: `products/${productId}`,
          method: "PUT",
          token,
          data: { price },
        });

        updated += 1;
        updatedProducts.push({
          productId,
          previousPrice: previousPriceRaw,
          newPrice: price,
        });
      } catch (error) {
        failures.push({
          productId,
          message: error?.message || "Failed to update product",
          status: error?.status || 500,
        });
      }
    }

    if (updated > 0 && API_REVALIDATE) {
      try {
        await fetch(API_REVALIDATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tag: [PRODUCTS_REVALIDATE_TAG],
          }),
        });
      } catch (revalidateError) {
        console.warn("Failed to trigger revalidation:", revalidateError);
      }
    }

    const responsePayload = {
      success: failures.length === 0,
      processed: dataRows.length,
      updated,
      skipped,
      unchanged: unchangedProducts.length,
      failures,
      updatedProducts,
      unchangedProducts,
    };

    return NextResponse.json(responsePayload, {
      status: failures.length ? 207 : 200,
    });
  } catch (error) {
    console.error("Price sync failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Price sync failed" },
      { status: 500 }
    );
  }
}
