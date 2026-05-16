const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. Uploads Folder & Static Setup ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Morevita DB Connected!"))
    .catch(err => console.log("❌ DB Error: ", err));

// --- 3. Schemas & Models ---
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    weight: String,
    image: String,
    description: String,   // Naya field
    howToUse: String,       // Naya field
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: String,
    address: String,
    productName: String,
    totalAmount: String,
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: "Pending" }
});
const Order = mongoose.model('Order', OrderSchema);

// --- 4. Admin Config ---
const ADMIN_TOKEN = "secret_admin_key_123";

// --- 5. Multer Config (Storage) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// --- 6. PUBLIC ROUTES ---

// Products fetch karne ke liye
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// NAYA ORDER SAVE KARNE KE LIYE (Fixed)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            productName: req.body.productName,
            totalAmount: req.body.totalAmount,
            status: "Pending"
        });
        await newOrder.save();
        res.status(201).json({ message: "Order Saved Successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 7. ADMIN ROUTES (Protected) ---

// Image Upload
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send("File nahi mili");
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Get All Orders for Admin
app.get('/api/admin/orders', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Product Add karna
app.post('/api/admin/products', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PRODUCT UPDATE ROUTE (Fixed 404 Error)
app.put('/api/admin/products/:id', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        const { name, price, weight, image } = req.body;
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, weight, image },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Product nahi mila" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Order Status Update
app.put('/api/admin/orders/:id/status', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Product
app.delete('/api/admin/products/:id', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Order
app.delete('/api/admin/orders/:id', async (req, res) => {
    if (req.headers['authorization'] !== ADMIN_TOKEN) return res.status(403).send("Forbidden");
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// Backend: GET orders by phone number
app.get('/api/orders/user/:phone', async (req, res) => {
    try {
        const orders = await mongoose.model('Order').find({ phoneNumber: req.params.phone }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Orders nahi mile" });
    }
});
// 📦 User ke mobile number se orders dhundne ka rasta
app.get('/api/orders/user/:phone', async (req, res) => {
    try {
        const phoneNum = req.params.phone;

        // Database mein orders dhundo jahan phoneNumber match kare
        const orders = await mongoose.model('Order').find({ phoneNumber: phoneNum }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Is number par koi order nahi mila." });
        }

        res.json(orders);
    } catch (err) {
        console.error("Order fetch error:", err);
        res.status(500).json({ message: "Server mein error aaya." });
    }
});
// --- 8. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));