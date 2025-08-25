
import OpenAI from 'openai';
import { Transaction, Product, AiService } from '../types.ts';

let openai: OpenAI | null = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true, // Required for use in browser environments
        });
    }
} catch (error) {
    console.error("OpenAI API key is not configured or invalid.", error);
}

const openaiService: AiService = {
    isConfigured: () => !!openai,
    getProviderName: () => 'OpenAI ChatGPT',

    generateProductImage: async (productName: string): Promise<string> => {
        if (!openai) return `https://picsum.photos/seed/placeholder/400/400`;
        if (!productName.trim()) return `https://picsum.photos/seed/placeholder/400/400`;

        const fallbackUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(productName)}`;

        try {
            // DALL-E 3 works well with natural language, including Thai.
            const prompt = `ภาพถ่ายสินค้าสตูดิโอคุณภาพสูงของ "${productName}" จัดวางกลางภาพบนพื้นหลังสีขาวล้วนเรียบๆ สไตล์ภาพถ่ายอาหาร`;
            
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024", // DALL-E 3 standard size
                response_format: 'b64_json',
            });

            const b64_json = response.data[0]?.b64_json;
            if (b64_json) {
                return `data:image/png;base64,${b64_json}`;
            }

            console.warn(`OpenAI image generation failed for "${productName}", using fallback.`);
            return fallbackUrl;
        } catch (error) {
            console.error(`Error generating product image with OpenAI for "${productName}":`, error);
            return fallbackUrl;
        }
    },

    generateProductDescription: async (productName: string): Promise<string> => {
        if (!openai) return "AI service is not available.";
        if (!productName.trim()) return "";

        try {
            const prompt = `Create a short, appealing product description for a product named "${productName}". The description should be suitable for a POS system, around 15-25 words. Focus on key features or benefits. The response must be in Thai.`;
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content?.trim() || "Failed to get a valid response.";
        } catch (error) {
            console.error("Error generating product description with OpenAI:", error);
            return "Failed to generate description. Please enter one manually.";
        }
    },

    summarizeSales: async (transactions: Transaction[], products: Product[]): Promise<string> => {
        if (!openai) return "AI service is not available.";
        if (transactions.length === 0) return "ยังไม่มีข้อมูลการขายสำหรับวันนี้";

        const simplifiedTransactions = transactions.map(t => ({
            total: t.total,
            items: t.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        })).slice(0, 10);

        const prompt = `You are a helpful business assistant for a retail store owner in Thailand.
        Based on the following recent sales data, provide a short, insightful summary in Thai.
        Highlight the top-selling product if obvious, the total number of transactions, and the total revenue.
        Keep the summary encouraging and easy to read.

        Data:
        - Total Transactions: ${transactions.length}
        - Total Revenue: ${transactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)} THB
        - Recent Transactions (sample): ${JSON.stringify(simplifiedTransactions)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.5,
            });

            return response.choices[0]?.message?.content?.trim() || "Failed to get a valid response.";
        } catch (error) {
            console.error("Error summarizing sales with OpenAI:", error);
            return "ไม่สามารถสร้างสรุปยอดขายได้ในขณะนี้";
        }
    }
};

export default openaiService;
