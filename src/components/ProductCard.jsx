import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, shopEmail }) => {
    const { name, specs, image_url, price, condition } = product;

    const handleCreateMailto = () => {
        if (!shopEmail) return '#';
        const cleanEmail = shopEmail.trim();
        const subject = encodeURIComponent(`Inquiry for Product: ${name}`);
        const body = encodeURIComponent(`Hi,\n\nI am interested in the following product:\n\nName: ${name}\nCondition: ${condition}\nSpec Summary: ${specs.substring(0, 50)}...\n\nPlease let me know the price and availability.\n\nThanks!`);
        return `mailto:${cleanEmail}?subject=${subject}&body=${body}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="relative h-48 bg-gray-200">
                <img
                    src={image_url}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white rounded-md ${condition === 'new' ? 'bg-green-500' : 'bg-amber-500'}`}>
                    {condition}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow whitespace-pre-line line-clamp-4">{specs}</p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    {price !== null && price !== undefined ? (
                        <span className="text-xl font-bold text-primary-600">
                            ₹{Number(price).toLocaleString()}
                        </span>
                    ) : (
                        shopEmail ? (
                            <a
                                href={handleCreateMailto()}
                                className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md transition-colors"
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
