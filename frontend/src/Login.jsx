import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/admin/login', { username, password });
            localStorage.setItem('adminToken', res.data.token);
            navigate('/admin');
        } catch (err) {
            alert("Galat password!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#2D5A27]">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-2xl w-96">
                <h2 className="text-2xl font-black text-[#2D5A27] mb-6 text-center">MOREVITA ADMIN</h2>
                <input className="w-full p-3 border rounded-xl mb-4" placeholder="Username" onChange={e => setUsername(e.target.value)} />
                <input className="w-full p-3 border rounded-xl mb-6" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button className="w-full py-3 bg-[#FFC107] text-[#2D5A27] font-bold rounded-xl shadow-lg">ENTER DASHBOARD</button>
            </form>
        </div>
    );
}
export default Login;