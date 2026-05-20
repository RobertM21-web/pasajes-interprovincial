import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "sqlserver://localhost:1433;database=pasajes_db;user=sa;password=Pasajes2026pass;encrypt=true;trustServerCertificate=true",
  },
});

