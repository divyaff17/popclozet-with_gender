import React from 'react';
import { ProductIntakeForm } from '@/components/ProductIntakeForm';

const ProductIntakePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Product Intake</h1>
                    <p className="text-lg text-muted-foreground">
                        Add new inventory with AI-powered hygiene SOP generation
                    </p>
                </div>

                <ProductIntakeForm />
            </div>
        </div>
    );
};

export default ProductIntakePage;
