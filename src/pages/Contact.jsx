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

    const handleWriteToUs = () => {
        const subject = encodeURIComponent(`Inquiry for ${shopInfo.shop_name}`);
        const body = encodeURIComponent("Hi, I'm interested in...");
        window.location.href = `mailto:${shopInfo.email}?subject=${subject}&body=${body}`;
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
                <div className="px-4 py-5 sm:px-6 flex justify-center">
                    <button
                        onClick={handleWriteToUs}
                        disabled={!shopInfo.email}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow transition-colors"
                    >
                        <Mail className="h-5 w-5 mr-2" />
                        Write to Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contact;
