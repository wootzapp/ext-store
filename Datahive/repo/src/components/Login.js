import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/DataHive-icon-128.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userString = localStorage.getItem(email);
            if (!userString) {
                throw new Error('User not found');
            }

            const user = JSON.parse(userString);
            if (user.password !== password) {
                throw new Error('Incorrect password');
            }

            localStorage.setItem('currentUser', email);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/home');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full items-center justify-center bg-gray-900 text-white font-sans p-4 overflow-auto">
            <div className="w-full">
                <img src={logo} alt="DataHive logo" className="w-16 h-16 mx-auto mb-2" />
                <h1 className="text-xl text-center mb-4">Datahive Login</h1>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                    <input
                        className="bg-gray-800 text-white rounded-full py-2 px-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <input
                        className="bg-gray-800 text-white rounded-full py-2 px-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 text-white py-2 px-4 text-sm rounded-full hover:bg-purple-700 transition-colors duration-300 w-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-xs text-center mt-4">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
