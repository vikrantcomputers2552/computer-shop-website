import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Error: Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setMessage('Error: Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('Password updated successfully! Redirecting...');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="px-8 py-10">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                        <p className="mt-2 text-sm text-gray-600">Create a secure password including numbers</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-3"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-3"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`text-sm text-center p-3 rounded-md ${message.includes('success') || message.includes('Redirecting') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminUpdatePassword;
