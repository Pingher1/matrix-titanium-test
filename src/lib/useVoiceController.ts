import { useEffect, useState } from "react";

export function useVoiceController() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            // Default to a good English voice if available (e.g., Samantha on Mac)
            const defaultVoice = availableVoices.find(v => v.name.includes("Samantha") || v.name.includes("Google US English")) || availableVoices[0];
            setSelectedVoice(defaultVoice);
        };

        // Some browsers load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }, []);

    const speak = (text: string) => {
        if (!isEnabled || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        isEnabled,
        setIsEnabled,
        speak,
        stop,
        isSpeaking
    };
}
