const { app } = require("./app");
const { env } = require("./config/env");
const { connectToDatabase } = require("./db/connectToDatabase");
const { seedDatabase } = require("./db/seedDatabase");

async function startServer() {
  await connectToDatabase();
  await seedDatabase();

  app.listen(env.port, () => {
    console.log(`Rabina Closet API running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
