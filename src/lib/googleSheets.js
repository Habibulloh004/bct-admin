import { google } from "googleapis";
import fs from "fs";
import path from "path";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
export const DEFAULT_SERVICE_ACCOUNT_FILE = "service-account.json";
export const DEFAULT_SPREADSHEET_ID =
  "1fNK8dUuSap2VVu-u9Vz1nj4gbC_Eq5Pe-vAILZA_igY";
export const DEFAULT_RANGE_NAME = "bct_price";

export const resolveServiceAccountFile = (filePath) => {
  if (!filePath) {
    throw new Error("Missing Google service account file path");
  }

  if (path.isAbsolute(filePath)) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    throw new Error(`Service account file not found at ${filePath}`);
  }

  const candidates = [
    path.join(process.cwd(), filePath),
    path.join(process.cwd(), "src/app/api/sheets", filePath),
    path.join(process.cwd(), "src/config", filePath),
  ];

  const resolvedPath = candidates.find((candidate) =>
    fs.existsSync(candidate)
  );

  if (!resolvedPath) {
    throw new Error(
      `Service account file not found. Tried: ${candidates.join(", ")}`
    );
  }

  return resolvedPath;
};

export const columnLetterToIndex = (column = "") => {
  if (!column) {
    throw new Error("Column letter must be provided");
  }

  const letters = column.toUpperCase().trim();
  let index = 0;

  for (let i = 0; i < letters.length; i += 1) {
    const charCode = letters.charCodeAt(i);
    if (charCode < 65 || charCode > 90) {
      throw new Error(`Invalid column letter: ${column}`);
    }
    index = index * 26 + (charCode - 64);
  }

  return index - 1;
};

export const fetchSheetValues = async ({
  serviceAccountFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
    DEFAULT_SERVICE_ACCOUNT_FILE,
  spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
  range = process.env.GOOGLE_SHEETS_RANGE || DEFAULT_RANGE_NAME,
} = {}) => {
  const authClient = await new google.auth.GoogleAuth({
    keyFile: resolveServiceAccountFile(serviceAccountFile),
    scopes: SCOPES,
  }).getClient();

  const sheets = google.sheets({ version: "v4", auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response?.data?.values ?? [];
};
