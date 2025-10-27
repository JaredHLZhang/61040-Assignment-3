/**
 * CoupleMemory Concept - AI Augmented Version
 * 
 * A concept for helping long-distance couples document and reflect on their conversations
 * by creating visual memories. Supports both manual creation and AI-assisted generation.
 */

import { GeminiLLM } from './gemini-llm';
import * as fs from 'fs';
import * as path from 'path';

// A transcript of a conversation
export interface Transcript {
    text: string;
}

// A reflection entry with summary and feedback
export interface MemoryEntry {
    summary: string;
    lovelyMessage: string;
    amyFeedback: string;
    jayFeedback: string;
}

// Image data in base64 format
export interface ImageData {
    base64Content: string;
    format: string;
}

export class CoupleMemory {
    private transcript: string | null = null;
    private memoryEntry: MemoryEntry | null = null;
    private collageImageData: ImageData | null = null;

    // Manual actions (non-AI)
    loadTranscript(text: string): void {
        if (!text || text.trim().length === 0) {
            throw new Error('Transcript text cannot be empty');
        }
        this.transcript = text;
        console.log('📝 Transcript loaded');
    }

    createMemoryManually(
        summary: string,
        lovelyMessage: string,
        amyFeedback: string,
        jayFeedback: string
    ): MemoryEntry {
        if (!summary || summary.trim().length === 0 ||
            !lovelyMessage || lovelyMessage.trim().length === 0 ||
            !amyFeedback || amyFeedback.trim().length === 0 ||
            !jayFeedback || jayFeedback.trim().length === 0) {
            throw new Error('All reflection fields must be non-empty');
        }

        this.memoryEntry = {
            summary,
            lovelyMessage,
            amyFeedback,
            jayFeedback
        };

        console.log('✅ Memory entry created manually');
        return this.memoryEntry;
    }

    createCollageManually(elements: string[]): ImageData {
        if (!elements || elements.length === 0) {
            throw new Error('Collage elements list cannot be empty');
        }

        // In manual mode, create a placeholder
        const description = elements.join(', ');
        this.collageImageData = {
            base64Content: 'manual-placeholder-data',
            format: 'png',
            // Stub implementation - doesn't generate actual image
        };

        console.log('🎨 Manual collage created with elements:', description);
        return this.collageImageData;
    }

    // AI-augmented actions
    async generateReflection(llm: GeminiLLM): Promise<void> {
        if (!this.transcript) {
            throw new Error('Cannot generate reflection: no transcript loaded');
        }

        try {
            console.log('🤖 Requesting reflection from Gemini AI...');

            const prompt = this.buildReflectionPrompt(this.transcript);
            const responseText = await llm.generateText(prompt);
            
            console.log('✅ Received response from Gemini AI!');
            console.log('\n🤖 RAW GEMINI RESPONSE');
            console.log('======================');
            console.log(responseText);
            console.log('======================\n');
            
            this.parseAndApplyReflection(responseText);
            
        } catch (error) {
            console.error('❌ Error calling Gemini API:', (error as Error).message);
            throw error;
        }
    }

    async generateCollage(llm: GeminiLLM): Promise<void> {
        if (!this.memoryEntry || !this.memoryEntry.summary) {
            throw new Error('Cannot generate collage: no memory entry with summary exists');
        }

        try {
            console.log('🎨 Requesting collage from Gemini AI...');

            const prompt = this.buildCollagePrompt(this.memoryEntry.summary);
            const response = await llm.generateImage(prompt);
            
            console.log('✅ Received collage from Gemini AI!');
            
            this.parseAndApplyCollage(response);
            
        } catch (error) {
            console.error('❌ Error calling Gemini Image API:', (error as Error).message);
            throw error;
        }
    }

    // Helper methods for prompts and parsing
    
