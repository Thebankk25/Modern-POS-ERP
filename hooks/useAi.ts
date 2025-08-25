
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { AiService, Transaction, Product } from '../types.ts';
import geminiService from '../services/geminiService.ts';
import openaiService from '../services/openaiService.ts';

export type AiProviderType = 'gemini' | 'openai';

interface AiContextType {
  providerName: AiProviderType;
  setProviderName: (name: AiProviderType) => void;
  aiService: AiService;
  availableProviders: { name: AiProviderType; service: AiService }[];
}

const AiContext = createContext<AiContextType | undefined>(undefined);

const providers = [
    { name: 'gemini' as AiProviderType, service: geminiService },
    { name: 'openai' as AiProviderType, service: openaiService }
];

const dummyService: AiService = {
    isConfigured: () => false,
    getProviderName: () => 'None',
    generateProductImage: async () => 'https://picsum.photos/seed/placeholder/400/400',
    generateProductDescription: async () => 'No AI provider configured.',
    summarizeSales: async () => 'No AI provider configured.'
};


export const AiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [providerName, setProviderNameState] = useState<AiProviderType>(() => {
        const storedProvider = localStorage.getItem('ai_provider') as AiProviderType;
        // Ensure the stored provider is one of the valid options
        if (storedProvider === 'gemini' || storedProvider === 'openai') {
            return storedProvider;
        }
        // Default to the first configured provider
        return providers.find(p => p.service.isConfigured())?.name || 'gemini';
    });

    const setProviderName = (name: AiProviderType) => {
        setProviderNameState(name);
        localStorage.setItem('ai_provider', name);
    };

    const availableProviders = useMemo(() => providers.filter(p => p.service.isConfigured()), []);

    const aiService = useMemo(() => {
        const selectedProvider = providers.find(p => p.name === providerName);
        if (selectedProvider && selectedProvider.service.isConfigured()) {
            return selectedProvider.service;
        }
        // Fallback to the first available provider if the selected one is not configured
        if (availableProviders.length > 0) {
            return availableProviders[0].service;
        }
        return dummyService;
    }, [providerName, availableProviders]);
    
    // Effect to auto-select a provider if the saved one becomes invalid
    useEffect(() => {
        const selectedProvider = providers.find(p => p.name === providerName);
        if (!selectedProvider || !selectedProvider.service.isConfigured()) {
            // If current selection is invalid, switch to the first available one
            const firstAvailable = providers.find(p => p.service.isConfigured());
            if (firstAvailable) {
                setProviderName(firstAvailable.name);
            }
        }
    }, [providerName]);


    const contextValue = useMemo(() => ({
        providerName,
        setProviderName,
        aiService,
        availableProviders,
    }), [providerName, aiService, availableProviders]);

    return React.createElement(AiContext.Provider, { value: contextValue }, children);
};

export const useAi = (): AiContextType => {
    const context = useContext(AiContext);
    if (context === undefined) {
        throw new Error('useAi must be used within an AiProvider');
    }
    return context;
};
