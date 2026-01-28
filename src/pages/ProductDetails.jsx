import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft, Send } from 'lucide-react';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [shopSettings, setShopSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('id', productId)
                    .single();

                if (productError) throw productError;
                setProduct(productData);

                // 2. Fetch Shop Settings (for WhatsApp)
                const { data: settingsData } = await supabase
                    .from('shop_settings')
                    .select('*')
                    .single();

                if (settingsData) setShopSettings(settingsData);

                // Pre-fill message
                if (productData) {
                    setFormData(prev => ({
                        ...prev,
                        message: `Hi, I am interested in checking availability for: ${productData.name}. Please let me know the best price.`
                    }));
                }

            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchData();
    }, [productId]);

    const handleWhatsApp = () => {
        if (!shopSettings?.whatsapp_number) return;
        const phone = shopSettings.whatsapp_number.replace(/\D/g, '');
        const text = encodeURIComponent(`Hi, I am interested in: ${product.name}`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        const formId = '52ccf7f21f0cbde2751aed87fe7fd75f'; // Secure FormSubmit ID

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${formId}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `Product Inquiry: ${product?.name}`,
                    _template: 'table'
                })
            });

            const result = await response.json();
            if (result.success === 'true' || response.ok) {
                setSubmitStatus({ type: 'success', message: 'Inquiry sent! We will contact you shortly.' });
                setFormData(prev => ({ ...prev, message: '' }));
            } else {
                throw new Error('Failed to send.');
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try WhatsApp.' });
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden h-fit"
                >
                    <img src={product.image_url} alt={product.name} className="w-full h-auto object-cover max-h-[500px]" />
                </motion.div>

                {/* Right: Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full"
                >
                    <div className="mb-6">
                        <div className="flex space-x-2 mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white ${product.condition === 'new' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                {product.condition}
                            </span>
                            {product.categories && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-700 bg-gray-200">
                                    {product.categories.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <p className="text-2xl font-semibold text-primary-600">
                            {product.price ? `₹${Number(product.price).toLocaleString()}` : "Contact for Price"}
                        </p>
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line ql-editor" dangerouslySetInnerHTML={{ __html: product.specs }}></div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        {shopSettings?.whatsapp_number && (
                            <button
                                onClick={handleWhatsApp}
                                className="flex-1 flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Chat on WhatsApp
                            </button>
                        )}
                    </div>

                    {/* Inquiry Form */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Availability</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea name="message" rows={3} required value={formData.message} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border" />
                            </div>

                            {submitStatus.type && (
                                <p className={`text-sm ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {submitStatus.message}
                                </p>
                            )}

                            <button type="submit" disabled={sending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400">
                                {sending ? 'Sending...' : 'Send Inquiry'}
                            </button>
                        </form>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetails;