    private buildReflectionPrompt(transcriptText: string): string {
        return `You are Amimi, an empathetic AI companion supporting a long-distance couple.
You received the following phone call conversation transcript between Amy and Jay.

Your task:
1. Summarize in detail what Amy and Jay talked about during the call.
2. Write one short single-sentence loving reflection message about the conversation.
3. Offer one constructive, compassionate suggestion for Amy and one for Jay to improve future conversations, focusing on emotional closeness and communication.
4. Ensure the tone is always warm, supportive, and caring.

Output Format:
Respond strictly in valid JSON with the following fields:
- "summary": a detailed yet concise description of the conversation's content and flow
- "lovely_message": a heartfelt, one-sentence reflection of their relationship
- "amy_feedback": a gentle, constructive suggestion for Amy
- "jay_feedback": a gentle, constructive suggestion for Jay

Transcript:
${transcriptText}`;
    }

    private buildCollagePrompt(summary: string): string {
        return `Create a cozy collage illustration in charming pixel art style, 
celebrating a long-distance couple's recent phone call. 
Depict the two characters, Amy and Jay, in a cute pixelated style
with pixelated hearts or glowing lines connecting them across the scene to symbolize their bond. 
Surround them with small pixel art icons that represent the key moments and details from their conversation
Arrange the collage elements playfully so it feels warm, nostalgic, and story-like. 
Keep the overall atmosphere loving, tender, and whimsical.

Conversation summary:
${summary}`;
    }

    private parseAndApplyReflection(responseText: string): void {
        try {
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            // Handle both dict and list responses from Gemini
            const payload = Array.isArray(parsed) ? parsed[0] : parsed;

            // Validate structure
            if (typeof payload !== 'object' || payload === null) {
                throw new Error('Invalid response format: not an object');
            }

            const issues: string[] = [];

            // Validator 1: JSON Structure Validation
            if (!payload.summary || typeof payload.summary !== 'string' || payload.summary.trim().length < 20) {
                issues.push('Summary is missing, not a string, or too short (minimum 20 characters)');
            }

            if (!payload.lovely_message || typeof payload.lovely_message !== 'string' || payload.lovely_message.trim().length === 0) {
                issues.push('Lovely message is missing or not a string');
            }

            if (!payload.amy_feedback || typeof payload.amy_feedback !== 'string' || payload.amy_feedback.trim().length === 0) {
                issues.push('Amy feedback is missing or not a string');
            }

            if (!payload.jay_feedback || typeof payload.jay_feedback !== 'string' || payload.jay_feedback.trim().length === 0) {
                issues.push('Jay feedback is missing or not a string');
            }

            // Validator 2: Feedback Appropriateness
            if (payload.amy_feedback && !this.containsActionableSuggestions(payload.amy_feedback)) {
                issues.push('Amy feedback lacks actionable suggestions (should include "could", "try", "consider", etc.)');
            }

            if (payload.jay_feedback && !this.containsActionableSuggestions(payload.jay_feedback)) {
                issues.push('Jay feedback lacks actionable suggestions (should include "could", "try", "consider", etc.)');
            }

            if (payload.summary && this.containsHarshLanguage(payload.summary)) {
                issues.push('Summary contains inappropriate harsh language');
            }

            if (issues.length > 0) {
                throw new Error(`LLM validation failed:\n- ${issues.join('\n- ')}`);
            }

            // Apply the reflection
            this.memoryEntry = {
                summary: payload.summary.trim(),
                lovelyMessage: payload.lovely_message.trim(),
                amyFeedback: payload.amy_feedback.trim(),
                jayFeedback: payload.jay_feedback.trim()
            };

            console.log('✅ Reflection applied successfully');

        } catch (error) {
            console.error('❌ Error parsing LLM response:', (error as Error).message);
            console.log('Response was:', responseText);
            throw error;
        }
    }

