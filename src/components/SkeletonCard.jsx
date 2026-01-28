import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="h-[160px] sm:h-[180px] bg-gray-200"></div>
            <div className="px-4 py-5 sm:p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
