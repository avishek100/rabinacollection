const productImageBasePath = "/static/products";

const imageUrl = (fileName) => `${productImageBasePath}/${fileName}`;

const seedProducts = [
  {
    name: "Blush Ruffle Dress",
    price: 2450,
    category: "Dresses",
    image: imageUrl("product-1.jpg"),
    images: [imageUrl("product-1.jpg"), imageUrl("product-1.jpg")],
    description:
      "A dreamy blush pink ruffle dress with cinched waist. Perfect for brunch dates and casual outings. Made from soft, breathable fabric that flows beautifully.",
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "New Arrival",
  },
  {
    name: "Classic White Blouse",
    price: 1890,
    category: "Tops",
    image: imageUrl("product-2.jpg"),
    images: [imageUrl("product-2.jpg"), imageUrl("product-2.jpg")],
    description:
      "An elegant white blouse with balloon sleeves and a structured collar. A timeless wardrobe essential that pairs with everything.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Best Seller",
  },
  {
    name: "Cream Linen Trousers",
    price: 2100,
    category: "Casual Wear",
    image: imageUrl("product-3.jpg"),
    images: [imageUrl("product-3.jpg"), imageUrl("product-3.jpg")],
    description:
      "Relaxed-fit cream linen trousers for effortless style. High-waisted with a comfortable elastic back and front pleats.",
    sizes: ["XS", "S", "M", "L"],
    badge: "",
  },
  {
    name: "Sage Midi Skirt",
    price: 1750,
    category: "Dresses",
    image: imageUrl("product-4.jpg"),
    images: [imageUrl("product-4.jpg"), imageUrl("product-4.jpg")],
    description:
      "A flowing sage green midi skirt with an elastic waistband. Beautiful drape and movement for a feminine silhouette.",
    sizes: ["S", "M", "L", "XL"],
    badge: "New Arrival",
  },
  {
    name: "Camel Knit Cardigan",
    price: 2890,
    category: "Tops",
    image: imageUrl("product-5.jpg"),
    images: [imageUrl("product-5.jpg"), imageUrl("product-5.jpg")],
    description:
      "A cozy oversized knit cardigan in warm camel. Features front pockets and chunky buttons. Your go-to layering piece.",
    sizes: ["S", "M", "L"],
    badge: "Best Seller",
  },
  {
    name: "Navy Wrap Dress",
    price: 2650,
    category: "Dresses",
    image: imageUrl("product-6.jpg"),
    images: [imageUrl("product-6.jpg"), imageUrl("product-6.jpg")],
    description:
      "A sophisticated navy blue wrap dress with a flattering silhouette. Versatile enough for work or evening events.",
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "",
  },
];

const seedCategories = [...new Set(seedProducts.map((product) => product.category))];

module.exports = {
  seedProducts,
  seedCategories,
};
