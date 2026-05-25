import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), ".tokens.json");

interface StoredTokens {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  access_token?: string;
  refresh_token?: string;
}

export function loadTokens(): StoredTokens {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

export function saveTokens(data: Partial<StoredTokens>): void {
  try {
    const existing = loadTokens();
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ ...existing, ...data }, null, 2));
  } catch (err) {
    console.error("Failed to save tokens:", err);
  }
}
