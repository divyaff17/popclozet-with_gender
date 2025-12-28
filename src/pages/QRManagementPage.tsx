import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Download,
    Printer,
    Trash2,
    QrCode,
    Loader2
} from 'lucide-react';
import { qrCodeService } from '@/services/qrCodeService';
import { productService } from '@/services/productService';
import { toast } from 'sonner';

const QRManagementPage: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [daysToKeep, setDaysToKeep] = useState(90);

    const handleBulkGenerate = async () => {
        try {
            setIsGenerating(true);

            // Get all products
            const products = await productService.getAllProducts();
            const productIds = products.map(p => p.id);

            if (productIds.length === 0) {
                toast.error('No products found');
                return;
            }

            toast.info(`Generating QR codes for ${productIds.length} products...`);

            const result = await qrCodeService.bulkGenerateQRCodes(productIds);

            toast.success(`Generated ${result.success} QR codes`, {
                description: result.failed > 0 ? `${result.failed} failed` : undefined,
            });
        } catch (error) {
            console.error('Bulk generation failed:', error);
            toast.error('Failed to generate QR codes');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBulkDownload = async () => {
        try {
            setIsDownloading(true);

            const products = await productService.getAllProducts();
            const productIds = products.map(p => p.id);

            if (productIds.length === 0) {
                toast.error('No products found');
                return;
            }

            toast.info(`Downloading ${productIds.length} QR codes...`);

            await qrCodeService.bulkDownloadQRCodes(productIds);

            toast.success('QR codes downloaded');
        } catch (error) {
            console.error('Bulk download failed:', error);
            toast.error('Failed to download QR codes');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrintAll = async () => {
        try {
            setIsPrinting(true);

            const products = await productService.getAllProducts();
            const productIds = products.map(p => p.id);

            if (productIds.length === 0) {
                toast.error('No products found');
                return;
            }

            await qrCodeService.generateQRCodePDF(productIds);

            toast.success('Print window opened');
        } catch (error) {
            console.error('Print failed:', error);
            toast.error('Failed to generate printable QR codes');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDeleteOldScans = async () => {
        try {
            setIsDeleting(true);

            const deletedCount = await qrCodeService.deleteOldScans(daysToKeep);

            toast.success(`Deleted ${deletedCount} old scan logs`, {
                description: `Kept scans from the last ${daysToKeep} days`,
            });
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete old scans');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">QR Code Management</h1>
                    <p className="text-muted-foreground">
                        Manage QR codes and scan data in bulk
                    </p>
                </div>

                {/* Bulk Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Bulk QR Code Generation
                        </CardTitle>
                        <CardDescription>
                            Generate QR codes for all products that don't have one
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleBulkGenerate}
                            disabled={isGenerating}
                            className="w-full"
                        >
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate QR Codes for All Products
                        </Button>
                    </CardContent>
                </Card>

                {/* Bulk Download */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Bulk Download
                        </CardTitle>
                        <CardDescription>
                            Download all QR codes as individual PNG files
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleBulkDownload}
                            disabled={isDownloading}
                            variant="outline"
                            className="w-full"
                        >
                            {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Download All QR Codes
                        </Button>
                    </CardContent>
                </Card>

                {/* Print All */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Printer className="h-5 w-5" />
                            Print QR Codes
                        </CardTitle>
                        <CardDescription>
                            Generate a printable page with all QR codes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handlePrintAll}
                            disabled={isPrinting}
                            variant="outline"
                            className="w-full"
                        >
                            {isPrinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Print All QR Codes
                        </Button>
                    </CardContent>
                </Card>

                {/* Delete Old Scans */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Cleanup Old Scan Logs
                        </CardTitle>
                        <CardDescription>
                            Delete scan logs older than a specified number of days
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="daysToKeep">Days to Keep</Label>
                            <Input
                                id="daysToKeep"
                                type="number"
                                min="1"
                                value={daysToKeep}
                                onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 90)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Scans older than {daysToKeep} days will be deleted
                            </p>
                        </div>
                        <Button
                            onClick={handleDeleteOldScans}
                            disabled={isDeleting}
                            variant="destructive"
                            className="w-full"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Old Scan Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QRManagementPage;
