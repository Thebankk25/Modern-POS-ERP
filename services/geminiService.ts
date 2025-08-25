
import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, AiService } from "../types.ts";

let ai: GoogleGenAI | null = null;
try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (error) {
    console.error("Gemini API key is not configured or invalid.", error);
}

const translateToEnglish = async (text: string): Promise<string> => {
    if (!ai || !text.trim()) return text;

    const isLikelyEnglish = /^[a-zA-Z0-9\s,.-]+$/.test(text);
    if (isLikelyEnglish) {
        return text;
    }

    try {
        const prompt = `Translate the following Thai product name to a simple, descriptive English equivalent suitable for searching images. Only return the English translation, without any extra text or quotes.\n\nThai: "${text}"\n\nEnglish:`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.1 }
        });
        
        const translatedText = response.text.trim().replace(/^"/, '').replace(/"$/, '');
        return translatedText || text;
    } catch (error) {
        console.error(`Error translating text "${text}":`, error);
        return text;
    }
};

const geminiService: AiService = {
    isConfigured: () => !!ai,
    getProviderName: () => 'Google Gemini',

    generateProductImage: async (productName: string): Promise<string> => {
        if (!ai) return `https://picsum.photos/seed/placeholder/400/400`;
        if (!productName.trim()) return `https://picsum.photos/seed/placeholder/400/400`;

        const englishProductName = await translateToEnglish(productName);
        const fallbackUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(englishProductName)}`;

        try {
            const prompt = `A high-quality, professional studio photo of "${englishProductName}". The item should be centered on a clean, plain white background. Food photography style.`;
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                }
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const image = response.generatedImages[0].image;
                return `data:${image.mimeType || 'image/jpeg'};base64,${image.imageBytes}`;
            }
            
            console.warn(`Gemini image generation failed for "${productName}", using fallback.`);
            return fallbackUrl;
        } catch (error) {
            console.error(`Error generating product image with Gemini for "${productName}":`, error);
            return fallbackUrl;
        }
    },

    generateProductDescription: async (productName: string): Promise<string> => {
        if (!ai) return "AI service is not available.";
        if (!productName.trim()) return "";
        
        try {
            const prompt = `Create a short, appealing product description for a product named "${productName}". The description should be suitable for a POS system, around 15-25 words. Focus on key features or benefits. The response must be in Thai.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            return response.text.trim();
        } catch (error) {
            console.error("Error generating product description with Gemini:", error);
            return "Failed to generate description. Please enter one manually.";
        }
    },

    summarizeSales: async (transactions: Transaction[], products: Product[]): Promise<string> => {
        if (!ai) return "AI service is not available.";
        if (transactions.length === 0) return "ยังไม่มีข้อมูลการขายสำหรับวันนี้";

        const simplifiedTransactions = transactions.map(t => ({
            id: t.id,
            total: t.total,
            itemCount: t.items.reduce((sum, item) => sum + item.quantity, 0),
            items: t.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        })).slice(0, 10);

        const prompt = `You are a helpful business assistant for a retail store owner in Thailand.
        Based on the following recent sales data, provide a short, insightful summary in Thai.
        Highlight the top-selling product if obvious, the total number of transactions, and the total revenue.
        Keep the summary encouraging and easy to read.

        Data:
        - Total Transactions: ${transactions.length}
        - Total Revenue: ${transactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)} THB
        - Recent Transactions: ${JSON.stringify(simplifiedTransactions)}
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.5 }
            });
            return response.text.trim();
        } catch (error) {
            console.error("Error summarizing sales with Gemini:", error);
            return "ไม่สามารถสร้างสรุปยอดขายได้ในขณะนี้";
        }
    }
};

export default geminiService;
