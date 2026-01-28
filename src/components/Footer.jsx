import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-6 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left: Branding & Copyright */}
                    <div className="text-center md:text-left">
                        <h3 className="text-sm font-bold text-white tracking-wide">Computer Shop</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            &copy; 2026 Vikrant Computers. All rights reserved.
                        </p>
                    </div>

                    {/* Center: Disclaimer */}
                    <div className="text-center max-w-xl mx-auto hidden md:block">
                        <p className="text-[11px] text-gray-400 leading-snug">
                            Disclaimer: All third-party trademarks (including logos and icons) referenced by Computer Shop remain the property of their respective owners. Unless specifically identified as such, use of third-party trademarks does not indicate any relationship, sponsorship, or endorsement between Computer Shop and the owners of these trademarks.
                        </p>
                    </div>

                    {/* Right: Signature */}
                    <div className="text-center md:text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em] mb-0.5">
                            Created and Designed by
                        </p>
                        <div className="flex items-center justify-center md:justify-end space-x-1">
                            <span className="text-xs text-white font-medium">Praveen Kumar Patel</span>
                            {/* <span className="text-[10px] text-gray-400">(Praveenp9876)</span> */}
                        </div>
                    </div>
                </div>

                {/* Mobile Disclaimer (visible only on small screens) */}
                <div className="mt-4 text-center md:hidden">
                    <p className="text-[10px] text-gray-400 leading-[1.6]">
                        Disclaimer: All trademarks are property of their respective owners.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
