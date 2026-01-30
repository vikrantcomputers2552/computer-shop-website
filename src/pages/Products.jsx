import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'refurbished'
    const [shopEmail, setShopEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGenericData = async () => {
            setLoading(true);
            try {
                // Fetch Products with Category Relation
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .order('created_at', { ascending: false });

                if (productsError) throw productsError;
                setProducts(productsData || []);

                // Fetch Categories
                const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
                setCategories(categoriesData || []);

                // Fetch Settings
                const { data: settingsData } = await supabase.from('shop_settings').select('email').single();
                if (settingsData) setShopEmail(settingsData.email);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGenericData();
    }, []);

    // Helper to strip HTML
    const stripHtml = (html) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // Filter Products
    const filteredProducts = React.useMemo(() => {
        // Filter out products without images (only show "ready" products)
        let result = products.filter(p => p.image_url);

        if (filter !== 'all') {
            result = result.filter(p => p.condition === filter);
        }

        if (searchTerm) {
            const fuseOptions = {
                keys: ['name', 'plainSpecs', 'categories.name'],
                threshold: 0.4,
            };
            const searchableProducts = result.map(p => ({
                ...p,
                plainSpecs: stripHtml(p.specs)
            }));
            const fuse = new Fuse(searchableProducts, fuseOptions);
            result = fuse.search(searchTerm).map(r => r.item);
        }

        return result;
    }, [products, searchTerm, filter]);

    // Group by Category (only for default view)
    const categorizedProducts = React.useMemo(() => {
        if (searchTerm || filter !== 'all') return null; // Use grid for search/filter results

        const groups = {};
        // Initialize with known categories
        categories.forEach(c => groups[c.name] = []);
        groups['Others'] = [];

        filteredProducts.forEach(p => {
            // Use relational category name
            const catName = p.categories?.name;

            if (catName && groups[catName]) {
                groups[catName].push(p);
            } else {
                groups['Others'].push(p); // Fallback for uncategorized
            }
        });

        // Filter out empty groups
        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [filteredProducts, categories, searchTerm, filter]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-grow sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search specs, names..."
                            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                        {['all', 'new', 'refurbished'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : categorizedProducts ? (
                // Horizontal Scroll View (Default)
                <div className="space-y-12">
                    {categorizedProducts.map(([category, items]) => (
                        <div key={category}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                            </div>
                            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x snap-mandatory hide-scrollbar">
                                {items.map((product) => (
                                    <div key={product.id} className="min-w-[85vw] sm:min-w-[280px] w-[85vw] sm:w-[280px] snap-start">
                                        <ProductCard product={product} shopEmail={shopEmail} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Grid View (Search/Filter Results)
                <>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 text-lg">
                            No products found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} shopEmail={shopEmail} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;
