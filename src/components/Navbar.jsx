import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [shopName, setShopName] = useState('Computer Shop');
    const location = useLocation();

    useEffect(() => {
        const fetchShopName = async () => {
            const { data } = await supabase.from('shop_settings').select('shop_name').single();
            if (data && data.shop_name) {
                setShopName(data.shop_name);
            }
        };
        fetchShopName();
    }, []);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const linkClasses = (path) => `
        inline-flex items-center px-1 pb-1 border-b-2 text-sm font-medium transition-all duration-200
        ${isActive(path)
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }
    `;

    const mobileLinkClasses = (path) => `
        block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200
        ${isActive(path)
            ? 'bg-primary-50 border-primary-500 text-primary-700'
            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
        }
    `;

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <div className="bg-primary-50 p-1.5 rounded-lg mr-2 group-hover:bg-primary-100 transition-colors">
                                <ShoppingBag className="h-6 w-6 text-primary-600" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">{shopName}</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                        <Link to="/" className={linkClasses('/')}>
                            Home
                        </Link>
                        <Link to="/products" className={linkClasses('/products')}>
                            Products
                        </Link>
                        <Link to="/contact" className={linkClasses('/contact')}>
                            Contact
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden border-t border-gray-100">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className={mobileLinkClasses('/')}
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={mobileLinkClasses('/products')}
                            onClick={() => setIsOpen(false)}
                        >
                            Products
                        </Link>
                        <Link
                            to="/contact"
                            className={mobileLinkClasses('/contact')}
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
