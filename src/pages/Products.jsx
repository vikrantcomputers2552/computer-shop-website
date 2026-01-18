import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion } from 'framer-motion';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'refurbished'
    const [shopEmail, setShopEmail] = useState('');

    useEffect(() => {
        const fetchProductsAndSettings = async () => {
            setLoading(true);
            try {
                // Fetch Products
                let query = supabase.from('products').select('*').order('created_at', { ascending: false });

                if (filter !== 'all') {
                    query = query.eq('condition', filter);
                }

                const { data: productsData, error: productsError } = await query;
                if (productsError) throw productsError;
                setProducts(productsData);

                // Fetch Settings (only if we haven't already, or just fetch parallel)
                // We'll just fetch passingly here. 
                // Optimization: could pull this up to App level context, but page level is fine for now.
                const { data: settingsData } = await supabase
                    .from('shop_settings')
                    .select('email')
                    .single();

                if (settingsData) {
                    setShopEmail(settingsData.email);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsAndSettings();
    }, [filter]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                    {['all', 'new', 'refurbished'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500 text-lg">
                    No products found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} shopEmail={shopEmail} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;
