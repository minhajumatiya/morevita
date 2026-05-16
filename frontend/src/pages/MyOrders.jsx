import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyOrders() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // SEO Dynamic Meta Setup - Page load hote hi Google Search Bots ke liye tags set honge
    useEffect(() => {
        document.title = "Track My Orders | Morevita Food Products - Organic Moringa & Healthy Foods";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Track your Morevita Food Products orders online. Check live delivery status of your premium organic Moringa powder, energy boosters, and healthy snacks.");
        }
    }, []);

    const fetchOrders = async () => {
        if (!phone) return alert("Pehle mobile number dalein!");
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/user/${phone}`);
            setOrders(res.data);
            if (res.data.length === 0) alert("Is number par koi order nahi mila.");
        } catch (err) {
            alert("Orders fetch karne mein error aaya.");
        }
        setLoading(false);
    };

    // Status ke hisab se border aur background color coding logic
    const getStatusStyles = (status) => {
        const currentStatus = String(status || 'PENDING').toUpperCase();
        switch (currentStatus) {
            case 'CONFIRMED':
                return { border: 'border-l-8 border-blue-500', bg: 'bg-blue-100 text-blue-800' };
            case 'SHIPPED':
                return { border: 'border-l-8 border-purple-500', bg: 'bg-purple-100 text-purple-800' };
            case 'DELIVERED':
                return { border: 'border-l-8 border-green-500', bg: 'bg-green-100 text-green-800' };
            case 'PENDING':
            default:
                return { border: 'border-l-8 border-amber-500', bg: 'bg-amber-100 text-amber-800' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Google Crawler Section (Hidden for Users, Active for Google SEO Bots) */}
            <div className="sr-only hidden">
                <h2>Buy Best Organic Moringa Powder Online India</h2>
                <p>Morevita Food Products brings you the finest quality Moringa supplements, healthy snacks, and premium spices delivered directly to your doorstep.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* SEO Friendly H1 Header with brand keywords */}
                <h1 className="text-3xl font-black text-[#2D5A27] mb-2 uppercase italic">
                    My Orders 📦
                </h1>
                <p className="text-xs text-gray-500 mb-8 font-semibold tracking-wide uppercase">
                    Morevita Food Products — Live Order Tracking Panel
                </p>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-3xl shadow-md mb-8 flex gap-3">
                    <input
                        type="tel"
                        placeholder="Apna Mobile Number Dalein"
                        className="flex-1 p-3 border rounded-xl"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button
                        onClick={fetchOrders}
                        className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#1E3D1A]"
                    >
                        {loading ? 'Searching...' : 'FIND'}
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order) => {
                        const styles = getStatusStyles(order.status);
                        const dateSource = order.createdAt || order.date || new Date();
                        const formattedDate = new Date(dateSource).toLocaleDateString('en-GB');

                        return (
                            <div key={order._id} className={`bg-white p-6 rounded-2xl shadow-sm ${styles.border}`}>
                                <div className="flex justify-between mb-2 items-center">
                                    <span className="font-black text-gray-800 uppercase text-sm">
                                        Order ID: {String(order._id).slice(-6)}
                                    </span>
                                    {/* LIVE DYNAMIC STATUS BADGE */}
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${styles.bg}`}>
                                        {order.status || 'PENDING'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">{order.productName}</h3>
                                <p className="text-gray-500 text-sm mt-1">{order.address}</p>
                                <div className="mt-4 flex justify-between items-center border-t pt-4">
                                    <span className="text-gray-400 text-xs font-semibold">{formattedDate}</span>
                                    <span className="text-xl font-black text-[#2D5A27]">{order.totalAmount}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MyOrders;