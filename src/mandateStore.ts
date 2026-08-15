import fs from "node:fs";
import path from "node:path";
import type { Mandate } from "./types.js";
import { mandate as defaultMandate } from "./mandate.config.js";

const MANDATE_FILE = path.resolve(process.cwd(), "mandate.json");

function readMandate(): Mandate {
  if (!fs.existsSync(MANDATE_FILE)) {
    fs.writeFileSync(MANDATE_FILE, JSON.stringify(defaultMandate, null, 2));
    return { ...defaultMandate };
  }
  const raw = fs.readFileSync(MANDATE_FILE, "utf-8");
  return JSON.parse(raw) as Mandate;
}

function writeMandate(mandate: Mandate): void {
  fs.writeFileSync(MANDATE_FILE, JSON.stringify(mandate, null, 2));
}

export function getMandate(): Mandate {
  return readMandate();
}

export function addMerchant(name: string): Mandate {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Merchant name cannot be empty");
  }
  const mandate = readMandate();
  if (mandate.merchantAllowlist.includes(trimmed)) {
    throw new Error(`"${trimmed}" is already on the allowlist`);
  }
  mandate.merchantAllowlist.push(trimmed);
  writeMandate(mandate);
  return mandate;
}

export function removeMerchant(name: string): Mandate {
  const mandate = readMandate();
  const index = mandate.merchantAllowlist.indexOf(name);
  if (index === -1) {
    throw new Error(`"${name}" is not on the allowlist`);
  }
  mandate.merchantAllowlist.splice(index, 1);
  writeMandate(mandate);
  return mandate;
}

export function renameMerchant(oldName: string, newName: string): Mandate {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error("Merchant name cannot be empty");
  }
  const mandate = readMandate();
  const index = mandate.merchantAllowlist.indexOf(oldName);
  if (index === -1) {
    throw new Error(`"${oldName}" is not on the allowlist`);
  }
  if (mandate.merchantAllowlist.includes(trimmed) && trimmed !== oldName) {
    throw new Error(`"${trimmed}" is already on the allowlist`);
  }
  mandate.merchantAllowlist[index] = trimmed;
  writeMandate(mandate);
  return mandate;
}
