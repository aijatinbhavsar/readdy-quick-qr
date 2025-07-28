
'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

interface QRData {
  id: string;
  url: string;
  qrCodeDataUrl: string;
  createdAt: string;
  expiresAt: string | null;
  logoUrl?: string;
}

const EXPIRY_OPTIONS = [
  { label: '10 minutes', value: 10 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '6 hours', value: 6 * 60 * 60 * 1000 },
  { label: '1 day', value: 24 * 60 * 60 * 1000 },
  { label: '1 week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Never', value: null }
];

export default function QRGenerator() {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState(EXPIRY_OPTIONS[6]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [generatorType, setGeneratorType] = useState<'basic' | 'logo'>('basic');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const [isClient, setIsClient] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const createBrandedUrl = (originalUrl: string) => {
    const url = new URL(originalUrl);
    url.hash = 'Quick_QR';
    return url.toString();
  };

  const generateQR = async () => {
    if (!url || !isValidUrl(url)) {
      alert('Please enter a valid URL');
      return;
    }

    setIsGenerating(true);
    
    try {
      const brandedUrl = createBrandedUrl(url);
      const qrOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };

      const qrCodeDataUrl = await QRCode.toDataURL(brandedUrl, qrOptions);
      setQrDataUrl(qrCodeDataUrl);

      // Save to history only on client side
      if (isClient) {
        const qrData: QRData = {
          id: Date.now().toString(),
          url: brandedUrl,
          qrCodeDataUrl,
          createdAt: new Date().toISOString(),
          expiresAt: selectedExpiry.value ? new Date(Date.now() + selectedExpiry.value).toISOString() : null,
          logoUrl: logoPreview || undefined,
        };

        const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
        history.unshift(qrData);
        localStorage.setItem('qr-history', JSON.stringify(history.slice(0, 5)));
      }
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Logo file size must be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = async () => {
    if (!qrDataUrl || !isClient) return;

    if (downloadFormat === 'png') {
      const canvas = await html2canvas(qrRef.current!);
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      // SVG download
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.svg`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const shareQR = (platform: string) => {
    if (!qrDataUrl || !isClient) return;
    
    const shareText = `Check out this QR code generated with Quick QR!`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=QR Code&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Generator</h1>
            <p className="text-gray-600">Create custom QR codes with logos and expiry times</p>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-2"></i>
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Create custom QR codes with logos and expiry times</p>
        </div>

        {/* Generator Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setGeneratorType('basic')}
              className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                generatorType === 'basic' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <i className="ri-qr-code-line mr-2"></i>
              Basic QR
            </button>
            <button
              onClick={() => setGeneratorType('logo')}
              className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                generatorType === 'logo' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <i className="ri-image-line mr-2"></i>
              Custom Logo
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <i className="ri-link absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Logo Upload (if logo type selected) */}
            {generatorType === 'logo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-upload-2-line mr-2"></i>
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logoFile && (
                    <span className="text-sm text-gray-600">{logoFile.name}</span>
                  )}
                </div>
                {logoPreview && (
                  <div className="mt-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Expiry Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Time
              </label>
              <div className="relative">
                <select
                  value={selectedExpiry.label}
                  onChange={(e) => {
                    const option = EXPIRY_OPTIONS.find(opt => opt.label === e.target.value);
                    if (option) setSelectedExpiry(option);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 text-sm"
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQR}
              disabled={isGenerating || !url}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className="ri-qr-code-line mr-2"></i>
                  Generate QR Code
                </div>
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">QR Code Preview</h3>
              
              {qrDataUrl ? (
                <div ref={qrRef} className="inline-block relative">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                  />
                  {generatorType === 'logo' && logoPreview && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <i className="ri-qr-code-line text-4xl text-gray-400 mb-2"></i>
                    <p className="text-gray-500">QR code will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download & Share Options */}
            {qrDataUrl && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download Format
                    </label>
                    <select
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 text-sm"
                    >
                      <option value="png">PNG</option>
                      <option value="svg">SVG</option>
                    </select>
                  </div>
                  <button
                    onClick={downloadQR}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-download-line mr-2"></i>
                    Download
                  </button>
                </div>

                {/* Share Options */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-share-line mr-2"></i>
                    Share QR Code
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <button
                          onClick={() => shareQR('whatsapp')}
                          className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 rounded whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-whatsapp-line mr-3 text-green-600"></i>
                          WhatsApp
                        </button>
                        <button
                          onClick={() => shareQR('telegram')}
                          className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 rounded whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-telegram-line mr-3 text-blue-500"></i>
                          Telegram
                        </button>
                        <button
                          onClick={() => shareQR('email')}
                          className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 rounded whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-mail-line mr-3 text-red-500"></i>
                          Email
                        </button>
                        <button
                          onClick={() => shareQR('copy')}
                          className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 rounded whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-file-copy-line mr-3 text-gray-600"></i>
                          Copy Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
