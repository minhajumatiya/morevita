import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import ProductDetail from "./pages/ProductDetail";
import Admin from './Admin';
import CartPage from "./pages/CartPage"; // Sahi directory import rakhi hai
import MyOrders from './pages/MyOrders';

// HomePage Component: Saath me SEO Optimized layout elements
function HomePage({ products, openOrderForm, addToCart }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Hidden Crawler Box: Google SEO indexing badhane ke liye */}
      <div className="sr-only hidden">
        <h2>Buy Best Organic Moringa Powder Online India - Morevita Food Products</h2>
        <p>Premium health supplements, nutritional Moringa energy powder, and natural spices by Grainiac Exim initiative. Order natural organic moringa leaf supplements now.</p>
      </div>

      <section className="bg-[#2D5A27] text-white py-12 px-6 text-center">
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Pure Moringa, More Vitality</h2>
        <p className="text-green-100 mb-6">100% Organic Superfood from Our Farms</p>
      </section>

      <section className="py-12 px-6 max-w-6xl mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {products.map((product, index) => (
            <div key={product._id || product.id || index} className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              <div
                onClick={() => navigate(`/product/${product._id}`)}
                className="h-72 overflow-hidden rounded-xl mb-4 bg-gray-50 flex items-center justify-center cursor-pointer group"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h4
                onClick={() => navigate(`/product/${product._id}`)}
                className="text-xl font-bold mb-1 text-left cursor-pointer hover:text-[#2D5A27]"
              >
                {product.name}
              </h4>
              <p className="text-gray-500 text-sm mb-4 text-left">Net Weight: {product.weight}</p>

              <div className="flex justify-between items-center space-x-2">
                <span className="text-2xl font-black text-[#2D5A27]">{product.price}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#2D5A27] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-800 transition-colors"
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={() => openOrderForm(product)}
                    className="bg-[#FFC107] text-[#2D5A27] px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-500 transition-colors shadow-md"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();

  // Pure website ke metadata ko rank karwane ke liye automatic tag manager
  useEffect(() => {
    document.title = "Morevita Food Products | Organic Moringa Leaf Powder & Supplements India";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Morevita Food Products brings you premium organic Moringa Superfood, high vitality natural immunity boosters, and quality products under Grainiac Exim.");
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log("Data fetch error:", err));
  }, []);

  // 🛒 Add to Cart Logic
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    console.log("Added to cart:", product.name);
  };

  const openOrderForm = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const orderDetails = {
      customerName: formData.name,
      phoneNumber: formData.phone,
      address: formData.address,
      productName: selectedProduct.name,
      totalAmount: selectedProduct.price
    };

    try {
      await axios.post('http://localhost:5000/api/orders', orderDetails);
      alert("Shukriya! Aapka order receive ho gaya hai.");
      setShowForm(false);
      setFormData({ name: '', phone: '', address: '' });
    } catch (err) {
      alert("Order mein error aaya.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#5D4037] relative">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-2xl font-bold text-[#2D5A27] leading-none">MOREVITA</h1>
          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">A Unit of Grainiac Exim</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/my-orders')}
            className="text-sm font-bold text-gray-500 hover:text-[#2D5A27] transition-colors uppercase tracking-tight"
          >
            My Orders
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="bg-[#2D5A27] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2"
          >
            CART ({cart.reduce((acc, item) => acc + item.quantity, 0)})
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage products={products} openOrderForm={openOrderForm} addToCart={addToCart} />} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        <Route path="/admin" element={<Admin />} />

        {/* 🛒 Cart page redirection setup */}
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              setCart={setCart}
              openOrderForm={openOrderForm}
            />
          }
        />

        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="bg-[#1a3517] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm opacity-80 mb-2 underline underline-offset-4">Grainiac Exim</p>
          <p className="text-sm opacity-80 mb-6">FSSAI No: 20726005000509</p>
          <div className="border-t border-green-900 pt-6">
            <p className="text-xs text-green-400 uppercase tracking-widest">Developed and Designed by</p>
            <p className="text-xl font-black text-[#FFC107] mt-1 italic tracking-wider">MINHAJ UMATIYA</p>
          </div>
        </div>
      </footer>

      {showForm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-[#2D5A27] mb-2 uppercase">Confirm Order</h3>
            <form onSubmit={handleOrder} className="space-y-4">
              <input className="w-full p-3 border rounded-xl" placeholder="Aapka Naam" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="w-full p-3 border rounded-xl" placeholder="Mobile Number" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <textarea className="w-full p-3 border rounded-xl h-24" placeholder="Pura Delivery Address" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-500 font-bold">CANCEL</button>
                <button type="submit" className="flex-1 py-3 bg-[#FFC107] text-[#2D5A27] rounded-xl font-bold">PLACE ORDER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;