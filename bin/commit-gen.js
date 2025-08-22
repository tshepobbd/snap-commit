#!/usr/bin/env node
import run from "../src/index.js";

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
