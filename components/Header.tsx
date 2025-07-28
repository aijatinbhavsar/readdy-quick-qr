
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-qr-code-line text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold text-gray-800 font-pacifico">Quick QR</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
              Generator
            </Link>
            <Link href="/history" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
              History
            </Link>
            <Link href="/analytics" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
              Analytics
            </Link>
          </nav>
          
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl text-gray-700`}></i>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-qr-code-line mr-3"></i>
                Generator
              </Link>
              <Link 
                href="/history" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-history-line mr-3"></i>
                History
              </Link>
              <Link 
                href="/analytics" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-bar-chart-line mr-3"></i>
                Analytics
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
