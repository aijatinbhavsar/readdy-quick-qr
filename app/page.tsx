
'use client';

import Header from '../components/Header';
import QRGenerator from '../components/QRGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <QRGenerator />
      </div>
    </div>
  );
}
