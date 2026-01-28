import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/update-password`,
        });

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('If an account exists, a password reset link has been sent to your email.');
        }
        setLoading(false);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center pb-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="px-8 py-10">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                            <KeyRound className="h-6 w-6 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset link</p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-3"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`text-sm text-center p-3 rounded-md ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center">
                            <Link to="/admin/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminResetPassword;
