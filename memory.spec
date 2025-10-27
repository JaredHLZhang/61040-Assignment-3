<concept_spec>
concept CoupleMemory

purpose
    help long-distance couples document and reflect on their daily conversations
    by creating visual memories of their shared moments

principle
    after a conversation transcript, the couple can manually create a memory entry
    with summary, reflection message, and feedback for each person;
    they can also manually specify elements to include in a visual collage.
    Optionally, an AI can auto-generate the reflection and collage from the transcript.

state
    a Transcript with
        text String
        
    a Reflection with
        summary String
        lovelyMessage String
        amyFeedback String
        jayFeedback String
        
    an ImageData with
        base64Content String
        format String // "png", "jpg", etc.

    invariants
        summary is non-empty if reflection exists
        lovelyMessage, amyFeedback, jayFeedback are all non-empty strings
        imageData is valid base64 if collage exists

actions
    loadTranscript(text: String)
        requires text is non-empty
        effect sets transcript to text
    
    createMemoryManually(
        summary: String,
        lovelyMessage: String,
        amyFeedback: String,
        jayFeedback: String
    ): Reflection
        requires all parameters are non-empty strings
        effect creates new memory entry with provided content
    
    createCollageManually(elements: String[]): ImageData
        requires elements is non-empty list of description strings
        effect creates placeholder/stub collage (manual mode doesn't generate actual images)
    
    async generateReflection(llm: GeminiLLM)
        requires transcript is set and non-empty
        effect uses llm to generate reflection from transcript, creates memory entry
    
    async generateCollage(llm: GeminiLLM)
        requires reflection exists with non-empty summary
        effect uses llm to generate collage image from summary
    
    displayMemory(): void
        effect prints reflection and collage info to console
    
    saveMemory(filename: String): void
        effect saves reflection to JSON file and collage to image file

notes
    The original concept allows manual creation of memories without AI.
    The AI augmentation adds automatic generation but preserves the manual workflow.
</concept_spec>
