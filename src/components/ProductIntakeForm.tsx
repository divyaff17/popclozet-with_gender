import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hygieneSopService } from '@/services/hygieneSopService';
import { GenderCategory, EventCategory } from '@/services/productService';
import { HygieneSopViewer } from './HygieneSopViewer';
import { QRCodeDisplay } from './QRCodeDisplay';

const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    category: z.string().min(1, 'Category is required'),
    gender: z.enum(['mens', 'womens', 'unisex']),
    eventCategory: z.enum(['casual', 'party', 'cocktail', 'formal', 'street', 'vacation', 'wedding', 'office']),
    color: z.string().min(1, 'Color is required'),
    price: z.number().min(0, 'Price must be positive'),
    rentalPrice: z.number().min(0, 'Rental price must be positive'),
    fabricHint: z.string().optional(),
    description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductIntakeForm: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [generatedProduct, setGeneratedProduct] = useState<any>(null);
    const [generatedSOP, setGeneratedSOP] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const gender = watch('gender');
    const eventCategory = watch('eventCategory');

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('📝 Creating product with minimal data:', data);

            // Create product in database
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert({
                    name: data.name,
                    gender: data.gender,
                    event_category: data.eventCategory,
                    color: data.color,
                    price: data.price,
                    rental_price: data.rentalPrice,
                    fabric_hint: data.fabricHint,
                    description: data.description,
                    is_available: true,
                    rating: 5.0,
                    stock_quantity: 1,
                    rental_count: 0,
                    condition_status: 'excellent',
                })
                .select()
                .single();

            if (productError) throw productError;

            console.log('✅ Product created:', product.id);

            // Auto-generate hygiene SOP using AI
            console.log('🤖 Generating AI-powered hygiene SOP...');
            const sopRecord = await hygieneSopService.generateAndStoreSOP({
                productId: product.id,
                category: data.category,
                gender: data.gender,
                fabricHint: data.fabricHint,
            });

            console.log('✅ Hygiene SOP generated and QR code created!');

            setGeneratedProduct(product);
            setGeneratedSOP(sopRecord);
            setSuccess(true);

            // Reset form
            reset();
        } catch (err) {
            console.error('❌ Product intake error:', err);
            setError(err instanceof Error ? err.message : 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewProduct = () => {
        setSuccess(false);
        setGeneratedProduct(null);
        setGeneratedSOP(null);
    };

    if (success && generatedProduct && generatedSOP) {
        return (
            <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Product created successfully! AI-powered hygiene SOP generated and QR code assigned.
                    </AlertDescription>
                </Alert>

                <QRCodeDisplay productId={generatedProduct.id} />

                <HygieneSopViewer
                    productData={{
                        id: generatedProduct.id,
                        name: generatedProduct.name,
                        gender: generatedProduct.gender,
                        eventCategory: generatedProduct.event_category,
                        color: generatedProduct.color,
                        price: generatedProduct.price,
                        rentalPrice: generatedProduct.rental_price,
                        imageUrl: generatedProduct.image_url || '',
                        rating: generatedProduct.rating,
                        rentalCount: generatedProduct.rental_count,
                        conditionStatus: generatedProduct.condition_status,
                    }}
                    sopData={generatedSOP}
                />

                <Button onClick={handleNewProduct} className="w-full">
                    Add Another Product
                </Button>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    New Product Intake
                </CardTitle>
                <CardDescription>
                    Enter minimal product details. AI will automatically generate hygiene SOPs and assign QR codes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Classic Navy Blazer"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                            id="category"
                            placeholder="e.g., blazer, kurta, dress, shirt"
                            {...register('category')}
                        />
                        {errors.category && (
                            <p className="text-sm text-destructive">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Gender & Event Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select onValueChange={(value) => setValue('gender', value as GenderCategory)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mens">Men's</SelectItem>
                                    <SelectItem value="womens">Women's</SelectItem>
                                    <SelectItem value="unisex">Unisex</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-destructive">{errors.gender.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventCategory">Event Category *</Label>
                            <Select onValueChange={(value) => setValue('eventCategory', value as EventCategory)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="party">Party</SelectItem>
                                    <SelectItem value="cocktail">Cocktail</SelectItem>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="street">Street</SelectItem>
                                    <SelectItem value="vacation">Vacation</SelectItem>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="office">Office</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.eventCategory && (
                                <p className="text-sm text-destructive">{errors.eventCategory.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label htmlFor="color">Color *</Label>
                        <Input
                            id="color"
                            placeholder="e.g., Navy Blue, Red, Black"
                            {...register('color')}
                        />
                        {errors.color && (
                            <p className="text-sm text-destructive">{errors.color.message}</p>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Purchase Price *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('price', { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rentalPrice">Rental Price *</Label>
                            <Input
                                id="rentalPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('rentalPrice', { valueAsNumber: true })}
                            />
                            {errors.rentalPrice && (
                                <p className="text-sm text-destructive">{errors.rentalPrice.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fabric Hint (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="fabricHint">Fabric Hint (Optional)</Label>
                        <Input
                            id="fabricHint"
                            placeholder="e.g., cotton, wool, silk (AI will infer if not provided)"
                            {...register('fabricHint')}
                        />
                        <p className="text-xs text-muted-foreground">
                            If unknown, AI will automatically infer the fabric type based on category and gender
                        </p>
                    </div>

                    {/* Description (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Additional product details..."
                            rows={3}
                            {...register('description')}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating AI-Powered SOP...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Create Product & Generate SOP
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        AI will automatically generate hygiene procedures, cleaning instructions, and assign a unique QR code
                    </p>
                </form>
            </CardContent>
        </Card>
    );
};
