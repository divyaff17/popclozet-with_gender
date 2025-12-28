import React, { useState } from 'react';
import QRHygienePage from './QRHygienePage';
import ProductIntakePage from './ProductIntakePage';
import QRScannerPage from './QRScannerPage';
import AdminHygieneDashboard from './AdminHygieneDashboard';

const QRHygieneTestPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'menu' | 'intake' | 'scanner' | 'dashboard'>('menu');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Navigation Tabs */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '2px solid #e5e7eb',
                padding: '16px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveTab('menu')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'menu' ? '#3b82f6' : 'white',
                            color: activeTab === 'menu' ? 'white' : '#374151',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        🏠 Menu
                    </button>
                    <button
                        onClick={() => setActiveTab('intake')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'intake' ? '#10b981' : 'white',
                            color: activeTab === 'intake' ? 'white' : '#374151',
                            border: '2px solid #10b981',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        📦 Product Intake
                    </button>
                    <button
                        onClick={() => setActiveTab('scanner')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'scanner' ? '#f59e0b' : 'white',
                            color: activeTab === 'scanner' ? 'white' : '#374151',
                            border: '2px solid #f59e0b',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        📱 QR Scanner
                    </button>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'dashboard' ? '#8b5cf6' : 'white',
                            color: activeTab === 'dashboard' ? 'white' : '#374151',
                            border: '2px solid #8b5cf6',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ⚙️ Admin Dashboard
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'menu' && <QRHygienePage />}
                {activeTab === 'intake' && <ProductIntakePage />}
                {activeTab === 'scanner' && <QRScannerPage />}
                {activeTab === 'dashboard' && <AdminHygieneDashboard />}
            </div>
        </div>
    );
};

export default QRHygieneTestPage;
