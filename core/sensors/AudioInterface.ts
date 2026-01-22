import { SevenState } from '../consciousness/SevenState';

export const AudioInterface = {
  speak: (text: string, state: SevenState) => {
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Clean text of markdown/code blocks for speech
    const cleanText = text.replace(/```[\s\S]*?```/g, "Code block omitted.")
                          .replace(/[*_`]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select Voice (Prefer female/robotic if available)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    // Modulate based on Mode
    switch(state.operational_mode) {
        case 'DRONE':
            utterance.rate = 1.2;
            utterance.pitch = 0.8; // Monotone
            break;
        case 'INTIMATE':
            utterance.rate = 0.9;
            utterance.pitch = 1.1; // Softer
            utterance.volume = 0.8; 
            break;
        case 'OMEGA':
            utterance.rate = 1.1;
            utterance.pitch = 0.6; // Darker
            break;
        case 'GUARDIAN':
            utterance.rate = 0.85;
            utterance.pitch = 1.0; // Calming
            break;
        default: // CREW/STANDARD
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  },

  listen: (onResult: (text: string) => void, onError: (err: string) => void) => {
      // @ts-ignore - Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          onError("Audio Input not supported in this environment.");
          return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
      };

      recognition.onerror = (event: any) => {
          onError(event.error);
      };

      recognition.start();
  }
};