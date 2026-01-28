import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Monitor, Cpu, Wrench } from 'lucide-react';

const Home = () => {
    const [shopInfo, setShopInfo] = useState({
        shop_name: 'Vikrant Computers',
        hero_text: 'Your one-stop destination for premium computers and expert repair services.'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from('shop_settings')
                    .select('shop_name, hero_text')
                    .single();

                if (data) {
                    setShopInfo({
                        shop_name: data.shop_name || 'Computer Shop',
                        hero_text: data.hero_text || 'Your one-stop destination for premium computers and expert repair services.'
                    });
                }
            } catch (error) {
                console.error('Error fetching shop info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopInfo();
    }, []);

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-6 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                                >
                                    <span className="block xl:inline">Welcome to</span>{' '}
                                    <span className="block text-primary-600 xl:inline">{shopInfo.shop_name}</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                                >
                                    {shopInfo.hero_text}
                                </motion.p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/products"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            View Products
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/contact"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            Contact Us
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1547394765-185e1e68f34e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
                        alt="Computer setup"
                    />
                </div>
            </section>

            {/* Services Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h2>
                    </div>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                    <Monitor className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">New & Refurbished Laptops</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">Wide range of laptops and desktops for every budget.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                    <Wrench className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Expert Repairs</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">Hardware upgrades, software fixes, and maintenance.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                    <Cpu className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Custom Builds</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">Gaming rigs and workstations tailored to your needs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
