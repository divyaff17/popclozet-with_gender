import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, Package, Settings, CheckCircle2, Sparkles, ArrowRight, Zap } from 'lucide-react';

const QRHygienePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    QR Scanner & Hygiene SOP System
                </h1>
                <p className="text-xl text-muted-foreground mb-2">
                    AI-Powered Inventory Hygiene Management
                </p>
                <p className="text-sm text-muted-foreground">
                    Automated pipeline: Product Intake → AI SOP Generation → QR Code Assignment → Secure Scanning
                </p>
            </div>

            {/* Quick Start Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Product Intake Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <Package className="h-6 w-6" />
                            Product Intake
                        </CardTitle>
                        <CardDescription>
                            Add new inventory with minimal details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enter basic product information. AI automatically generates complete hygiene SOPs and assigns QR codes.
                        </p>
                        <Link to="/product-intake">
                            <Button className="w-full" variant="default">
                                Add New Product
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>✓ AI-generated cleaning procedures</p>
                            <p>✓ Automatic QR code generation</p>
                            <p>✓ No manual SOP creation needed</p>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Scanner Card */}
                <Card className="hover:shadow-lg transition-shadow border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <Camera className="h-6 w-6" />
                            QR Scanner
                        </CardTitle>
                        <CardDescription>
                            Scan QR codes to access hygiene information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Use your camera to scan product QR codes. Access cleaning procedures, fabric details, and hygiene steps instantly.
                        </p>
                        <Link to="/qr-scanner">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                <Camera className="mr-2 h-4 w-4" />
                                Open QR Scanner
                            </Button>
                        </Link>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>✓ Real-time camera scanning</p>
                            <p>✓ Admin-only access control</p>
                            <p>✓ Works with @yudiel/react-qr-scanner</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Dashboard Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-600">
                            <Settings className="h-6 w-6" />
                            Admin Dashboard
                        </CardTitle>
                        <CardDescription>
                            Manage hygiene SOPs and QR codes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            View statistics, bulk generate SOPs for existing products, and manage QR codes across your inventory.
                        </p>
                        <Link to="/admin/hygiene">
                            <Button className="w-full" variant="outline">
                                Open Admin Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>✓ Inventory overview</p>
                            <p>✓ Bulk operations</p>
                            <p>✓ QR code management</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Product QR Gallery Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <Package className="h-6 w-6" />
                            Product Gallery
                        </CardTitle>
                        <CardDescription>
                            View all products with QR codes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Browse all products (mens, womens, unisex) with their QR codes. View and download QR codes, or scan them to access hygiene SOPs.
                        </p>
                        <Link to="/products/qr-gallery">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                <QrCode className="mr-2 h-4 w-4" />
                                View Product Gallery
                            </Button>
                        </Link>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>✓ All products (mens/womens/unisex)</p>
                            <p>✓ QR codes visible</p>
                            <p>✓ Scan to view SOPs</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Automated Pipeline Flow */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-blue-600" />
                        Automated Inventory Pipeline
                    </CardTitle>
                    <CardDescription>
                        How inventory (new and existing) automatically gets QR codes and hygiene SOPs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                                1
                            </div>
                            <h4 className="font-semibold mb-2">Minimal Intake</h4>
                            <p className="text-xs text-muted-foreground">
                                Enter category, gender, and basic details
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-blue-600" />
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h4 className="font-semibold mb-2">AI SOP Generation</h4>
                            <p className="text-xs text-muted-foreground">
                                AI infers fabric type and generates cleaning procedures
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-green-600" />
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                                <QrCode className="h-6 w-6" />
                            </div>
                            <h4 className="font-semibold mb-2">QR Assignment</h4>
                            <p className="text-xs text-muted-foreground">
                                Unique QR code automatically generated and linked
                            </p>
                        </div>
                    </div>

                    <Alert className="mt-6 bg-white/80">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                            <strong>Automatic Process:</strong> 
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>New Products:</strong> When you add a new product via the Product Intake form, 
                                the system automatically triggers AI SOP generation and QR code creation. No manual steps required!</li>
                                <li><strong>Existing Inventory:</strong> Use the Admin Dashboard to bulk-process all existing products 
                                from your database. The system will automatically generate SOPs and QR codes for products that don't have them.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>🎯 Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Works with Incomplete Data</h4>
                                <p className="text-sm text-muted-foreground">
                                    AI infers fabric types and cleaning methods even when only basic product info is available
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Automatic QR Generation</h4>
                                <p className="text-sm text-muted-foreground">
                                    Every new product automatically gets a unique QR code linked to its hygiene SOP
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Secure Access Control</h4>
                                <p className="text-sm text-muted-foreground">
                                    QR codes only reveal internal hygiene information to admin/staff users
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Optimized Scanner</h4>
                                <p className="text-sm text-muted-foreground">
                                    Uses @yudiel/react-qr-scanner (2025-optimized) for fast, accurate scanning
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Testing Info */}
            <Alert className="bg-yellow-50 border-yellow-200">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                    <strong>🧪 Testing Mode Active:</strong> Authentication is bypassed for testing purposes. 
                    All features are accessible. Start by adding a product, then scan its QR code to see the complete flow!
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default QRHygienePage;
