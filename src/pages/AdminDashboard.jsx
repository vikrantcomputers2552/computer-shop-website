import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Upload, X, Package, Settings, Search, Menu, FileUp } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Quill Toolbar
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    // Product State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // New Categories State
    const [searchTerm, setSearchTerm] = useState('');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', specs: '', price: '', condition: 'new', category_id: '', image: null, image_url: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState(''); // New Category Input

    // Settings State
    const [settings, setSettings] = useState({
        shop_name: '', phone: '', email: '', whatsapp_number: '', address: '', hero_text: ''
    });

    // Fetch Data
    useEffect(() => {
        fetchProducts();
        fetchCategories(); // Fetch Categories
        fetchSettings();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*, categories(id, name)').order('created_at', { ascending: false });
        if (!error) setProducts(data);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
        if (!error) setCategories(data);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase.from('shop_settings').select('*').single();
        if (!error && data) setSettings(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    // Helper to strip HTML
    const stripHtml = (html) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // Filter Products with Fuse.js
    const filteredProducts = React.useMemo(() => {
        if (!searchTerm) return products;

        const fuseOptions = {
            keys: ['name', 'plainSpecs', 'categories.name'], // Added category to search
            threshold: 0.4,
        };

        const searchableProducts = products.map(p => ({
            ...p,
            plainSpecs: stripHtml(p.specs)
        }));

        const fuse = new Fuse(searchableProducts, fuseOptions);
        return fuse.search(searchTerm).map(result => result.item);
    }, [products, searchTerm]);

    // --- Category Handlers ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setLoading(true);
        const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim() }]);
        if (error) {
            alert(error.message);
        } else {
            setNewCategoryName('');
            fetchCategories();
        }
        setLoading(false);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) fetchCategories();
    };

    // --- Bulk Import Handler ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);

    const handleFileUpload = (e) => {
        setImportFile(e.target.files[0]);
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) return;
        setLoading(true);

        const parseFile = () => {
            return new Promise((resolve, reject) => {
                const fileExt = importFile.name.split('.').pop().toLowerCase();

                if (fileExt === 'json') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            resolve(JSON.parse(e.target.result));
                        } catch (err) { reject(err); }
                    };
                    reader.readAsText(importFile);
                } else if (fileExt === 'csv') {
                    Papa.parse(importFile, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => resolve(results.data),
                        error: (err) => reject(err)
                    });
                } else if (['xlsx', 'xls'].includes(fileExt)) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const sheet = workbook.Sheets[sheetName];
                            const jsonData = XLSX.utils.sheet_to_json(sheet);
                            resolve(jsonData);
                        } catch (err) { reject(err); }
                    };
                    reader.readAsArrayBuffer(importFile);
                } else {
                    reject(new Error("Unsupported file format"));
                }
            });
        };

        try {
            const rawData = await parseFile();
            if (!rawData || rawData.length === 0) throw new Error("No data found");

            // 1. Extract Unique Categories from File
            const fileCategories = new Set();
            rawData.forEach(item => {
                if (item.category && typeof item.category === 'string') {
                    fileCategories.add(item.category.trim());
                }
            });

            // 2. Identify New Categories
            const existingCatNames = categories.map(c => c.name.toLowerCase());
            const newCategoriesToCreate = [...fileCategories].filter(catName =>
                !existingCatNames.includes(catName.toLowerCase())
            );

            // 3. Create New Categories
            if (newCategoriesToCreate.length > 0) {
                const { error: catError } = await supabase
                    .from('categories')
                    .insert(newCategoriesToCreate.map(name => ({ name })));

                if (catError) throw catError;

                // Refresh categories to get new IDs
                const { data: refreshedCategories } = await supabase.from('categories').select('*');
                if (refreshedCategories) setCategories(refreshedCategories);
            }

            // Reload fresh categories to ensure we have all IDs (including just added ones)
            const { data: finalCategories } = await supabase.from('categories').select('*');

            // 4. Map Products with Category IDs
            const validProducts = rawData.map(item => {
                let categoryId = null;
                if (item.category) {
                    const cat = finalCategories.find(c => c.name.toLowerCase() === item.category.trim().toLowerCase());
                    categoryId = cat ? cat.id : null;
                }

                return {
                    name: item.name,
                    specs: item.specs || '',
                    price: item.price ? parseFloat(item.price) : null,
                    condition: item.condition?.toLowerCase() || 'new',
                    category_id: categoryId,
                    image_url: item.image_url || null
                };
            }).filter(p => p.name); // basic validation

            if (validProducts.length > 0) {
                const { error } = await supabase.from('products').insert(validProducts);
                if (error) throw error;
                alert(`Successfully imported ${validProducts.length} products (and created ${newCategoriesToCreate.length} new categories)!`);
                setIsImportModalOpen(false);
                setImportFile(null);
                fetchProducts();
            } else {
                alert('No valid product data found.');
            }

        } catch (error) {
            console.error('Import Error:', error);
            alert('Failed to import: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Product Handlers ---
    const openProductModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setProductForm({
                name: product.name,
                specs: product.specs,
                price: product.price || '',
                condition: product.condition,
                category_id: product.category_id || '', // Set category_id
                image: null,
                image_url: product.image_url
            });
            setImagePreview(product.image_url);
        } else {
            setCurrentProduct(null);
            setProductForm({
                name: '', specs: '', price: '', condition: 'new', category_id: '', image: null, image_url: ''
            });
            setImagePreview(null);
        }
        setIsProductModalOpen(true);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/webp',
                initialQuality: 0.75
            });
            setProductForm({ ...productForm, image: compressedFile });
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error(error);
            alert('Error compressing image');
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = productForm.image_url;
            if (productForm.image) {
                const fileName = `${Date.now()}-${productForm.image.name}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, productForm.image);
                if (uploadError) throw uploadError;
                const { data: publicData } = supabase.storage.from('products').getPublicUrl(fileName);
                imageUrl = publicData.publicUrl;
            }

            const productData = {
                name: productForm.name,
                specs: productForm.specs,
                price: productForm.price ? parseFloat(productForm.price) : null,
                condition: productForm.condition,
                category_id: productForm.category_id || null, // Save category_id
                image_url: imageUrl
            };

            if (currentProduct) {
                await supabase.from('products').update(productData).eq('id', currentProduct.id);
            } else {
                if (!imageUrl) throw new Error('Image required');
                await supabase.from('products').insert([productData]);
            }
            setIsProductModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        } catch (error) { console.error(error); }
    };

    // --- Settings Handler ---
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('shop_settings').update(settings).eq('id', settings.id);
            if (error) throw error;
            alert('Settings updated!');
        } catch (error) { alert('Error updating settings'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                                Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-500">
                                <Menu />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="hidden md:flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Tab Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden px-4 pb-4 space-y-2 bg-white border-t">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 font-medium">Logout</button>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Tab Switcher */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 w-fit mx-auto">
                    {['products', 'categories', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                relative flex items-center px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                ${activeTab === tab ? 'text-primary-700' : 'text-gray-500 hover:text-gray-900'}
                            `}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary-50 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center capitalize">
                                {tab === 'products' ? <Package className="w-4 h-4 mr-2" /> : tab === 'categories' ? <Package className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                                {tab}
                            </span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'products' ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Actions Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                <div className="relative w-full sm:w-96">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => openProductModal()}
                                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5 mr-2" /> Add Product
                                </button>
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <FileUp className="h-5 w-5 mr-2" /> Import
                                </button>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col group">
                                        <div className="relative h-40 bg-gray-100 overflow-hidden">
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white rounded-md ${product.condition === 'new' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                    {product.condition}
                                                </div>
                                                {product.categories && (
                                                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                                                        {product.categories.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                                            <p className="text-primary-600 font-semibold mb-3 text-sm">
                                                {product.price ? `₹${Number(product.price).toLocaleString()}` : "Contact for Price"}
                                            </p>
                                            <div className="mt-auto flex justify-end space-x-2 pt-3 border-t border-gray-50">
                                                <button onClick={() => openProductModal(product)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">No products found matching your search.</div>
                            )}
                        </motion.div>
                    ) : activeTab === 'categories' ? (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Categories</h3>

                                <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
                                    <input
                                        type="text"
                                        placeholder="New Category Name"
                                        className="flex-grow rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No categories added yet.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Store Configuration</h3>
                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                            <input type="text" required value={settings.shop_name} onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" required value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input type="text" required value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                            <input type="text" value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <textarea rows={2} value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Text</label>
                                            <textarea rows={2} required value={settings.hero_text} onChange={(e) => setSettings({ ...settings, hero_text: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50">
                                            {loading ? 'Saving Changes...' : 'Save Settings'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Import Modal */}
                <AnimatePresence>
                    {isImportModalOpen && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsImportModalOpen(false)}
                                >
                                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                                </motion.div>

                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                >
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="text-lg font-bold text-gray-900">Bulk Import Products</h3>
                                        <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-4 bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
                                            <p className="font-semibold mb-1">Supported Formats: CSV, JSON, Excel (XLSX, XLS)</p>
                                            <p>Required: name, specs. Optional: price, condition, category.</p>
                                            <p className="mt-1 text-xs">* New categories will be auto-created. Images can be added later.</p>
                                        </div>

                                        <form onSubmit={handleImportSubmit} className="space-y-6">
                                            <label htmlFor="import-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative block w-full">
                                                <div className="space-y-1 text-center w-full">
                                                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <span className="relative rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                                            {importFile ? importFile.name : 'Click to Upload Excel, CSV, or JSON'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">or drag and drop</p>
                                                    <input id="import-upload" type="file" className="sr-only" accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} />
                                                </div>
                                            </label>

                                            <div className="flex justify-end space-x-3">
                                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={!importFile || loading} className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                                                    {loading ? 'Importing...' : 'Start Import'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Product Modal */}
                <AnimatePresence>
                    {isProductModalOpen && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 transition-opacity" aria-hidden="true"
                                >
                                    <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setIsProductModalOpen(false)}></div>
                                </motion.div>

                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                                >
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {currentProduct ? 'Edit Product' : 'Add New Product'}
                                        </h3>
                                        <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                                        <form onSubmit={handleProductSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Specs / Description</label>
                                                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
                                                    <ReactQuill theme="snow" value={productForm.specs} onChange={(c) => setProductForm({ ...productForm, specs: c })} modules={modules} className="border-none" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
                                                    <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5" placeholder="Leave empty for 'Contact'" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                                    <select value={productForm.condition} onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5">
                                                        <option value="new">New</option>
                                                        <option value="refurbished">Refurbished</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                    <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5">
                                                        <option value="">Uncategorized</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                    <div className="space-y-1 text-center">
                                                        {imagePreview ? (
                                                            <div className="relative mx-auto h-32 w-auto">
                                                                <img src={imagePreview} alt="Preview" className="h-full rounded-md object-contain" />
                                                            </div>
                                                        ) : (
                                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                        )}
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                                                <span>{imagePreview ? 'Change Image' : 'Upload a file'}</span>
                                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!currentProduct} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                                                    {loading ? 'Saving...' : 'Save Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;
