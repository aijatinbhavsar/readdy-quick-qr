'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface QRData {
  id: string;
  url: string;
  qrCodeDataUrl: string;
  createdAt: string;
  expiresAt: string | null;
  logoUrl?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<QRData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('qr-history');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all QR code history?')) {
      localStorage.removeItem('qr-history');
      setHistory([]);
    }
  };

  const downloadQR = (qrData: QRData) => {
    const link = document.createElement('a');
    link.download = `qr-code-${qrData.id}.png`;
    link.href = qrData.qrCodeDataUrl;
    link.click();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4"></i>
              <p className="text-gray-600">Loading history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">QR Code History</h1>
                  <p className="text-gray-600 mt-1">Your recently generated QR codes</p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Clear History
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-history-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No QR codes yet</h3>
                  <p className="text-gray-500 mb-6">Generate your first QR code to see it here</p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-add-line mr-2"></i>
                    Create QR Code
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((qrData) => (
                    <div
                      key={qrData.id}
                      className={`border rounded-lg p-4 ${
                        isExpired(qrData.expiresAt) ? 'bg-red-50 border-red-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={qrData.qrCodeDataUrl}
                              alt="QR Code"
                              className="w-16 h-16 object-contain border rounded"
                            />
                            {qrData.logoUrl && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                <img
                                  src={qrData.logoUrl}
                                  alt="Logo"
                                  className="w-3 h-3 object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-800 truncate">
                              {qrData.url}
                            </h3>
                            {isExpired(qrData.expiresAt) && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Expired
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <i className="ri-time-line mr-1"></i>
                              {formatDate(qrData.createdAt)}
                            </span>
                            <span className="flex items-center">
                              <i className="ri-calendar-line mr-1"></i>
                              {getTimeUntilExpiry(qrData.expiresAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadQR(qrData)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Download QR Code"
                          >
                            <i className="ri-download-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(qrData.url);
                              alert('URL copied to clipboard!');
                            }}
                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            title="Copy URL"
                          >
                            <i className="ri-file-copy-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}