#!/usr/bin/env node
import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs '<password>'");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

process.stdout.write(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}\n`);
