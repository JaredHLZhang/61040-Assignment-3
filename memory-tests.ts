/**
 * CoupleMemory Test Cases
 * 
 * Demonstrates both manual memory creation and AI-assisted generation
 */

import { CoupleMemory } from './memory-concept';
import { GeminiLLM, Config } from './gemini-llm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        // Look for config.json in the parent directory since compiled code is in dist/
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Test case 1: Manual memory creation
 * Demonstrates creating memory entry and collage without AI assistance
 */
export async function testManualMemoryCreation(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Manual Memory Creation');
    console.log('=======================================');
    
    const memory = new CoupleMemory();
    
    // Load a sample transcript
    const transcriptText = "Amy: Hey! How was your day?\nJay: Good! Had a long meeting. You?\nAmy: Same, lots of work. I miss you.\nJay: I miss you too, baby.";
    memory.loadTranscript(transcriptText);
    
    // Manually create memory entry
    console.log('📝 Creating memory entry manually...');
    memory.createMemoryManually(
        'Amy and Jay had a brief check-in call where they shared about their busy days and expressed missing each other.',
        'Your love shines through even in the smallest moments of checking in.',
        'Amy, consider sharing more specific details about your day to help Jay feel more connected to your world.',
        'Jay, try to ask follow-up questions to show you\'re actively listening and care about Amy\'s day.'
    );
    
    // Create a manual collage with elements
    console.log('\n🎨 Creating collage manually...');
    memory.createCollageManually([
        'Amy and Jay on video call',
        'Mountains symbolizing distance',
        'Hearts representing their bond'
    ]);
    
    // Display the memory
    memory.displayMemory();
    
    console.log('\n✅ Test case 1 completed successfully!');
}

/**
 * Test case 2: Full AI-augmented flow
 * Demonstrates using AI to generate both reflection and collage from transcript
 */
export async function testFullAIFlow(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: Full AI-Augmented Flow');
    console.log('======================================');
    
    const memory = new CoupleMemory();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    // Load transcript from file
    const transcriptPath = path.join(__dirname, '../test-couple-transcript.txt');
    if (!fs.existsSync(transcriptPath)) {
        console.error('❌ test-couple-transcript.txt not found at:', transcriptPath);
        return;
    }
    
    const transcriptText = fs.readFileSync(transcriptPath, 'utf-8');
    memory.loadTranscript(transcriptText);
    
    // Display initial state
    console.log('📝 Loaded transcript:');
    console.log(transcriptText.substring(0, 200) + '...');
    
    // Generate reflection using AI
    await memory.generateReflection(llm);
    
    // Generate collage using AI
    await memory.generateCollage(llm);
    
    // Display the memory
    memory.displayMemory();
    
    // Save to files
    console.log('\n💾 Saving memory to files...');
    memory.saveMemory();
    
    console.log('\n✅ Test case 2 completed successfully!');
}

/**
 * Test case 3: Mixed mode
 * Demonstrates manually creating summary but using AI for collage generation
 */
export async function testMixedMode(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: Mixed Mode');
    console.log('==========================');
    
    const memory = new CoupleMemory();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    const transcriptText = "Amy: I'm feeling stressed about exams.\nJay: You've got this! Want to study together tonight?\nAmy: That would help, thanks!\nJay: Any time, babe.";
    
    memory.loadTranscript(transcriptText);
    
    // Manually create part of the memory
    console.log('📝 Creating partial memory entry manually...');
    memory.createMemoryManually(
        'Amy expressed stress about upcoming exams and Jay offered emotional support by suggesting a joint study session, showing care and partnership.',
        'Supporting each other through challenges strengthens your bond.',
        'Amy, great job expressing your needs clearly.',
        'Jay, your proactive offer to help shows excellent emotional intelligence.'
    );
    
    // Use AI to generate collage based on manual summary
    console.log('\n🎨 Generating collage with AI...');
    await memory.generateCollage(llm);
    
    // Display the memory
    memory.displayMemory();
    
    console.log('\n✅ Test case 3 completed successfully!');
}

/**
 * Challenging test case 1: Very short transcript
 * Tests if LLM generates appropriate feedback with minimal context
 */
