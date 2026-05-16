const productSchema = new mongoose.Schema({
    name: { type: String, required: true, default: "Morevita Premium Moringa Powder" },
    // Price ko String rakhein taaki ₹ sign store ho sake
    price: {
        type: String,
        required: true,
        default: "₹0" // By default ₹0 aayega
    },
    description: { type: String, default: "100% Organic Moringa Leaf Powder" },
    weight: { type: String, default: "250g" },
    imageUrl: { type: String, required: true },
    stock: { type: Number, default: 100 },
    fssaiNo: { type: String, default: "20726005000509" },
    parentCompany: { type: String, default: "Grainiac Exim" }
});