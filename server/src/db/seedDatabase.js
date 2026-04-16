const { Category } = require("../models/Category");
const { Product } = require("../models/Product");
const { seedCategories, seedProducts } = require("../data/seedData");

async function seedDatabase() {
  const productsCount = await Product.countDocuments();

  if (productsCount > 0) {
    return;
  }

  await Category.insertMany(seedCategories.map((name) => ({ name })), { ordered: false }).catch(() => {});
  await Product.insertMany(seedProducts);
}

module.exports = {
  seedDatabase,
};
