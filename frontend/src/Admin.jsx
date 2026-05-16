import React, { useState, useEffect } from 'react';
import axios from 'axios'; //  Sirf ek baar sahi import
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Excel Export Library

function Admin() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [view, setView] = useState('orders');
    const [newProd, setNewProd] = useState({
        name: '', price: '', weight: '250g', image: '', description: '', howToUse: ''
    });
    const [uploading, setUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const token = localStorage.getItem('adminToken');

    const fetchData = async () => {
        try {
            const ordRes = await axios.get('http://localhost:5000/api/admin/orders', { headers: { 'Authorization': token } });
            const prodRes = await axios.get('http://localhost:5000/api/products');
            setOrders(ordRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.log("Fetch Error:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Helper function: Strings me se text hata kar pure number nikalne ke liye (NaN Fix)
    const cleanAmount = (amountStr) => {
        if (!amountStr) return 0;
        const cleaned = String(amountStr).replace(/[^0-9.]/g, '');
        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
    };

    // --- 1. MANUAL EXCEL EXPORT FUNCTION (DATE & SR NO FIXED) ---
    const exportOrdersToExcel = () => {
        try {
            if (orders.length === 0) {
                alert("Export karne ke liye koi order data nahi mila!");
                return;
            }

            const cleanRows = orders.map((o, index) => {
                const finalAmt = cleanAmount(o.totalAmount);

                // Safe Date Logic: Agar database me date na ho, toh fallback lagaya hai
                let formattedDate = "";
                const dateSource = o.createdAt || o.date || o.updatedAt || new Date();
                const d = new Date(dateSource);

                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    formattedDate = `${day}/${month}/${year}`;
                } else {
                    formattedDate = new Date().toLocaleDateString('en-GB');
                }

                return {
                    "Sr No": index + 1, // Clean key bina dot ke (Maximum compatibility)
                    "Order ID": String(o._id || "").slice(-12),
                    "Date": formattedDate, // Ab yahan har order me perfect date aayegi
                    "Customer Name": String(o.customerName || "Customer"),
                    "Phone Number": String(o.phoneNumber || "N/A"),
                    "Product Name": String(o.productName || "N/A"),
                    "Amount (INR)": finalAmt,
                    "Order Status": String(o.status || "Pending").toUpperCase()
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(cleanRows);

            // Width setting taaki columns aapas me chipke nahi
            const columnWidths = [
                { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 25 }, { wch: 14 }, { wch: 15 }
            ];
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Orders Master");

            // Sirf click karne par hi save hoga
            XLSX.writeFile(workbook, `Morevita_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Excel Error:", error);
            alert("Excel export me dikkat aayi!");
        }
    };

    // --- 2. CUSTOMER INVOICE/BILL (EDGE BROWSER COMPATIBLE) ---
    const downloadInvoice = (order) => {
        try {
            const doc = new jsPDF();
            doc.setFont("helvetica", "normal");

            doc.setFontSize(22);
            doc.setTextColor(45, 90, 39);
            doc.text("MOREVITA FOOD PRODUCTS", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text("Minhaj Umatiya", 150, 20);
            doc.text("Founder of Grainiac Exim", 150, 25);
            doc.line(20, 30, 190, 30);

            const dateSource = order.createdAt || order.date || new Date();
            const d = new Date(dateSource);
            const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : "15/05/2026";

            doc.setFontSize(11);
            doc.text("Order ID: " + String(order._id).slice(-12), 20, 42);
            doc.text("Date: " + dateStr, 150, 42);

            doc.text("Bill To: " + String(order.customerName || "Customer"), 20, 55);
            doc.text("Phone: " + String(order.phoneNumber), 20, 62);
            doc.text("Address: " + String(order.address || "N/A"), 20, 69);

            const orderAmt = cleanAmount(order.totalAmount);

            const tableRows = [
                [String(order.productName), String(order.status || "Pending").toUpperCase(), "INR " + orderAmt],
                [{ content: "GRAND TOTAL:", colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: "INR " + orderAmt, styles: { fontStyle: 'bold' } }]
            ];

            autoTable(doc, {
                startY: 78,
                head: [["Product Description", "Status", "Amount"]],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [45, 90, 39] },
                styles: { font: "helvetica", fontSize: 10, cellPadding: 5 }
            });

            doc.save("Bill_" + String(order._id).slice(-6) + ".pdf");
        } catch (error) {
            alert("Bill download failed!");
        }
    };

    // --- 3. BUSINESS ANALYTICS REPORT ---
    const downloadBusinessReport = (type) => {
        try {
            const doc = new jsPDF();
            doc.setFont("helvetica", "normal");

            doc.setFontSize(22);
            doc.setTextColor(45, 90, 39);
            doc.text("MOREVITA FOOD PRODUCTS", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text("Minhaj Umatiya", 150, 20);
            doc.text("Founder of Grainiac Exim", 150, 25);
            doc.line(20, 30, 190, 30);

            doc.setFontSize(14);
            const reportTitle = type === "last_month" ? "BUSINESS REPORT (LAST MONTH)" : "BUSINESS REPORT (ALL TIME)";
            doc.text(reportTitle, 20, 40);

            doc.setFontSize(10);
            doc.text("Generated On: " + new Date().toLocaleDateString('en-GB'), 150, 40);

            let filteredOrders = [...orders];
            if (type === "last_month") {
                const now = new Date();
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filteredOrders = orders.filter(o => o.createdAt && new Date(o.createdAt) >= oneMonthAgo);
            }

            const totalOrdersCount = filteredOrders.length;
            const totalRevenue = filteredOrders.reduce((sum, o) => sum + cleanAmount(o.totalAmount), 0);

            autoTable(doc, {
                startY: 48,
                head: [["Metric Summary", "Value"]],
                body: [
                    ["Total Orders Received", String(totalOrdersCount)],
                    ["Total Revenue Generated", "INR " + String(totalRevenue)]
                ],
                theme: 'striped',
                headStyles: { fillColor: [45, 90, 39] },
                styles: { font: "helvetica", fontSize: 10, cellPadding: 5 }
            });

            let nextY = doc.lastAutoTable.finalY + 12;
            doc.setFontSize(12);
            doc.text("CURRENT AVAILABLE PRODUCTS IN STOCK", 20, nextY);

            const productRows = products.map(p => [String(p.name), String(p.weight), "INR " + String(cleanAmount(p.price))]);

            autoTable(doc, {
                startY: nextY + 4,
                head: [["Product Name", "Weight Pack", "Price"]],
                body: productRows,
                theme: 'grid',
                headStyles: { fillColor: [70, 70, 70] },
                styles: { font: "helvetica", fontSize: 10, cellPadding: 4 }
            });

            doc.save(type === "last_month" ? "Last_Month_Report.pdf" : "All_Time_Report.pdf");
        } catch (error) {
            alert("Report processing failed!");
        }
    };

    // --- STANDARD CRUD OPERATIONS ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': token }
            });
            setNewProd({ ...newProd, image: res.data.imageUrl });
            alert("✅ Image Uploaded!");
        } catch (err) { alert("Upload fail!"); } finally { setUploading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`http://localhost:5000/api/admin/products/${currentId}`, newProd, { headers: { 'Authorization': token } });
            } else {
                await axios.post('http://localhost:5000/api/admin/products', newProd, { headers: { 'Authorization': token } });
            }
            setNewProd({ name: '', price: '', weight: '250g', image: '', description: '', howToUse: '' });
            setEditMode(false);
            fetchData();
            alert("Success!");
        } catch (err) { alert("Action failed!"); }
    };

    const startEdit = (p) => {
        setEditMode(true);
        setCurrentId(p._id);
        setNewProd({ name: p.name, price: p.price, weight: p.weight, image: p.image, description: p.description || '', howToUse: p.howToUse || '' });
        window.scrollTo(0, 0);
    };

    const deleteProduct = async (id) => { if (window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/admin/products/${id}`, { headers: { 'Authorization': token } }); fetchData(); } };
    const deleteOrder = async (id) => { if (window.confirm("Delete order?")) { await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, { headers: { 'Authorization': token } }); fetchData(); } };
    const updateStatus = async (id, status) => { await axios.put(`http://localhost:5000/api/admin/orders/${id}/status`, { status }, { headers: { 'Authorization': token } }); fetchData(); };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border">
                    <button onClick={() => setView('orders')} className={`px-6 py-2 rounded-lg font-bold ${view === 'orders' ? 'bg-[#2D5A27] text-white' : 'text-gray-400'}`}>ORDERS</button>
                    <button onClick={() => setView('products')} className={`px-6 py-2 rounded-lg font-bold ${view === 'products' ? 'bg-[#2D5A27] text-white' : 'text-gray-400'}`}>PRODUCTS</button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => downloadBusinessReport('last_month')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-md">
                        Last Month Report
                    </button>
                    <button onClick={() => downloadBusinessReport('all_time')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-md">
                        All Time Report
                    </button>
                    <button onClick={exportOrdersToExcel} className="bg-[#2D5A27] hover:bg-[#1E3D1A] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-md flex items-center gap-1">
                        📊 Export Excel
                    </button>
                </div>

                <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">LOGOUT</button>
            </div>

            {view === 'products' ? (
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="md:col-span-2 text-xl font-bold text-[#2D5A27]">{editMode ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h3>
                        <input className="border p-3 rounded-xl" placeholder="Name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} required />
                        <input type="file" onChange={handleImageUpload} className="border p-3 rounded-xl" />
                        <input className="border p-3 rounded-xl" placeholder="Price" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} required />
                        <select className="border p-3 rounded-xl" value={newProd.weight} onChange={e => setNewProd({ ...newProd, weight: e.target.value })}>
                            <option value="100g">100g</option><option value="250g">250g</option><option value="500g">500g</option><option value="1kg">1kg</option>
                        </select>
                        <textarea className="border p-3 rounded-xl md:col-span-2" placeholder="Description" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} />
                        <button type="submit" disabled={uploading} className="md:col-span-2 bg-[#FFC107] py-4 rounded-xl font-bold uppercase">{editMode ? 'Save' : 'Add'}</button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.map(p => (
                            <div key={p._id} className="bg-white p-4 rounded-2xl shadow border flex items-center gap-3">
                                <img src={p.image} className="w-12 h-12 rounded object-cover" alt="" />
                                <div className="flex-1 text-sm font-bold">{p.name}</div>
                                <div className="flex flex-col text-xs">
                                    <button onClick={() => startEdit(p)} className="text-blue-500">Edit</button>
                                    <button onClick={() => deleteProduct(p._id)} className="text-red-400">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#2D5A27] text-white text-sm">
                            <tr>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o._id} className="border-b text-sm">
                                    <td className="p-4"><b>{o.customerName}</b><br /><span className="text-gray-400">{o.phoneNumber}</span></td>
                                    <td className="p-4">{o.productName}<br /><b>{o.totalAmount}</b></td>
                                    <td className="p-4">
                                        <select className="border p-1 rounded font-bold" value={o.status || 'Pending'} onChange={(e) => updateStatus(o._id, e.target.value)}>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => downloadInvoice(o)} className="bg-green-100 text-green-700 px-3 py-1 rounded-md font-bold">Bill</button>
                                        <button onClick={() => deleteOrder(o._id)} className="text-red-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Admin;