const express = require("express");
const cors = require("cors");
const path = require("path");

const { env } = require("./config/env");
const { storeInfo } = require("./data/storeInfo");
const { Category } = require("./models/Category");
const { Product } = require("./models/Product");
const { ContactSubmission } = require("./models/ContactSubmission");
const { NewsletterSubscription } = require("./models/NewsletterSubscription");
const { requireAdmin } = require("./middleware/requireAdmin");
const { categorySchema, contactSchema, newsletterSchema, productSchema } = require("./validation/schemas");

const app = express();
const assetsDirectory = path.resolve(__dirname, "../../client/src/assets");
const uploadsDirectory = path.resolve(__dirname, "../../uploads");
const fs = require("fs");

// Ensure uploads directory exists to avoid ENOENT when listing or saving files
try {
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
    console.log("Created uploads directory:", uploadsDirectory);
  }
} catch (e) {
  console.error("Could not ensure uploads directory exists:", e && e.message ? e.message : e);
}

const allowedOrigins = (env.clientOrigin || "").split(",").map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // allow requests with no origin (mobile clients, curl, same-origin)
      if (!incomingOrigin) return callback(null, true);

      if (allowedOrigins.includes(incomingOrigin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded images first, then fallback to client assets
app.use("/static/products", express.static(uploadsDirectory));
app.use("/static/products", express.static(assetsDirectory));

// file upload support (lazy-load multer so server still runs if dependency missing)
app.post("/api/admin/upload", requireAdmin, (req, res) => {
  let multer;
  try {
    multer = require("multer");
  } catch (e) {
    console.error("multer is not installed:", e && e.message ? e.message : e);
    return res.status(500).json({ message: "Server missing dependency 'multer'. Run: npm install --save multer" });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDirectory),
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      cb(null, safeName);
    },
  });

  const upload = multer({ storage }).single("file");

  upload(req, res, (err) => {
    if (err) {
      console.error("upload error", err);
      return res.status(500).json({ message: "Upload failed", error: err.message || err });
    }

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const url = `/static/products/${req.file.filename}`;
    return res.json({ message: "Upload successful", url });
  });
});

// Admin: list uploaded files
app.get("/api/admin/uploads", requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDirectory).filter((f) => f !== ".gitkeep");
    const items = files.map((filename) => ({ filename, url: `/static/products/${filename}` }));
    return res.json({ items, total: items.length });
  } catch (err) {
    console.error("list uploads error", err);
    return res.status(500).json({ message: "Could not list uploads" });
  }
});

// Admin: delete uploaded file
app.delete("/api/admin/uploads/:filename", requireAdmin, (req, res) => {
  try {
    const filename = path.basename(req.params.filename || "");
    if (!filename) return res.status(400).json({ message: "Missing filename" });

    const filePath = path.join(uploadsDirectory, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

    fs.unlinkSync(filePath);
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("delete upload error", err);
    return res.status(500).json({ message: "Could not delete file" });
  }
});

app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    if (username !== env.adminUser || password !== env.adminPass) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ message: "Login successful", adminKey: env.adminApiKey });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "rabina-closet-server",
    database: "mongodb",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/store", (_req, res) => {
  res.json(storeInfo);
});

app.get("/api/categories", async (_req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json(["All", ...categories.map((category) => category.name)]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const category = req.query.category;
    const badge = req.query.badge;
    const search = req.query.search;
    const query = {};

    if (typeof category === "string" && category !== "All") {
      query.category = category;
    }

    if (typeof badge === "string" && badge.trim()) {
      query.badge = badge;
    }

    if (typeof search === "string" && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const items = await Product.find(query).sort({ createdAt: -1 });

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
});

app.post("/api/contact", async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid contact form data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const submission = await ContactSubmission.create(parsed.data);

    return res.status(201).json({
      message: "Message received successfully",
      submission,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/newsletter", async (req, res, next) => {
  try {
    const parsed = newsletterSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid newsletter data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await NewsletterSubscription.findOne({ email: parsed.data.email });

    if (existing) {
      return res.status(200).json({
        message: "Email is already subscribed",
        subscription: existing,
      });
    }

    const subscription = await NewsletterSubscription.create(parsed.data);

    return res.status(201).json({
      message: "Subscribed successfully",
      subscription,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/categories", requireAdmin, async (_req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json(categories.map((category) => ({ id: category._id.toString(), name: category.name })));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/categories", requireAdmin, async (req, res, next) => {
  try {
    const parsed = categorySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid category data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await Category.findOne({ name: parsed.data.name });

    if (existing) {
      return res.status(200).json({
        message: "Category already exists",
        category: { id: existing._id.toString(), name: existing.name },
      });
    }

    const category = await Category.create(parsed.data);

    return res.status(201).json({
      message: "Category created successfully",
      category: { id: category._id.toString(), name: category.name },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/products", requireAdmin, async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid product data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    await Category.updateOne(
      { name: parsed.data.category },
      { $setOnInsert: { name: parsed.data.category } },
      { upsert: true },
    );

    const product = await Product.create(parsed.data);

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid product data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    await Category.updateOne(
      { name: parsed.data.category },
      { $setOnInsert: { name: parsed.data.category } },
      { upsert: true },
    );

    const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  if (error && error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier",
    });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({
      message: "This record already exists",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

module.exports = {
  app,
};
