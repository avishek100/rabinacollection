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
  app.listen(port, () => {
    console.log(`Rabina Closet API running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
