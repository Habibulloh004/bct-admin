import { NextResponse } from "next/server";
import { fetchSheetValues } from "@/lib/googleSheets";

export async function GET() {
  try {
    const values = await fetchSheetValues();
    return NextResponse.json({
      success: true,
      data: values,
    });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
