import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';
import { aiSopService, HygieneSOP, FabricInference } from './aiSopService';
import { qrCodeService } from './qrCodeService';
import { errorLoggingService } from './errorLoggingService';

// Hygiene SOP interface
export interface HygieneSopRecord {
    id: string;
    productId: string;
    fabricType: string;
    fabricComposition: string;
    cleaningProcedure: any;
    hygieneSteps: any;
    storageGuidelines: string;
    inspectionChecklist: any;
    specialInstructions: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}

// IndexedDB Schema for offline SOP storage
interface HygieneSopDB extends DBSchema {
    hygiene_sops: {
        key: string;
        value: HygieneSopRecord;
        indexes: {
            'by-product': string;
        };
    };
}

class HygieneSopService {
    private db: IDBPDatabase<HygieneSopDB> | null = null;
    private readonly DB_NAME = 'popclozet-hygiene-sops';
    private readonly DB_VERSION = 1;

    // Initialize IndexedDB
    async initDB(): Promise<IDBPDatabase<HygieneSopDB>> {
        if (this.db) return this.db;

        this.db = await openDB<HygieneSopDB>(this.DB_NAME, this.DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('hygiene_sops')) {
                    const sopStore = db.createObjectStore('hygiene_sops', { keyPath: 'id' });
                    sopStore.createIndex('by-product', 'productId');
                }
            },
        });

        return this.db;
    }

    // Check if online
    private isOnline(): boolean {
        return navigator.onLine;
    }

    // Generate and store SOP for new product
    async generateAndStoreSOP(productData: {
        productId: string;
        category: string;
        gender: string;
        fabricHint?: string;
    }): Promise<HygieneSopRecord> {
        try {
            console.log('🤖 Generating SOP for product:', productData.productId);

            // Generate AI-powered SOP
            const { fabricInference, hygieneSOP } = await aiSopService.generateCompleteSOP({
                category: productData.category,
                gender: productData.gender,
                fabricHint: productData.fabricHint,
            });

            // Store in Supabase
            const sopRecord = await this.storeSOP(
                productData.productId,
                fabricInference,
                hygieneSOP
            );

            // Generate QR code for product
            await qrCodeService.generateProductQRCode(productData.productId);

            console.log('✅ SOP generated and stored for product:', productData.productId);

            // Log audit event for SOP generation
            await errorLoggingService.logAudit(
                'hygiene_sop_generated',
                'hygiene_sop',
                sopRecord.id,
                { productId: productData.productId, fabricType: fabricInference.fabricType }
            );

            return sopRecord;
        } catch (error) {
            console.error('❌ Failed to generate and store SOP:', error);
            throw error;
        }
    }

    // Store SOP in database
    private async storeSOP(
        productId: string,
        fabricInference: FabricInference,
        hygieneSOP: HygieneSOP
    ): Promise<HygieneSopRecord> {
        try {
            const { data, error } = await supabase
                .from('hygiene_sops')
                .insert({
                    product_id: productId,
                    fabric_type: fabricInference.fabricType,
                    fabric_composition: fabricInference.composition,
                    cleaning_procedure: hygieneSOP.cleaningProcedure,
                    hygiene_steps: hygieneSOP.hygieneSteps,
                    storage_guidelines: hygieneSOP.storageGuidelines,
                    inspection_checklist: hygieneSOP.inspectionChecklist,
                    special_instructions: hygieneSOP.specialInstructions,
                    version: 1,
                })
                .select()
                .single();

            if (error) throw error;

            const sopRecord: HygieneSopRecord = {
                id: data.id,
                productId: data.product_id,
                fabricType: data.fabric_type,
                fabricComposition: data.fabric_composition,
                cleaningProcedure: data.cleaning_procedure,
                hygieneSteps: data.hygiene_steps,
                storageGuidelines: data.storage_guidelines,
                inspectionChecklist: data.inspection_checklist,
                specialInstructions: data.special_instructions,
                version: data.version,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };

            // Cache in IndexedDB
            await this.cacheSOPOffline(sopRecord);

            // Update product with SOP reference
            await supabase
                .from('products')
                .update({
                    hygiene_sop_id: data.id,
                    fabric_type: fabricInference.fabricType,
                })
                .eq('id', productId);

            return sopRecord;
        } catch (error) {
            console.error('❌ Failed to store SOP:', error);
            throw error;
        }
    }

    // Cache SOP in IndexedDB for offline access
    private async cacheSOPOffline(sopRecord: HygieneSopRecord): Promise<void> {
        try {
            const db = await this.initDB();
            await db.put('hygiene_sops', sopRecord);
        } catch (error) {
            console.error('⚠️ Failed to cache SOP offline:', error);
        }
    }

    // Get SOP by product ID
    async getSOPByProductId(productId: string): Promise<HygieneSopRecord | null> {
        if (this.isOnline()) {
            try {
                const { data, error } = await supabase
                    .from('hygiene_sops')
                    .select('*')
                    .eq('product_id', productId)
                    .order('version', { ascending: false })
                    .limit(1)
                    .single();

                if (error) throw error;

                const sopRecord: HygieneSopRecord = {
                    id: data.id,
                    productId: data.product_id,
                    fabricType: data.fabric_type,
                    fabricComposition: data.fabric_composition,
                    cleaningProcedure: data.cleaning_procedure,
                    hygieneSteps: data.hygiene_steps,
                    storageGuidelines: data.storage_guidelines,
                    inspectionChecklist: data.inspection_checklist,
                    specialInstructions: data.special_instructions,
                    version: data.version,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                };

                // Cache for offline use
                await this.cacheSOPOffline(sopRecord);

                return sopRecord;
            } catch (error) {
                console.warn('⚠️ Falling back to offline SOP:', error);
                return this.getSOPOffline(productId);
            }
        } else {
            return this.getSOPOffline(productId);
        }
    }

    // Get SOP from IndexedDB (offline)
    private async getSOPOffline(productId: string): Promise<HygieneSopRecord | null> {
        try {
            const db = await this.initDB();
            const sops = await db.getAllFromIndex('hygiene_sops', 'by-product', productId);
            return sops.length > 0 ? sops[0] : null;
        } catch (error) {
            console.error('❌ Failed to get offline SOP:', error);
            return null;
        }
    }

    // Update SOP
    async updateSOP(
        productId: string,
        updates: Partial<HygieneSOP>
    ): Promise<HygieneSopRecord> {
        try {
            // Get current SOP
            const currentSOP = await this.getSOPByProductId(productId);
            if (!currentSOP) throw new Error('SOP not found');

            // Create new version
            const { data, error } = await supabase
                .from('hygiene_sops')
                .insert({
                    product_id: productId,
                    fabric_type: currentSOP.fabricType,
                    fabric_composition: currentSOP.fabricComposition,
                    cleaning_procedure: updates.cleaningProcedure || currentSOP.cleaningProcedure,
                    hygiene_steps: updates.hygieneSteps || currentSOP.hygieneSteps,
                    storage_guidelines: updates.storageGuidelines || currentSOP.storageGuidelines,
                    inspection_checklist: updates.inspectionChecklist || currentSOP.inspectionChecklist,
                    special_instructions: updates.specialInstructions || currentSOP.specialInstructions,
                    version: currentSOP.version + 1,
                })
                .select()
                .single();

            if (error) throw error;

            const updatedSOP: HygieneSopRecord = {
                id: data.id,
                productId: data.product_id,
                fabricType: data.fabric_type,
                fabricComposition: data.fabric_composition,
                cleaningProcedure: data.cleaning_procedure,
                hygieneSteps: data.hygiene_steps,
                storageGuidelines: data.storage_guidelines,
                inspectionChecklist: data.inspection_checklist,
                specialInstructions: data.special_instructions,
                version: data.version,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };

            // Update product reference
            await supabase
                .from('products')
                .update({ hygiene_sop_id: data.id })
                .eq('id', productId);

            // Cache offline
            await this.cacheSOPOffline(updatedSOP);

            console.log('✅ SOP updated to version', data.version);

            // Log audit event for SOP update
            await errorLoggingService.logAudit(
                'hygiene_sop_updated',
                'hygiene_sop',
                updatedSOP.id,
                { productId, version: data.version, changes: updates }
            );

            return updatedSOP;
        } catch (error) {
            console.error('❌ Failed to update SOP:', error);
            throw error;
        }
    }

    // Bulk generate SOPs for existing products
    async bulkGenerateSOPs(products: Array<{
        id: string;
        category: string;
        gender: string;
        fabricHint?: string;
    }>): Promise<{
        success: number;
        failed: number;
        results: Array<{ productId: string; success: boolean; error?: string }>;
    }> {
        const results: Array<{ productId: string; success: boolean; error?: string }> = [];
        let success = 0;
        let failed = 0;

        console.log(`🤖 Starting bulk SOP generation for ${products.length} products...`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            try {
                console.log(`📦 Processing product ${i + 1}/${products.length}: ${product.id}`);

                await this.generateAndStoreSOP({
                    productId: product.id,
                    category: product.category,
                    gender: product.gender,
                    fabricHint: product.fabricHint,
                });

                results.push({ productId: product.id, success: true });
                success++;

                // Add delay to avoid rate limiting (only if not last item)
                if (i < products.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`❌ Failed to generate SOP for product ${product.id}:`, error);
                results.push({
                    productId: product.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                failed++;
            }
        }

        console.log(`✅ Bulk SOP generation complete: ${success} success, ${failed} failed`);

        return { success, failed, results };
    }

    // Automatically process all existing products that need SOPs
    // Note: productService parameter is injected to avoid circular dependencies
    async processAllExistingProducts(productService: any): Promise<{
        success: number;
        failed: number;
        results: Array<{ productId: string; success: boolean; error?: string }>;
    }> {
        const productsWithoutSOPs = await productService.getProductsWithoutSOPs();

        if (productsWithoutSOPs.length === 0) {
            console.log('✅ All products already have hygiene SOPs');
            return { success: 0, failed: 0, results: [] };
        }

        console.log(`🔍 Found ${productsWithoutSOPs.length} products without SOPs`);

        // Convert products to the format needed for bulk generation
        const productsToProcess = productsWithoutSOPs.map((product: any) => ({
            id: product.id,
            category: productService.extractCategory(product),
            gender: product.gender,
            fabricHint: product.fabricHint,
        }));

        return await this.bulkGenerateSOPs(productsToProcess);
    }
}

// Export singleton instance
export const hygieneSopService = new HygieneSopService();
