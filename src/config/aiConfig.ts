// AI Configuration for Hygiene SOP Generation
export const AI_CONFIG = {
    // Google Gemini API Configuration
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: 'gemini-2.0-flash-exp', // Optimized for 2025

    // Rate limiting
    maxRequestsPerMinute: 60,
    requestTimeout: 30000, // 30 seconds

    // SOP Generation Settings
    sopGeneration: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
    },
};

// Fabric type mapping
export const FABRIC_CATEGORIES = {
    natural: ['cotton', 'linen', 'silk', 'wool', 'cashmere', 'leather'],
    synthetic: ['polyester', 'nylon', 'acrylic', 'spandex', 'rayon'],
    blended: ['cotton-polyester', 'wool-synthetic', 'silk-blend'],
};

// Product category to fabric mapping
export const CATEGORY_FABRIC_HINTS: Record<string, string[]> = {
    blazer: ['wool', 'cotton', 'polyester', 'wool-synthetic'],
    kurta: ['cotton', 'silk', 'linen'],
    dress: ['cotton', 'silk', 'polyester', 'chiffon'],
    shirt: ['cotton', 'linen', 'polyester'],
    pants: ['cotton', 'wool', 'polyester'],
    jacket: ['leather', 'denim', 'wool', 'synthetic'],
    saree: ['silk', 'cotton', 'chiffon'],
    suit: ['wool', 'cotton-polyester'],
};

// Cleaning method templates
export const CLEANING_METHODS = {
    'dry-clean-only': {
        method: 'Professional Dry Cleaning',
        frequency: 'After each rental',
        temperature: 'N/A',
        detergent: 'Professional dry cleaning solvents',
    },
    'machine-wash-cold': {
        method: 'Machine Wash',
        frequency: 'After each rental',
        temperature: '30°C (Cold)',
        detergent: 'Mild liquid detergent',
    },
    'hand-wash': {
        method: 'Hand Wash',
        frequency: 'After each rental',
        temperature: 'Lukewarm (30-40°C)',
        detergent: 'Gentle fabric wash',
    },
    'spot-clean': {
        method: 'Spot Cleaning',
        frequency: 'As needed',
        temperature: 'Room temperature',
        detergent: 'Fabric-specific spot cleaner',
    },
};

// Hygiene standards
export const HYGIENE_STANDARDS = {
    sanitization: [
        'Steam sanitization at 100°C for 10 minutes',
        'UV-C light treatment for 15 minutes',
        'Fabric-safe disinfectant spray application',
    ],
    inspection: [
        'Visual inspection for stains, tears, or damage',
        'Odor check',
        'Button, zipper, and fastener functionality check',
        'Lining and seam integrity check',
    ],
    storage: [
        'Store in breathable garment bags',
        'Maintain 18-22°C temperature',
        'Keep humidity between 40-50%',
        'Avoid direct sunlight',
    ],
};

// AI Prompt Templates
export const PROMPT_TEMPLATES = {
    fabricInference: (category: string, gender: string, hint?: string) => `
You are a textile expert. Based on the following information, infer the most likely fabric type and composition:

Product Category: ${category}
Gender: ${gender}
${hint ? `Fabric Hint: ${hint}` : 'No fabric hint provided'}

Respond with a JSON object containing:
{
  "fabricType": "primary fabric type (e.g., cotton, wool, silk)",
  "composition": "detailed composition (e.g., 80% cotton, 20% polyester)",
  "confidence": "high/medium/low"
}

Only respond with valid JSON, no additional text.
`,

    sopGeneration: (fabricType: string, composition: string, category: string, gender: string) => `
You are a professional garment care specialist. Generate a comprehensive hygiene Standard Operating Procedure (SOP) for a rental apparel item with the following details:

Fabric Type: ${fabricType}
Composition: ${composition}
Category: ${category}
Gender: ${gender}

Generate a detailed SOP in JSON format with the following structure:
{
  "cleaningProcedure": {
    "method": "cleaning method (e.g., dry clean, machine wash, hand wash)",
    "temperature": "recommended temperature",
    "detergent": "recommended detergent type",
    "drying": "drying instructions",
    "ironingTemp": "ironing temperature if applicable",
    "specialCare": ["array of special care instructions"]
  },
  "hygieneSteps": {
    "preCleaning": ["steps before cleaning"],
    "sanitization": ["sanitization procedures"],
    "postCleaning": ["steps after cleaning"],
    "qualityCheck": ["quality assurance steps"]
  },
  "storageGuidelines": "detailed storage instructions for maintaining hygiene between rentals",
  "inspectionChecklist": [
    "checklist items for pre-rental inspection"
  ],
  "specialInstructions": "any special instructions or warnings"
}

Ensure all procedures follow industry best practices for rental apparel hygiene and safety. Only respond with valid JSON, no additional text.
`,
};

// Validation
if (!AI_CONFIG.apiKey && import.meta.env.MODE === 'production') {
    console.warn('⚠️ VITE_GEMINI_API_KEY not set. AI SOP generation will not work.');
}
