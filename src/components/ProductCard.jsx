import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, shopEmail }) => {
    const { id, name, specs, image_url, price, condition } = product;

    const stripHtml = (html) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleCreateMailto = () => {
        if (!shopEmail) return '#';
        const cleanEmail = shopEmail.trim();
        const plainSpecs = stripHtml(specs).substring(0, 100);
        const subject = encodeURIComponent(`Inquiry for Product: ${name}`);
        const body = encodeURIComponent(`Hi,\n\nI am interested in the following product:\n\nName: ${name}\nCondition: ${condition}\nSpec Summary: ${plainSpecs}...\n\nPlease let me know the price and availability.\n\nThanks!`);
        return `mailto:${cleanEmail}?subject=${subject}&body=${body}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group"
        >
            <Link to={`/products/${id}`} className="block relative h-[160px] sm:h-[180px] bg-gray-200 overflow-hidden">
                <img
                    src={image_url}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white rounded-md ${condition === 'new' ? 'bg-green-500' : 'bg-amber-500'}`}>
                    {condition}
                </div>
            </Link>
            <div className="p-3 flex flex-col flex-grow">
                <Link to={`/products/${id}`} className="block">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{name}</h3>
                </Link>
                <div className="text-gray-600 text-sm mb-3 flex-grow line-clamp-2" dangerouslySetInnerHTML={{ __html: specs }}></div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                    {price !== null && price !== undefined ? (
                        <span className="text-lg font-semibold text-primary-600">
                            ₹{Number(price).toLocaleString()}
                        </span>
                    ) : (
                        shopEmail ? (
                            <a
                                href={handleCreateMailto()}
                                className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-md transition-colors"
                            >
                                Contact for Price
                            </a>
                        ) : (
                            <span className="text-sm font-medium text-primary-600">
                                Contact for Price
                            </span>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
