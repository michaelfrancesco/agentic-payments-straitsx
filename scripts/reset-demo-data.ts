import fs from "node:fs";
import path from "node:path";
import { mandate as defaultMandate } from "../src/mandate.config.js";

const DECISIONS_FILE = path.resolve(process.cwd(), "decisions.json");
const MANDATE_FILE = path.resolve(process.cwd(), "mandate.json");

fs.writeFileSync(DECISIONS_FILE, "[]");

const freshMandate = {
  ...defaultMandate,
  expiresAt: Date.now() + 48 * 60 * 60 * 1000,
};
fs.writeFileSync(MANDATE_FILE, JSON.stringify(freshMandate, null, 2));

console.log("Reset decisions.json and mandate.json to defaults.");
