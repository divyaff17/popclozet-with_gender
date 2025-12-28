import React from 'react';
import { QRScanner } from '@/components/QRScanner';

const QRScannerPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">QR Code Scanner</h1>
                    <p className="text-lg text-muted-foreground">
                        Scan product QR codes to access hygiene information and product details
                    </p>
                </div>

                <QRScanner />
            </div>
        </div>
    );
};

export default QRScannerPage;
