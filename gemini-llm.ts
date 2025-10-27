/**
 * Gemini LLM Integration for Amimi Memory Concept
 * 
 * Handles interaction with Google's Gemini API for both text and image generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Config {
    apiKey: string;
}

export class GeminiLLM {
    private apiKey: string;

    constructor(config: Config) {
        this.apiKey = config.apiKey;
    }

    /**
     * Generate text content using Gemini with JSON response format
     */
    async generateText(prompt: string, modelName: string = 'gemini-2.0-flash-exp'): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                }
            });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('❌ Error calling Gemini API:', (error as Error).message);
            throw error;
        }
    }

    /**
     * Generate image content using Gemini image generation model
     */
    async generateImage(prompt: string, modelName: string = 'gemini-2.5-flash-image'): Promise<any> {
        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // Debug: log the structure
            console.log('🔍 Response structure:', JSON.stringify(Object.keys(response), null, 2));
            console.log('🔍 Response candidates:', response.candidates ? response.candidates.length : 'none');
            
            return response;
        } catch (error) {
            console.error('❌ Error calling Gemini Image API:', (error as Error).message);
            throw error;
        }
    }
}
