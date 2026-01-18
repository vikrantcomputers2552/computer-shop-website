import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, LogOut, Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'settings'
    const [loading, setLoading] = useState(false);

    // Product State
    const [products, setProducts] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // null for new, object for edit
    const [productForm, setProductForm] = useState({
        name: '',
        specs: '',
        price: '',
        condition: 'new',
        image: null,
        image_url: ''
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Settings State
    const [settings, setSettings] = useState({
        shop_name: '',
        phone: '',
        email: '',
        whatsapp_number: '',
        address: '',
        hero_text: ''
    });

    // Fetch Initial Data
    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error) setProducts(data);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase.from('shop_settings').select('*').single();
        if (!error && data) setSettings(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    // --- Product Management ---

    const openProductModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setProductForm({
                name: product.name,
                specs: product.specs,
                price: product.price || '',
                condition: product.condition,
                image: null,
                image_url: product.image_url
            });
            setImagePreview(product.image_url);
        } else {
            setCurrentProduct(null);
            setProductForm({
                name: '',
                specs: '',
                price: '',
                condition: 'new',
                image: null,
                image_url: ''
            });
            setImagePreview(null);
        }
        setIsProductModalOpen(true);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: 'image/webp'
            };

            const compressedFile = await imageCompression(file, options);
            setProductForm({ ...productForm, image: compressedFile });
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Image compression error:', error);
            alert('Error compressing image. Please try again.');
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = productForm.image_url;

            // Upload Image if new one selected
            if (productForm.image) {
                const fileName = `${Date.now()}-${productForm.image.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, productForm.image);

                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                imageUrl = publicData.publicUrl;
            }

            const productData = {
                name: productForm.name,
                specs: productForm.specs,
                price: productForm.price ? parseFloat(productForm.price) : null,
                condition: productForm.condition,
                image_url: imageUrl
            };

            if (currentProduct) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', currentProduct.id);
                if (error) throw error;
            } else {
                // Insert
                if (!imageUrl) throw new Error('Image is required');
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
            }

            setIsProductModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id, imageUrl) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            // 1. Delete from DB
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;

            // 2. Delete from Storage (Optional optimization, but good practice)
            // Extract filename from URL... (omitted for simplicity, but cleaner to do)

            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product.');
        }
    };

    // --- Settings Management ---

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cleanedSettings = {
                ...settings,
                shop_name: settings.shop_name.trim(),
                phone: settings.phone.trim(),
                email: settings.email.trim(),
                whatsapp_number: settings.whatsapp_number.trim(),
                address: settings.address ? settings.address.trim() : '',
                hero_text: settings.hero_text.trim(),
            };

            const { error } = await supabase
                .from('shop_settings')
                .update(cleanedSettings)
                .eq('id', settings.id); // Provided we have the ID

            if (error) throw error;
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Error updating settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                            >
                                <LogOut className="h-4 w-4 inline mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Product Management
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`${activeTab === 'settings'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Website Settings
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'products' ? (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => openProductModal()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </button>
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {products.length === 0 ? (
                                    <li className="px-4 py-4 text-center text-gray-500">No products yet.</li>
                                ) : products.map((product) => (
                                    <li key={product.id}>
                                        <div className="px-4 py-4 flex items-center sm:px-6">
                                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={product.image_url} alt="" />
                                                    </div>
                                                    <div className="ml-4 truncate">
                                                        <div className="flex text-sm">
                                                            <p className="font-medium text-primary-600 truncate">{product.name}</p>
                                                            <p className={`ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${product.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                {product.condition}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                {product.price ? `₹${product.price}` : 'Contact for Price'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-5 flex-shrink-0 flex space-x-2">
                                                <button
                                                    onClick={() => openProductModal(product)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id, product.image_url)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Shop Information</h3>
                            <form className="mt-5 space-y-6" onSubmit={handleSettingsSubmit}>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.shop_name}
                                            onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.phone}
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.email}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.whatsapp_number}
                                            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea
                                            rows={3}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.address || ''}
                                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Hero Text (Welcome Message)</label>
                                        <textarea
                                            rows={3}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={settings.hero_text}
                                            onChange={(e) => setSettings({ ...settings, hero_text: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsProductModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {currentProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleProductSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                        <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Specs / Description</label>
                                        <textarea required rows={3} value={productForm.specs} onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price (Optional)</label>
                                            <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Leave empty for 'Contact'" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Condition</label>
                                            <select value={productForm.condition} onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                                <option value="new">New</option>
                                                <option value="refurbished">Refurbished</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Image</label>
                                        <div className="mt-1 flex items-center">
                                            {imagePreview ? (
                                                <div className="relative h-20 w-20 mr-4">
                                                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                                                </div>
                                            ) : null}
                                            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                                <span className="flex items-center"><Upload className="h-4 w-4 mr-2" /> Upload New</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!currentProduct} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-6">
                                        <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm">
                                            {loading ? 'Saving...' : 'Save Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