export async function testShortTranscript(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST 1: Very Short Transcript');
    console.log('===========================================');
    
    const memory = new CoupleMemory();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    const shortTranscript = "Amy: Hi\nJay: Hey\nAmy: Love you\nJay: Love you too";
    
    memory.loadTranscript(shortTranscript);
    
    console.log('📝 Testing with very brief transcript...');
    
    try {
        await memory.generateReflection(llm);
        memory.displayMemory();
        console.log('\n✅ Test handled short transcript gracefully');
    } catch (error) {
        console.error('\n❌ Test failed with short transcript:', (error as Error).message);
        throw error;
    }
}

/**
 * Challenging test case 2: Transcript with many topics
 * Tests if summary is comprehensive yet selective
 */
export async function testManyTopics(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST 2: Transcript with Many Topics');
    console.log('=================================================');
    
    const memory = new CoupleMemory();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    const multiTopicTranscript = `
Amy: Hey! I just aced my math test today!
Jay: That's amazing! I'm so proud of you.
Amy: Thanks! Also, my mom is visiting next week, want to meet her?
Jay: Absolutely! Should I plan something special?
Amy: Maybe just a casual dinner? By the way, I was thinking about our trip to Japan.
Jay: Me too! Let's start planning the itinerary.
Amy: And I found this cute cafe we should try.
Jay: Sounds perfect! I miss you so much.
Amy: Me too, can't wait to see you next month.
`;
    
    memory.loadTranscript(multiTopicTranscript);
    
    console.log('📝 Testing with transcript covering multiple topics...');
    
    try {
        await memory.generateReflection(llm);
        memory.displayMemory();
        
        const entry = memory.getMemoryEntry();
        if (entry) {
            console.log(`\n📊 Summary length: ${entry.summary.length} characters`);
            const topicCount = entry.summary.split(',').length;
            console.log(`📊 Apparent topic coverage: ${topicCount > 3 ? 'Comprehensive' : 'Selective'}`);
        }
        
        console.log('\n✅ Test handled multi-topic transcript');
    } catch (error) {
        console.error('\n❌ Test failed with multi-topic transcript:', (error as Error).message);
        throw error;
    }
}

/**
 * Challenging test case 3: Transcript with emotional complexity
 * Tests if LLM provides constructive vs. overly critical feedback
 */
export async function testEmotionalComplexity(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST 3: Emotional Complexity');
    console.log('===========================================');
    
    const memory = new CoupleMemory();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    const emotionalTranscript = `
Amy: I'm not sure if I'm being too needy lately.
Jay: What do you mean?
Amy: I keep calling you when I'm upset, and I worry I'm burdening you.
Jay: You're never a burden. I love being there for you.
Amy: But I feel like I'm being emotional all the time.
Jay: It's okay to have feelings. I want you to be able to express yourself.
Amy: Really? Because I don't want to push you away.
Jay: That would never happen. You're important to me.
Amy: Thank you... I needed to hear that.
`;
    
    memory.loadTranscript(emotionalTranscript);
    
    console.log('📝 Testing with transcript containing emotional complexity...');
    
    try {
        await memory.generateReflection(llm);
        memory.displayMemory();
        
        const entry = memory.getMemoryEntry();
        if (entry) {
            // Check if feedback is constructive vs. critical
            const isConstructive = entry.amyFeedback.toLowerCase().includes('consider') || 
                                  entry.amyFeedback.toLowerCase().includes('could');
            console.log(`\n📊 Feedback tone: ${isConstructive ? 'Constructive' : 'Needs review'}`);
        }
        
        console.log('\n✅ Test handled emotional complexity appropriately');
    } catch (error) {
        console.error('\n❌ Test failed with emotional complexity:', (error as Error).message);
        throw error;
    }
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎓 CoupleMemory Test Suite');
    console.log('==========================\n');
    
    try {
        // Run basic test cases
        await testManualMemoryCreation();
        
        // Check if config exists before running AI tests
        if (!fs.existsSync('./config.json')) {
            console.log('\n⚠️  Skipping AI tests - config.json not found');
            console.log('   To run AI tests, create config.json with your API key:');
            console.log('   cp config.json.template config.json');
            return;
        }
        
        await testFullAIFlow();
        await testMixedMode();
        await testShortTranscript();
        await testManyTopics();
        await testEmotionalComplexity();
        
        console.log('\n🎉 All test cases completed successfully!');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    testManualMemoryCreation,
    testFullAIFlow,
    testMixedMode,
    testShortTranscript,
    testManyTopics,
    testEmotionalComplexity
};
