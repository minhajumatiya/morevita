import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage({ cart, setCart, openOrderForm }) { // 👈 openOrderForm prop yahan receive kiya
  const navigate = useNavigate();

  // Quantity badhane ke liye
  const updateQuantity = (id, delta) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  // Item delete karne ke liye
  const removeItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item._id !== id));
  };

  const totalPrice = cart.reduce((acc, item) => {
    // Price se ₹ aur comma hata kar number nikalna
    const price = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
    return acc + (price * item.quantity);
  }, 0);

  // Checkout handle karne ke liye function
  const handleCheckout = () => {
    // Cart ke saare items ka naam ek saath jodna
    const itemSummary = cart.map(item => `${item.name} (${item.quantity})`).join(", ");

    // Form ko data bhejna
    const cartOrderData = {
      name: itemSummary,
      price: `₹${totalPrice}`,
      _id: "CART_BATCH"
    };

    openOrderForm(cartOrderData);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <h2 className="text-3xl font-black text-gray-300 mb-4 uppercase">Aapka Cart Khali He!</h2>
        <button onClick={() => navigate('/')} className="bg-[#2D5A27] text-white px-8 py-3 rounded-2xl font-bold shadow-lg">SHOPPING KAREIN</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-[#2D5A27] mb-8 uppercase italic tracking-tighter">Your Basket 🛒</h1>

        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between border border-gray-100 gap-4">
              <div className="flex items-center gap-6 w-full">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-xl" />
                <div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{item.name}</h3>
                  <p className="text-[#2D5A27] font-black">{item.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button onClick={() => updateQuantity(item._id, -1)} className="px-3 py-1 font-bold text-xl">-</button>
                  <span className="px-3 font-bold text-[#2D5A27] min-w-[30px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} className="px-3 py-1 font-bold text-xl">+</button>
                </div>
                <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest">REMOVE</button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="mt-10 bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-[#FFC107]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-500 uppercase">Total Amount</span>
            <span className="text-4xl font-black text-[#2D5A27]">₹{totalPrice}</span>
          </div>
          <button
            onClick={handleCheckout} // 👈 Clickable logic
            className="w-full bg-[#2D5A27] text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:bg-green-800 transition-all uppercase tracking-tighter active:scale-95"
          >
            CHECKOUT NOW ⚡
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;