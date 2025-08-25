
import React from 'react';
import { useAi, AiProviderType } from '../hooks/useAi.ts';
import { CheckCircle, XCircle, BrainCircuit, Bot } from 'lucide-react';
import geminiService from '../services/geminiService.ts';
import openaiService from '../services/openaiService.ts';

const ProviderCard: React.FC<{
    name: string;
    icon: React.ReactNode;
    providerId: AiProviderType;
    isSelected: boolean;
    isConfigured: boolean;
    onSelect: () => void;
}> = ({ name, icon, providerId, isSelected, isConfigured, onSelect }) => {
    return (
        <div
            onClick={onSelect}
            className={`
                p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}
            `}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className="mr-4 text-indigo-600">{icon}</div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{name}</h3>
                        <p className="text-sm text-slate-500">
                           {providerId === 'gemini' ? 'ให้บริการโดย Google' : 'ให้บริการโดย OpenAI'}
                        </p>
                    </div>
                </div>
                {isConfigured ? (
                    <div className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle size={14} className="mr-1.5" />
                        กำหนดค่าแล้ว
                    </div>
                ) : (
                    <div className="flex items-center text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        <XCircle size={14} className="mr-1.5" />
                        ยังไม่ได้ตั้งค่า
                    </div>
                )}
            </div>
             {!isConfigured && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
                    ต้องตั้งค่า {providerId === 'gemini' ? 'API_KEY' : 'OPENAI_API_KEY'} ใน Environment Variables ก่อนจึงจะใช้งานได้
                </p>
            )}
        </div>
    );
};


const Settings: React.FC = () => {
    const { providerName, setProviderName } = useAi();
    
    // We check configuration directly here to render the UI state correctly
    const isGeminiConfigured = geminiService.isConfigured();
    const isOpenAiConfigured = openaiService.isConfigured();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-2">ผู้ให้บริการ AI (AI Provider)</h2>
                <p className="text-sm text-slate-500 mb-6">
                    เลือก "สมอง" ที่จะใช้ขับเคลื่อนฟีเจอร์ AI ต่างๆ ในระบบ เช่น การสร้างคำอธิบายสินค้าและสรุปยอดขาย
                </p>
                
                <div className="space-y-4">
                    <ProviderCard
                        name="Google Gemini"
                        icon={<BrainCircuit size={32} />}
                        providerId="gemini"
                        isSelected={providerName === 'gemini'}
                        isConfigured={isGeminiConfigured}
                        onSelect={() => setProviderName('gemini')}
                    />
                    <ProviderCard
                        name="OpenAI ChatGPT"
                        icon={<Bot size={32} />}
                        providerId="openai"
                        isSelected={providerName === 'openai'}
                        isConfigured={isOpenAiConfigured}
                        onSelect={() => setProviderName('openai')}
                    />
                </div>
                
                 {(!isGeminiConfigured && !isOpenAiConfigured) && (
                    <div className="mt-6 text-center text-red-600 bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold">คำเตือน: ไม่มีการกำหนดค่าผู้ให้บริการ AI</p>
                        <p className="text-sm">ฟีเจอร์ AI ทั้งหมดจะไม่สามารถทำงานได้จนกว่าจะมีการตั้งค่า API Key อย่างน้อยหนึ่งบริการ</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
