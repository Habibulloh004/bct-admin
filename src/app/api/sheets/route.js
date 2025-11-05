import { google } from "googleapis";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1️⃣ JSON faylga to‘liq yo‘l
    const keyFile = path.join(process.cwd(), "src/config/service-account.json");

    // 2️⃣ Auth sozlamalari
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    console.log({auth})

    // 3️⃣ Sheets API bilan ulan
    const sheets = google.sheets({ version: "v4", auth });

    // 4️⃣ Jadval ID
    const spreadsheetId = "1fNK8dUuSap2VVu-u9Vz1nj4gbC_Eq5Pe-vAILZA_igY";

    // 5️⃣ Qaysi oraliqdagi ma’lumotni o‘qiysan
    const range = "A1:E20";

    // 6️⃣ Ma’lumotni olish
    const response = await sheets?.spreadsheets?.values?.get({
      spreadsheetId,
      range,
    });

    const data = response.data.values || [];

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