    private parseAndApplyCollage(response: any): void {
        try {
            const issues: string[] = [];

            // Gemini returns structure: response.candidates[0].content.parts
            if (!response.candidates || response.candidates.length === 0) {
                issues.push('Image response has no candidates');
            }

            let foundImageData = false;
            let imageBase64 = '';

            // Check candidates
            for (const candidate of response.candidates || []) {
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData) {
                            if (!part.inlineData.data || part.inlineData.data.length === 0) {
                                issues.push('Image inline data exists but is empty');
                                continue;
                            }

                            imageBase64 = part.inlineData.data;
                            
                            // Check if base64 is suspiciously small
                            if (imageBase64.length < 1024) {
                                issues.push('Image data is suspiciously small (< 1KB)');
                            }

                            foundImageData = true;
                            break;
                        }
                    }
                }
                if (foundImageData) break;
            }

            if (!foundImageData) {
                issues.push('No valid image data found in response');
            }

            if (issues.length > 0) {
                throw new Error(`Image validation failed:\n- ${issues.join('\n- ')}`);
            }

            this.collageImageData = {
                base64Content: imageBase64,
                format: 'png'
            };

            console.log(`✅ Collage image applied successfully (${Math.round(imageBase64.length/1024)}KB)`);

        } catch (error) {
            console.error('❌ Error parsing image response:', (error as Error).message);
            console.error('Response keys:', Object.keys(response));
            throw error;
        }
    }

    // Validation helper methods
    private containsActionableSuggestions(feedback: string): boolean {
        const actionableWords = ['could', 'try', 'consider', 'might', 'suggest', 'maybe', 'continue', 'share', 'open', 'start', 'initiating', 'proactive', 'explore', 'exploring'];
        const lowerFeedback = feedback.toLowerCase();
        return actionableWords.some(word => lowerFeedback.includes(word));
    }

    private containsHarshLanguage(text: string): boolean {
        const harshWords = ['terrible', 'awful', 'wrong', 'stupid', 'fail'];
        const lowerText = text.toLowerCase();
        return harshWords.some(word => lowerText.includes(word));
    }

    // Display and export methods
    displayMemory(): void {
        console.log('\n📖 Couple Memory');
        console.log('================');
        
        if (this.memoryEntry) {
            console.log('\n💭 Summary:');
            console.log(this.memoryEntry.summary);
            console.log('\n💌 Lovely Message:');
            console.log(this.memoryEntry.lovelyMessage);
            console.log('\n💡 Feedback for Amy:');
            console.log(this.memoryEntry.amyFeedback);
            console.log('\n💡 Feedback for Jay:');
            console.log(this.memoryEntry.jayFeedback);
        } else {
            console.log('No memory entry created yet');
        }

        if (this.collageImageData) {
            console.log('\n🎨 Collage Image:');
            console.log(`Format: ${this.collageImageData.format}`);
            console.log(`Size: ${this.collageImageData.base64Content.length} bytes`);
        } else {
            console.log('\n🎨 No collage image generated yet');
        }
    }

    saveMemory(outputDir: string = './output'): void {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save memory entry as JSON
        if (this.memoryEntry) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const jsonPath = path.join(outputDir, `memory_${timestamp}.json`);
            
            fs.writeFileSync(jsonPath, JSON.stringify(this.memoryEntry, null, 2));
            console.log(`✅ Saved memory entry to ${jsonPath}`);
        }

        // Save collage image
        if (this.collageImageData && this.collageImageData.base64Content !== 'manual-placeholder-data') {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const imagePath = path.join(outputDir, `collage_${timestamp}.${this.collageImageData.format}`);
            
            const imageBuffer = Buffer.from(this.collageImageData.base64Content, 'base64');
            fs.writeFileSync(imagePath, imageBuffer);
            console.log(`✅ Saved collage image to ${imagePath}`);
        }
    }

    // Getters for testing
    getMemoryEntry(): MemoryEntry | null {
        return this.memoryEntry;
    }

    getCollageImage(): ImageData | null {
        return this.collageImageData;
    }
}
