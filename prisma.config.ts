import { defineConfig } from "prisma/config";
import { existsSync } from "node:fs";

if (existsSync("BGOS/.env")) {
  process.loadEnvFile("BGOS/.env");
}

export default defineConfig({
  schema: "BGOS/prisma/schema.prisma",
});
