import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Droplet,
    Wind,
    Package,
    ClipboardCheck,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Shirt,
    Hash,
    Calendar,
    Info,
    AlertCircle,
} from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { hygieneSopService, HygieneSopRecord } from '@/services/hygieneSopService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MobileProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [productData, setProductData] = useState<Product | null>(null);
    const [sopData, setSopData] = useState<HygieneSopRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProductData();
    }, [productId]);

    const loadProductData = async () => {
        if (!productId) {
            setError('Product ID is missing');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch product data
            const product = await productService.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            setProductData(product);

            // Fetch hygiene SOP
            const sop = await hygieneSopService.getSOPByProductId(productId);
            if (!sop) {
                throw new Error('Hygiene SOP not found for this product');
            }
            setSopData(sop);
        } catch (err) {
            console.error('❌ Failed to load product data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load product details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-lg text-muted-foreground">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !productData || !sopData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-6 w-6" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error || 'Product not found'}</AlertDescription>
                        </Alert>
                        <Button onClick={() => navigate('/')} className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const cleaningProc = sopData.cleaningProcedure;
    const hygieneSteps = sopData.hygieneSteps;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg">Product Details</h1>
                        <p className="text-xs text-muted-foreground">PopClozet Hygiene Info</p>
                    </div>
                </div>
            </div>

            {/* Product Image */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                {productData.image ? (
                    <img
                        src={productData.image}
                        alt={productData.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="h-32 w-32 text-purple-300 dark:text-purple-700" />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{productData.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/90 text-black">
                            <Shirt className="h-3 w-3 mr-1" />
                            {productData.gender} • {productData.eventCategory}
                        </Badge>
                        {productData.price && (
                            <Badge variant="secondary" className="bg-green-500/90 text-white">
                                ₹{productData.price}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
                {/* Product Info Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Product Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Fabric Type</p>
                                <p className="font-semibold text-sm">{sopData.fabricType}</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Composition</p>
                                <p className="font-semibold text-xs">{sopData.fabricComposition}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Rental Count</p>
                                <p className="font-semibold text-sm">{productData.rentalCount || 0} times</p>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Condition</p>
                                <Badge variant={productData.conditionStatus === 'excellent' ? 'default' : 'secondary'}>
                                    {productData.conditionStatus || 'excellent'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hygiene & Care Instructions */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Hygiene & Care Instructions</CardTitle>
                        <CardDescription>Professional cleaning and maintenance guidelines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="cleaning" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="cleaning" className="text-xs">
                                    <Droplet className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="hygiene" className="text-xs">
                                    <Wind className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="storage" className="text-xs">
                                    <Package className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="inspection" className="text-xs">
                                    <ClipboardCheck className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>

                            {/* Cleaning Tab */}
                            <TabsContent value="cleaning" className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Droplet className="h-5 w-5 text-blue-500" />
                                    Cleaning Procedure
                                </h3>
                                <div className="space-y-2">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Method</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">{cleaningProc.method}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-medium">Temperature</p>
                                            <p className="text-sm">{cleaningProc.temperature}</p>
                                        </div>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-medium">Detergent</p>
                                            <p className="text-sm">{cleaningProc.detergent}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs font-medium">Drying</p>
                                        <p className="text-sm">{cleaningProc.drying}</p>
                                    </div>
                                    {cleaningProc.ironingTemp && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-medium">Ironing</p>
                                            <p className="text-sm">{cleaningProc.ironingTemp}</p>
                                        </div>
                                    )}
                                    {cleaningProc.specialCare && cleaningProc.specialCare.length > 0 && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                                            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-2">
                                                Special Care
                                            </p>
                                            <ul className="space-y-1">
                                                {cleaningProc.specialCare.map((instruction: string, idx: number) => (
                                                    <li key={idx} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                                        <span className="text-amber-500 mt-0.5">•</span>
                                                        <span>{instruction}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Hygiene Tab */}
                            <TabsContent value="hygiene" className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Wind className="h-5 w-5 text-green-500" />
                                    Hygiene Steps
                                </h3>

                                {hygieneSteps.preCleaning && hygieneSteps.preCleaning.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Pre-Cleaning</h4>
                                        <ul className="space-y-2">
                                            {hygieneSteps.preCleaning.map((step: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {hygieneSteps.sanitization && hygieneSteps.sanitization.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Sanitization</h4>
                                        <ul className="space-y-2">
                                            {hygieneSteps.sanitization.map((step: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {hygieneSteps.postCleaning && hygieneSteps.postCleaning.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Post-Cleaning</h4>
                                        <ul className="space-y-2">
                                            {hygieneSteps.postCleaning.map((step: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {hygieneSteps.qualityCheck && hygieneSteps.qualityCheck.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Quality Check</h4>
                                        <ul className="space-y-2">
                                            {hygieneSteps.qualityCheck.map((step: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Storage Tab */}
                            <TabsContent value="storage" className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-purple-500" />
                                    Storage Guidelines
                                </h3>
                                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                    <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">
                                        {sopData.storageGuidelines}
                                    </p>
                                </div>
                            </TabsContent>

                            {/* Inspection Tab */}
                            <TabsContent value="inspection" className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-orange-500" />
                                    Inspection Checklist
                                </h3>
                                <div className="space-y-2">
                                    {sopData.inspectionChecklist.map((item: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                                        >
                                            <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-orange-500 mt-0.5" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Special Instructions */}
                {sopData.specialInstructions && (
                    <Card className="shadow-lg border-amber-200 dark:border-amber-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-5 w-5" />
                                Special Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                                <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-line">
                                    {sopData.specialInstructions}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Metadata */}
                <Card className="shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Updated: {new Date(sopData.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                <span>Version {sopData.version}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MobileProductDetailPage;
