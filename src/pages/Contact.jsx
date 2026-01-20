import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

const Contact = () => {
    const [shopInfo, setShopInfo] = useState({
        shop_name: 'Computer Shop',
        phone: '',
        email: '',
        whatsapp_number: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from('shop_settings')
                    .select('*')
                    .single();

                if (data) {
                    setShopInfo(data);
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopInfo();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use the secure FormSubmit ID instead of exposing the email directly
        const formId = import.meta.env.VITE_FORM_ID;

        setSending(true);
        setSubmitStatus({ type: null, message: '' });

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
                    _subject: `New Message from ${formData.name}`,
                    _template: 'table'
                })
            });

            const result = await response.json();

            if (result.success === 'true' || response.ok) {
                setSubmitStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', message: '' }); // Reset form
            } else {
                throw new Error('Failed to send message.');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus({ type: 'error', message: 'Something went wrong. Please try again later or contact us directly.' });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading contact info...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
                <div className="px-4 py-5 sm:px-6">
                    <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        We'd love to hear from you. Reach out via any of the channels below.
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-primary-500" /> Address
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {shopInfo.address || 'Address available on request'}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Phone className="h-5 w-5 mr-2 text-primary-500" /> Phone
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a href={`tel:${shopInfo.phone}`} className="hover:text-primary-600">
                                    {shopInfo.phone || 'N/A'}
                                </a>
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-primary-500" /> Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {shopInfo.email || 'N/A'}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <MessageCircle className="h-5 w-5 mr-2 text-green-500" /> WhatsApp
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {shopInfo.whatsapp_number ? (
                                    <a
                                        href={`https://wa.me/${shopInfo.whatsapp_number.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Chat on WhatsApp
                                    </a>
                                ) : 'N/A'}
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                value={formData.message}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="How can we help you?"
                            />
                        </div>

                        {submitStatus.type && (
                            <div className={`text-sm ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {submitStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
