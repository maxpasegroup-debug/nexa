import { config as loadEnv } from "dotenv";

loadEnv({ path: "./BGOS/.env.local" });
loadEnv({ path: "./BGOS/.env" });

export default {
  schema: "./BGOS/prisma/schema.prisma",
};
