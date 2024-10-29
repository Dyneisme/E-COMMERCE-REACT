// Import dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configure CORS with origin fallback
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {})
  .then(() => console.log(`MongoDB connected`))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve Static Images over HTTPS
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Image Storage Engine with HTTPS URLs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './upload/images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// API Root
app.get("/", (req, res) => res.send("Express App is Running"));

// Upload Endpoint with HTTPS Image URL
app.post("/upload", upload.single('product'), (req, res) => {
  const imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`;
  res.json({ success: 1, image_url: imageUrl });
});

// Product Schema and Model
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// Add Product Endpoint
app.post('/addproduct', async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// User Schema and Model
const Users = mongoose.model('Users', {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now },
});

// Signup Endpoint with Password Hashing
app.post('/signup', async (req, res) => {
  try {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ success: false, errors: "User with this email already exists" });
    }

    const cart = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [i, 0]));
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login Endpoint with Password Comparison
app.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ success: false, errors: "Incorrect Email" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, errors: "Incorrect Password" });

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// JWT Middleware for Protected Routes
const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ errors: "Unauthorized access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ errors: "Invalid token" });
  }
};

// Add and Remove Product from Cart with JWT Authentication
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
    await userData.save();
    res.json({ success: true, message: "Product added to cart" });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    if (userData.cartData[req.body.itemId] > 0) {
      userData.cartData[req.body.itemId] -= 1;
      await userData.save();
    }
    res.json({ success: true, message: "Product removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Fetch all products endpoint
app.get('/allproducts', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// Get Cart Data
app.post('/getcart', fetchUser, async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
