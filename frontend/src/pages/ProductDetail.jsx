import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Props mein addToCart ko receive kiya hai
function ProductDetail({ addToCart }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`http://localhost:5000/api/products`)
            .then(res => {
                const found = res.data.find(p => p._id === id);
                setProduct(found);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    // 🔥 DYNAMIC SEO SETTING LOGIC - Jab product data load hoga tab active hoga
    useEffect(() => {
        if (product) {
            // Browser Tab Title dynamically change hoga
            document.title = `${product.name} (${product.weight}) | Best Organic Moringa Powder - Morevita`;

            // Meta Description Tag dynamically inject ya update hoga
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            const shortDesc = product.description || "Premium natural health supplement superfood product.";
            metaDesc.setAttribute("content", `Buy ${product.name} online at best price. Net Weight: ${product.weight}. ${shortDesc} 100% natural organic product by Morevita Food Products, a unit of Grainiac Exim.`);
        }
    }, [product]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2D5A27]"></div>
        </div>
    );

    if (!product) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-black text-gray-400">Product nahi mila!</p>
            <button onClick={() => navigate('/')} className="bg-[#2D5A27] text-white px-6 py-2 rounded-xl">Back to Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#FFC107] selection:text-[#2D5A27]">

            {/* Google Crawler Section (Hidden for Users, Active for Google Indexing) */}
            <div className="sr-only hidden">
                <h2>Organic {product.name} Online Shopping India</h2>
                <strong>Brand: Morevita Food Products (Grainiac Exim)</strong>
                <p>Looking for pure organic Sargva / Moringa products? Purchase authentic natural {product.name} with pack size {product.weight} for ultimate immunity booster and daily nutritional health benefits.</p>
            </div>

            {/* --- Navigation Header --- */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 font-black text-[#2D5A27] bg-gray-50 px-5 py-2.5 rounded-2xl hover:bg-[#2D5A27] hover:text-white transition-all duration-300 shadow-sm"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK TO SHOP
                </button>
                <div className="text-2xl font-black tracking-tighter text-[#2D5A27]">MOREVITA<span className="text-[#FFC107]">.</span></div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* --- Left: Image Section --- */}
                <div className="sticky top-10">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[4rem] p-12 flex items-center justify-center shadow-inner relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFC107] opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#2D5A27] opacity-10 rounded-full blur-3xl"></div>

                        <img
                            src={product.image}
                            alt={`${product.name} - Morevita Organic Food Supplement`}
                            className="w-full max-w-md drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                    </div>
                </div>

                {/* --- Right: Info Section --- */}
                <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-[#2D5A27] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                🌿 100% NATURAL MORINGA
                            </span>
                            <span className="bg-yellow-100 text-[#856404] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                {product.weight}
                            </span>
                        </div>
                        {/* SEO Semantic Header */}
                        <h1 className="text-6xl font-black text-gray-900 mt-6 leading-[1.1] tracking-tighter">
                            {product.name}
                        </h1>
                        <p className="text-4xl font-black text-[#2D5A27] mt-4 flex items-center gap-2">
                            <span className="text-2xl opacity-50">₹</span>{product.price.toString().replace('₹', '')}
                        </p>
                    </div>

                    {/* Description Area */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-[#FFC107] rounded-full"></div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">About Product Benefits</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                            {product.description || "Hamara Morevita natural ingredients se bana hai jo aapki sehat ke liye behtareen hai aur vitality ko boost karta hai."}
                        </p>
                    </div>

                    {/* How to Use Box */}
                    <div className="bg-[#2D5A27] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="white"><path d="M17,8C15.34,8 14,9.34 14,11V15H20V11C20,9.34 18.66,8 17,8M17,10C17.55,10 18,10.45 18,11V13H16V11C16,10.45 16.45,10 17,10M7,8C5.34,8 4,9.34 4,11V15H10V11C10,9.34 8.66,8 7,8M7,10C7.55,10 8,10.45 8,11V13H6V11C6,10.45 6.45,10 7,10Z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <span className="bg-[#FFC107] p-2 rounded-xl text-[#2D5A27]">🥣</span>
                            KAISE ISTEMAL KAREIN? (DIRECTIONS OF USE)
                        </h3>
                        <p className="text-green-50 leading-relaxed text-lg italic opacity-90">
                            {product.howToUse || "Garam doodh ya paani ke saath 1 chammach mila kar piyein best performance ke liye."}
                        </p>
                    </div>

                    {/* CTA Section */}
                    <div className="pt-6 space-y-4">
                        <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-[#FFC107] hover:bg-[#ffcd38] py-7 rounded-[2rem] font-black text-2xl text-[#2D5A27] shadow-[0_20px_50px_rgba(255,193,7,0.3)] hover:shadow-none transition-all active:scale-95 uppercase tracking-tighter flex items-center justify-center gap-4"
                        >
                            ADD TO BASKET 🛒
                        </button>
                        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                            ⚡ Fast Delivery across India within 3-5 Days
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Simple Footer --- */}
            <footer className="mt-20 border-t border-gray-100 py-10 text-center">
                <p className="text-gray-400 font-bold text-sm">© 2026 MOREVITA FOOD PRODUCTS. ALL RIGHTS RESERVED. | A UNIT OF GRAINIAC EXIM</p>
            </footer>
        </div>
    );
}

export default ProductDetail;