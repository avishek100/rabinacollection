const path = require("path");
// Load server-specific .env first (server/.env). If not present, fall back to project root .env.
const serverEnv = path.resolve(__dirname, "../.env");
const rootEnv = path.resolve(__dirname, "../../.env");
require("dotenv").config({ path: serverEnv });
require("dotenv").config({ path: rootEnv });
const { app } = require("./app");
const { connectToDatabase } = require("./db/connectToDatabase");
const { seedDatabase } = require("./db/seedDatabase");

async function startServer() {
  await connectToDatabase();
  await seedDatabase();

  const port = Number(process.env.PORT || 3001);
  // Bind to 0.0.0.0 so cloud hosts (Render, Railway, etc.) can reach the server
  const host = "0.0.0.0";
  const server = app.listen(port, host, () => {
    console.log(`[${process.env.NODE_ENV || "development"}] Rabina Closet API running on http://${host}:${port}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000); // force exit after 10s
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
