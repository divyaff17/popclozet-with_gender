import React from 'react';

const QRAnalyticsPage: React.FC = () => {
    console.log('🎯 QR Analytics Page is rendering!');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-5xl font-bold text-purple-600 mb-4">
                        ✅ QR Analytics Page Loaded!
                    </h1>
                    <p className="text-2xl text-gray-700 mb-4">
                        If you can see this colorful page, the routing is working correctly!
                    </p>
                    <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
                        <p className="text-green-700 font-semibold">
                            SUCCESS: The page is rendering at /admin/qr-analytics
                        </p>
                    </div>
                    <p className="text-gray-600">
                        Check the browser console - you should see a log message saying "QR Analytics Page is rendering!"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRAnalyticsPage;
