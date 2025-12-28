import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { qrCodeService } from '@/services/qrCodeService';
import { authService } from '@/services/authService';
import { productService } from '@/services/productService';
import { hygieneSopService } from '@/services/hygieneSopService';
import { qrScanTrackingService } from '@/services/qrScanTrackingService';
import { deviceCapabilitiesService, DeviceCapabilityStatus } from '@/services/deviceCapabilitiesService';
import { errorLoggingService } from '@/services/errorLoggingService';
import { rateLimitService } from '@/services/rateLimitService';
import { HygieneSopViewer } from './HygieneSopViewer';
import { DeviceStatusIndicator } from './DeviceStatusIndicator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

interface ScanResult {
    productId: string;
    productData: any;
    sopData: any;
}

export const QRScanner: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<DeviceCapabilityStatus | null>(null);
    const isOnline = useOnlineStatus();
    const lastScanRef = useRef<string>('');

    // Check authorization and device capabilities on mount
    React.useEffect(() => {
        checkAuthorization();
        checkDeviceCapabilities();
    }, []);

    const checkAuthorization = async () => {
        try {
            const isStaffOrAdmin = await authService.isStaffOrAdmin();
            setIsAuthorized(isStaffOrAdmin);

            if (!isStaffOrAdmin) {
                setError('Access denied. Admin or staff privileges required to scan QR codes.');
            }
        } catch (err) {
            setError('Failed to verify authorization');
            setIsAuthorized(false);
        }
    };

    const checkDeviceCapabilities = async () => {
        try {
            const status = await deviceCapabilitiesService.getCapabilityStatus();
            setDeviceStatus(status);

            // Log capabilities to database
            await deviceCapabilitiesService.logCapabilities();
        } catch (err) {
            console.error('Failed to check device capabilities:', err);
        }
    };

    const handleScan = async (result: any) => {
        if (!result || isLoading) return;

        const qrCodeData = result[0]?.rawValue;
        if (!qrCodeData) return;

        // Debounce: prevent duplicate scans
        if (lastScanRef.current === qrCodeData) {
            return;
        }
        lastScanRef.current = qrCodeData;

        // Rate limiting
        if (!rateLimitService.canScan()) {
            const timeUntilReset = rateLimitService.getTimeUntilReset();
            toast.error('Too many scans', {
                description: `Please wait ${timeUntilReset} seconds before scanning again`,
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('📷 QR Code scanned:', qrCodeData);

            // Validate QR code
            const validation = await qrCodeService.validateQRCode(qrCodeData);
            if (!validation.valid || !validation.productId) {
                throw new Error('Invalid or unrecognized QR code');
            }

            // Fetch product data
            const productData = await productService.getProductById(validation.productId);
            if (!productData) {
                throw new Error('Product not found');
            }

            // Fetch hygiene SOP
            const sopData = await hygieneSopService.getSOPByProductId(validation.productId);
            if (!sopData) {
                throw new Error('Hygiene SOP not found for this product');
            }

            // Set scan result
            setScanResult({
                productId: validation.productId,
                productData,
                sopData,
            });

            // Log QR scan with tracking service
            await qrScanTrackingService.logScan(
                qrCodeData,
                validation.productId,
                {
                    scannedFrom: 'qr_scanner_page',
                    productName: productData.name,
                }
            );

            // Show success message
            if (isOnline) {
                toast.success('QR code scanned successfully');
            } else {
                toast.success('QR code scanned (saved offline)', {
                    description: 'Will sync when back online',
                });
            }

            setIsScanning(false);
        } catch (err) {
            console.error('❌ QR scan error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to process QR code';
            setError(errorMessage);

            // Log error to database
            await errorLoggingService.logError(
                'qr_scan_error',
                errorMessage,
                err instanceof Error ? err : undefined,
                { qrCodeData: result[0]?.rawValue }
            );

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            // Reset debounce after 2 seconds
            setTimeout(() => {
                lastScanRef.current = '';
            }, 2000);
        }
    };

    const handleError = (error: any) => {
        console.error('❌ QR Scanner error:', error);
        setError('Camera access denied or not available. Please grant camera permissions.');
    };

    const startScanning = () => {
        setIsScanning(true);
        setScanResult(null);
        setError(null);
    };

    const stopScanning = () => {
        setIsScanning(false);
    };

    // Show authorization check
    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show access denied
    if (isAuthorized === false) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        Access Denied
                    </CardTitle>
                    <CardDescription>
                        You do not have permission to access the QR scanner
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This feature is restricted to admin and staff users only. Please contact your administrator for access.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-6 w-6" />
                        QR Code & Barcode Scanner
                    </CardTitle>
                    <CardDescription>
                        Scan product QR codes or barcodes to view hygiene information and product details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Device Status Indicator */}
                    {deviceStatus && (
                        <DeviceStatusIndicator status={deviceStatus} compact />
                    )}

                    {/* Offline Warning */}
                    {!isOnline && (
                        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                You are offline. Scans will be saved locally and synced when back online.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isScanning && !scanResult && (
                        <Button onClick={startScanning} className="w-full" size="lg">
                            <Camera className="mr-2 h-5 w-5" />
                            Start Scanning
                        </Button>
                    )}

                    {isScanning && (
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-primary">
                                <Scanner
                                    onScan={handleScan}
                                    onError={handleError}
                                    formats={[
                                        'qr_code',
                                        'code_128',
                                        'code_39',
                                        'code_93',
                                        'ean_13',
                                        'ean_8',
                                        'upc_a',
                                        'upc_e',
                                        'itf',
                                        'codabar',
                                        'data_matrix',
                                        'aztec',
                                        'pdf417'
                                    ]}
                                    constraints={{
                                        facingMode: 'environment',
                                    }}
                                    styles={{
                                        container: {
                                            width: '100%',
                                            height: '100%',
                                        },
                                    }}
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <Button onClick={stopScanning} variant="outline" className="w-full">
                                Stop Scanning
                            </Button>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {scanResult && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                QR code scanned successfully! Product details loaded.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {scanResult && (
                <HygieneSopViewer
                    productData={scanResult.productData}
                    sopData={scanResult.sopData}
                    onClose={() => {
                        setScanResult(null);
                        startScanning();
                    }}
                />
            )}
        </div>
    );
};
