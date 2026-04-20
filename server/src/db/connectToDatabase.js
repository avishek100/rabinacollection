const mongoose = require("mongoose");

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rabina-closet";
  await mongoose.connect(uri);
}

module.exports = {
  connectToDatabase,
};
