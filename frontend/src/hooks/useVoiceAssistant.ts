import { useState, useEffect, useRef, useCallback } from 'react';
import { AssistantState } from '../types';

interface UseVoiceAssistantProps {
  onTranscriptReceived?: (transcript: string) => void;
  language?: string;
}

export function useVoiceAssistant({ onTranscriptReceived, language = 'uz-UZ' }: UseVoiceAssistantProps = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [wakeWordActive, setWakeWordActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Initialize Speech Synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // O'zbek yoki mos ovozni tanlash
      if (voices.length > 0 && !selectedVoiceURI) {
        const uzVoice = voices.find((v) => v.lang.toLowerCase().includes('uz'));
        const fallbackVoice = voices.find((v) => v.lang.toLowerCase().includes('tr') || v.lang.toLowerCase().includes('ru') || v.lang.toLowerCase().includes('en'));
        setSelectedVoiceURI(uzVoice?.voiceURI || fallbackVoice?.voiceURI || voices[0].voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceURI]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        if (!isSpeakingRef.current) {
          setAssistantState('listening');
        }
      };

      recognition.onresult = (event: any) => {
        // Agar yordamchi o'zi gapirayotgan bo'lsa, o'z ovozini qayta yozib olishdan himoya!
        if (isSpeakingRef.current) return;

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        setTranscript(currentText);

        if (finalTranscript.trim()) {
          const text = finalTranscript.trim();
          // Wake word tekshiruvi (agar yoqilgan bo'lsa)
          if (wakeWordActive) {
            const low = text.toLowerCase();
            if (low.includes('jarvis') || low.includes('salom jarvis')) {
              const cleanText = text.replace(/salom jarvis|jarvis/gi, '').trim();
              if (cleanText) {
                onTranscriptReceived?.(cleanText);
              } else {
                speakText("Eshitaman, Janob! Sizga qanday yordam bera olaman?");
              }
            }
          } else {
            onTranscriptReceived?.(text);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Ovozni aniqlash xatosi:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Mikrofon ruxsati berilmadi. Iltimos brauzerda mikrofonga ruxsat bering.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Agar foydalanuvchi hali to'xtatmagan bo'lsa va gapirmayotgan bo'lsa
        if (assistantState === 'listening' && !isSpeakingRef.current) {
          setAssistantState('idle');
        }
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      console.warn('SpeechRecognition yaratib bo\'lmadi:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage, wakeWordActive, onTranscriptReceived]);

  // Start listening
  const startListening = () => {
    setVoiceError(null);
    if (!speechSupported || !recognitionRef.current) {
      setVoiceError('Ushbu brauzerda ovozni aniqlash (Speech Recognition) qo\'llab-quvvatlanmaydi. Matnli xabarlardan foydalaning.');
      return;
    }
    try {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
      setIsListening(true);
      setAssistantState('listening');
    } catch (e) {
      // Agar allaqachon ishlayotgan bo'lsa
      console.log('Recognition allaqachon boshlangan');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAssistantState('idle');
    }
  };

  // Text-To-Speech
  const speakText = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    // Oldingi gaplashishni to'xtatish
    window.speechSynthesis.cancel();

    // Ovoz yozishni vaqtincha to'xtatish (o'zini transkript qilmaslik uchun)
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Ovozni tanlash
    if (selectedVoiceURI) {
      const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 0.95; // JARVIS biroz chuqur va futuristik tembrda

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setAssistantState('speaking');
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAssistantState('idle');
      // Gapirib bo'lgach, agar listening rejimida bo'lsa qayta boshlash
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAssistantState('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, selectedVoiceURI, availableVoices, isListening]);

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAssistantState('idle');
    }
  };

  return {
    isListening,
    isSpeaking,
    assistantState,
    setAssistantState,
    speechSupported,
    transcript,
    setTranscript,
    selectedLanguage,
    setSelectedLanguage,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    wakeWordActive,
    setWakeWordActive,
    isMuted,
    setIsMuted,
    voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}
