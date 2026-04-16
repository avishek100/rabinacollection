const mongoose = require("mongoose");
const { env } = require("../config/env");

async function connectToDatabase() {
  await mongoose.connect(env.mongoUri);
}

module.exports = {
  connectToDatabase,
};
