// Import dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer'); 
const fs = require('fs');          
const path = require('path');     
const bcrypt = require('bcrypt');  // Add bcrypt for password hashing
const jwt = require('jsonwebtoken');  // Add jwt for token handling
require('dotenv').config();  // Add dotenv for environment variables

// Initialize the app
const app = express();
app.use(express.json());  // Parse JSON bodies

// Configure CORS
const cors = require('cors');
const allowedOrigins = ['https://e-commerce-react-front-end.onrender.com'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
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
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
  let products = await Product.find({});
  let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;
  
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true, name: req.body.name });
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
  let existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

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
});

// Login Endpoint with Password Comparison
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.json({ success: false, errors: "Wrong Email Id" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.json({ success: false, errors: "Wrong Password" });

  const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});


// Middleware to Fetch User with JWT
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// New Collections Endpoint
app.get('/new-collections', async (req, res) => {
  try {
    const newProducts = await Product.find({}).sort({ date: -1 }).limit(10); // Adjust as needed
    res.json(newProducts);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Popular in Women Endpoint
app.get('/popularinwomen', async (req, res) => {
  try {
    const popularProducts = await Product.find({ category: 'Women' }).sort({ new_price: 1 }).limit(10); // Adjust as needed
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// All Products Endpoint
app.get('/allproducts', async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


// Add and Remove Product from Cart with JWT Authentication
app.post('/addtocart', fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;
  await userData.save();
  res.send("Added");
});

app.post('/removefromcart', fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
  await userData.save();
  res.send("Removed");
});

// creating endpoint to Get Cart Data
app.post('/getcart', fetchUser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
