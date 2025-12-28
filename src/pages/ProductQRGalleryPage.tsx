import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Loader2,
    QrCode,
    Package,
    CheckCircle2,
    AlertCircle,
    Download,
    Printer,
    Eye,
    Filter,
} from 'lucide-react';
import { productService, GenderCategory } from '@/services/productService';
import { qrCodeService } from '@/services/qrCodeService';
import { hygieneSopService } from '@/services/hygieneSopService';
import { HygieneSopViewer } from '@/components/HygieneSopViewer';
import type { Product } from '@/services/productService';

interface ProductWithQR extends Product {
    qrCodeUrl?: string;
    hasQRCode: boolean;
    hasSOP: boolean;
}

const ProductQRGalleryPage: React.FC = () => {
    const [products, setProducts] = useState<ProductWithQR[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductWithQR[]>([]);
    const [selectedGender, setSelectedGender] = useState<GenderCategory | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithQR | null>(null);
    const [sopData, setSopData] = useState<any>(null);
    const [isLoadingSOP, setIsLoadingSOP] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedGender]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const allProducts = await productService.getAllProducts();

            // Load QR codes for all products
            const productsWithQR = await Promise.all(
                allProducts.map(async (product) => {
                    try {
                        const qrCode = await qrCodeService.getQRCodeByProductId(product.id);
                        return {
                            ...product,
                            qrCodeUrl: qrCode.qrCodeUrl || undefined,
                            hasQRCode: true,
                            hasSOP: !!product.hygieneSopId,
                        };
                    } catch {
                        return {
                            ...product,
                            hasQRCode: false,
                            hasSOP: !!product.hygieneSopId,
                        };
                    }
                })
            );

            setProducts(productsWithQR);
        } catch (error) {
            console.error('❌ Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        if (selectedGender === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.gender === selectedGender));
        }
    };

    const handleViewSOP = async (product: ProductWithQR) => {
        if (!product.hygieneSopId) {
            alert('This product does not have a hygiene SOP yet.');
            return;
        }

        try {
            setIsLoadingSOP(true);
            const sop = await hygieneSopService.getSOPByProductId(product.id);
            setSopData(sop);
            setSelectedProduct(product);
        } catch (error) {
            console.error('❌ Failed to load SOP:', error);
            alert('Failed to load hygiene SOP');
        } finally {
            setIsLoadingSOP(false);
        }
    };

    const handleViewQR = async (product: ProductWithQR) => {
        if (!product.hasQRCode) {
            alert('This product does not have a QR code yet.');
            return;
        }

        try {
            const qrCode = await qrCodeService.getQRCodeByProductId(product.id);
            setQrCodeUrl(qrCode.qrCodeUrl || null);
            setSelectedProduct(product);
        } catch (error) {
            console.error('❌ Failed to load QR code:', error);
        }
    };

    const handleDownloadQR = async (qrCodeUrl: string, productName: string) => {
        await qrCodeService.downloadQRCode(qrCodeUrl, `qr-${productName.replace(/\s+/g, '-')}`);
    };

    const handlePrintQR = async (qrCodeUrl: string) => {
        await qrCodeService.printQRCode(qrCodeUrl);
    };

    const stats = {
        total: products.length,
        mens: products.filter(p => p.gender === 'mens').length,
        womens: products.filter(p => p.gender === 'womens').length,
        unisex: products.filter(p => p.gender === 'unisex').length,
        withQR: products.filter(p => p.hasQRCode).length,
        withSOP: products.filter(p => p.hasSOP).length,
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Product QR Code Gallery</h1>
                <p className="text-lg text-muted-foreground">
                    View all products with QR codes. Scan QR codes to access hygiene SOPs.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total Products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.mens}</div>
                        <p className="text-xs text-muted-foreground">Men's</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.womens}</div>
                        <p className="text-xs text-muted-foreground">Women's</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.unisex}</div>
                        <p className="text-xs text-muted-foreground">Unisex</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.withQR}</div>
                        <p className="text-xs text-muted-foreground">With QR Codes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.withSOP}</div>
                        <p className="text-xs text-muted-foreground">With SOPs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Tabs value={selectedGender} onValueChange={(v) => setSelectedGender(v as GenderCategory | 'all')}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                    <TabsTrigger value="mens">Men's ({stats.mens})</TabsTrigger>
                    <TabsTrigger value="womens">Women's ({stats.womens})</TabsTrigger>
                    <TabsTrigger value="unisex">Unisex ({stats.unisex})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedGender} className="mt-6">
                    {filteredProducts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-2">No products found</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Import products from codebase using the Admin Dashboard
                                </p>
                                <Button asChild variant="outline">
                                    <a href="/#/admin/hygiene">Go to Admin Dashboard</a>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Product Image */}
                                    <div className="relative aspect-[3/4] bg-muted">
                                        <img
                                            src={product.imageUrl || '/placeholder.svg'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* QR Code Badge */}
                                        {product.hasQRCode && (
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-green-500">
                                                    <QrCode className="h-3 w-3 mr-1" />
                                                    QR Ready
                                                </Badge>
                                            </div>
                                        )}
                                        {/* SOP Badge */}
                                        {product.hasSOP && (
                                            <div className="absolute top-2 left-2">
                                                <Badge className="bg-blue-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    SOP
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                        <CardDescription>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline">{product.gender}</Badge>
                                                <Badge variant="outline">{product.eventCategory}</Badge>
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">₹{product.price}</span>
                                            {product.rentalPrice && (
                                                <span className="text-sm text-muted-foreground">
                                                    Rent: ₹{product.rentalPrice}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {product.hasQRCode && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleViewQR(product)}
                                                >
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                    View QR
                                                </Button>
                                            )}
                                            {product.hasSOP && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleViewSOP(product)}
                                                    disabled={isLoadingSOP}
                                                >
                                                    {isLoadingSOP ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 mr-2" />
                                                    )}
                                                    View SOP
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* QR Code Dialog */}
            {selectedProduct && qrCodeUrl && (
                <Dialog open={!!qrCodeUrl} onOpenChange={() => setQrCodeUrl(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>QR Code - {selectedProduct.name}</DialogTitle>
                            <DialogDescription>
                                Scan this QR code to access hygiene SOP information
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed">
                                <img
                                    src={qrCodeUrl}
                                    alt="Product QR Code"
                                    className="w-64 h-64"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleDownloadQR(qrCodeUrl, selectedProduct.name)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePrintQR(qrCodeUrl)}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* SOP Viewer Dialog */}
            {selectedProduct && sopData && (
                <Dialog open={!!sopData} onOpenChange={(open) => !open && setSopData(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Hygiene SOP - {selectedProduct.name}</DialogTitle>
                            <DialogDescription>
                                Standard Operating Procedure for cleaning and hygiene
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <HygieneSopViewer
                                productData={selectedProduct}
                                sopData={sopData}
                                onClose={() => setSopData(null)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ProductQRGalleryPage;

