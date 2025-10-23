// Speech synthesis utility for browser-based text-to-speech
export function speakText(text: string): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        console.warn('Speech synthesis not available in server-side environment');
        return;
    }

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported in this browser');
        return;
    }

    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Natural') ||
            voice.name.includes('Enhanced') ||
            voice.lang.startsWith('en')
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Configure speech settings
        utterance.rate = 0.9; // Slightly slower than default
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 0.8; // Slightly lower volume

        // Speak the text
        window.speechSynthesis.speak(utterance);

        console.log('Speech synthesis started:', text.substring(0, 50) + '...');

    } catch (error) {
        console.error('Error with speech synthesis:', error);
    }
}

// Stop any ongoing speech
export function stopSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

// Check if speech synthesis is available
export function isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
} 