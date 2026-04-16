const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const env = {
  port: Number(process.env.PORT || 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rabina-closet",
  adminApiKey: process.env.ADMIN_API_KEY || "",
  adminUser: process.env.ADMIN_USER || "",
  adminPass: process.env.ADMIN_PASS || "",
};

module.exports = {
  env,
};
