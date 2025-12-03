import { google } from "googleapis";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
export const DEFAULT_SPREADSHEET_ID =
  "1fNK8dUuSap2VVu-u9Vz1nj4gbC_Eq5Pe-vAILZA_igY";
export const DEFAULT_RANGE_NAME = "bct_price";

const normalizePrivateKey = (key) => {
  if (!key) return key;
  const trimmed = key.trim();
  return trimmed.includes("\\n") ? trimmed.replace(/\\n/g, "\n") : trimmed;
};

const tryParseJson = (value) => {
  if (!value) return null;
  return JSON.parse(value);
};

const tryParseBase64Json = (value) => {
  if (!value) return null;
  const decoded = Buffer.from(value, "base64").toString("utf8");
  return JSON.parse(decoded);
};

const resolveServiceAccountCredentials = () => {
  const buildFromDiscreteEnv = () => {
    const requiredKeys = [
      "GOOGLE_PRIVATE_KEY",
      "GOOGLE_CLIENT_EMAIL",
      "GOOGLE_PROJECT_ID",
    ];
    const missingKey = requiredKeys.find((key) => !process.env[key]);
    if (missingKey) {
      return null;
    }

    return {
      type: process.env.GOOGLE_TYPE || "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri:
        process.env.GOOGLE_AUTH_URI ||
        "https://accounts.google.com/o/oauth2/auth",
      token_uri:
        process.env.GOOGLE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL ||
        "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain:
        process.env.GOOGLE_UNIVERSE_DOMAIN || "googleapis.com",
    };
  };

  const buildFromInlineEnv = () => {
    const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!rawCredentials) return null;

    const parseAttemptOrder = [
      () => tryParseJson(rawCredentials),
      () => tryParseBase64Json(rawCredentials),
    ];

    for (const attempt of parseAttemptOrder) {
      try {
        const parsed = attempt();
        if (!parsed) continue;
        if (!parsed.private_key || !parsed.client_email) {
          throw new Error("Invalid service account payload");
        }
        return {
          ...parsed,
          private_key: normalizePrivateKey(parsed.private_key),
        };
      } catch (error) {
        if (attempt === parseAttemptOrder[parseAttemptOrder.length - 1]) {
          console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT value:", error);
        }
      }
    }

    return null;
  };

  return buildFromDiscreteEnv() || buildFromInlineEnv();
};

export const fetchSheetValues = async ({
  spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
  range = process.env.GOOGLE_SHEETS_RANGE || DEFAULT_RANGE_NAME,
} = {}) => {
  const credentials = resolveServiceAccountCredentials();

  if (!credentials) {
    throw new Error(
      "Missing Google service account credentials. Set GOOGLE_PRIVATE_KEY / GOOGLE_CLIENT_EMAIL / GOOGLE_PROJECT_ID or GOOGLE_SERVICE_ACCOUNT."
    );
  }

  const authClient = await new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  }).getClient();

  const sheets = google.sheets({ version: "v4", auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response?.data?.values ?? [];
};
