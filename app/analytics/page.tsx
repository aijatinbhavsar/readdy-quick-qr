'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Header from '../../components/Header';

interface ScanData {
  date: string;
  scans: number;
  qrCodes: number;
}

interface QRAnalytics {
  id: string;
  url: string;
  scans: number;
  lastScan: string;
  createdAt: string;
  status: 'active' | 'expired';
}

export default function AnalyticsPage() {
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [qrAnalytics, setQrAnalytics] = useState<QRAnalytics[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [activeQRs, setActiveQRs] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    // Generate mock analytics data
    const generateMockData = () => {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const data: ScanData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          scans: Math.floor(Math.random() * 100) + 20,
          qrCodes: Math.floor(Math.random() * 10) + 1,
        });
      }
      
      setScanData(data);
      setTotalScans(data.reduce((sum, item) => sum + item.scans, 0));
    };

    const generateQRAnalytics = () => {
      const mockQRs: QRAnalytics[] = [
        {
          id: '1',
          url: 'https://example.com/product1#Quick_QR',
          scans: 245,
          lastScan: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-10T09:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          url: 'https://example.com/campaign2#Quick_QR',
          scans: 189,
          lastScan: '2024-01-15T14:20:00Z',
          createdAt: '2024-01-12T11:00:00Z',
          status: 'active'
        },
        {
          id: '3',
          url: 'https://example.com/promo3#Quick_QR',
          scans: 156,
          lastScan: '2024-01-14T16:45:00Z',
          createdAt: '2024-01-08T15:30:00Z',
          status: 'active'
        },
        {
          id: '4',
          url: 'https://example.com/event4#Quick_QR',
          scans: 98,
          lastScan: '2024-01-13T12:15:00Z',
          createdAt: '2024-01-05T10:00:00Z',
          status: 'expired'
        },
        {
          id: '5',
          url: 'https://example.com/service5#Quick_QR',
          scans: 67,
          lastScan: '2024-01-15T08:30:00Z',
          createdAt: '2024-01-11T13:45:00Z',
          status: 'active'
        }
      ];
      
      setQrAnalytics(mockQRs);
      setActiveQRs(mockQRs.filter(qr => qr.status === 'active').length);
    };

    generateMockData();
    generateQRAnalytics();
  }, [selectedPeriod]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your QR code performance</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-full p-1">
                  {[
                    { label: '7 Days', value: '7d' },
                    { label: '30 Days', value: '30d' },
                    { label: '90 Days', value: '90d' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                        selectedPeriod === period.value
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-800">{totalScans.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-scan-line text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-500 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">from last period</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active QR Codes</p>
                  <p className="text-2xl font-bold text-gray-800">{activeQRs}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-qr-code-line text-green-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-500 font-medium">+3</span>
                <span className="text-sm text-gray-500 ml-1">new this week</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Scans per QR</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(totalScans / (activeQRs || 1))}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-bar-chart-line text-purple-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-500 font-medium">+8.3%</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Scans Over Time */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Scans Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value) => [value, 'Scans']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* QR Codes Created */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Codes Created</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value) => [value, 'QR Codes']}
                    />
                    <Bar 
                      dataKey="qrCodes" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* QR Code Performance Table */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">QR Code Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">URL</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Scans</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Last Scan</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Created</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {qrAnalytics.map((qr) => (
                    <tr key={qr.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <i className="ri-qr-code-line text-gray-400 mr-3"></i>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-xs">
                            {qr.url}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <i className="ri-scan-line text-blue-500 mr-2"></i>
                          <span className="text-sm font-medium text-gray-800">
                            {qr.scans.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(qr.lastScan)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(qr.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          qr.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {qr.status === 'active' ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}