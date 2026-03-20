import { initDb } from "./db";

console.log("Starting manual migration...");
await initDb();
console.log("Migration finished.");
process.exit(0);
