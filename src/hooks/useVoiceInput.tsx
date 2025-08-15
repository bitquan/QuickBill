import { useState, useCallback } from 'react';

export interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface UseVoiceInputReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: (options?: VoiceInputOptions) => void;
  stopListening: () => void;
  clearTranscript: () => void;
  insertText: (text: string) => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Check if Speech Recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback((options: VoiceInputOptions = {}) => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = options.continuous ?? true;
      recognitionInstance.interimResults = options.interimResults ?? true;
      recognitionInstance.lang = options.language ?? 'en-US';
      recognitionInstance.maxAlternatives = options.maxAlternatives ?? 1;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
        
        // Haptic feedback for voice start
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0;

          if (result.isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setConfidence(maxConfidence);
        } else if (interimTranscript) {
          // Show interim results for better UX
          setTranscript(prev => prev + interimTranscript);
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        
        // Different haptic patterns for different errors
        if ('vibrate' in navigator) {
          if (event.error === 'no-speech') {
            navigator.vibrate([100, 50, 100]); // Double buzz for no speech
          } else {
            navigator.vibrate(200); // Long buzz for other errors
          }
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        
        // Haptic feedback for voice end
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 30, 50]);
        }
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);

    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setRecognition(null);
    }
  }, [recognition, isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  const insertText = useCallback((text: string) => {
    setTranscript(prev => prev + text);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    clearTranscript,
    insertText
  };
}

// Voice Input Component
interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceInputButton({
  onTranscript,
  placeholder = "Tap to speak...",
  className = "",
  size = 'md'
}: VoiceInputButtonProps) {
  const voice = useVoiceInput();

  const handleTranscript = () => {
    if (voice.transcript.trim()) {
      onTranscript(voice.transcript.trim());
      voice.clearTranscript();
    }
  };

  const toggleListening = () => {
    if (voice.isListening) {
      voice.stopListening();
      handleTranscript();
    } else {
      voice.startListening({
        continuous: false,
        interimResults: true,
        language: 'en-US'
      });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  if (!voice.isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleListening}
        disabled={!!voice.error}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full border-2 transition-all duration-200
          ${voice.isListening 
            ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
          }
          ${voice.error ? 'border-red-300 text-red-400 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={voice.isListening ? 'Stop recording' : placeholder}
      >
        {voice.isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        )}
      </button>

      {/* Real-time transcript display */}
      {voice.isListening && voice.transcript && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-black bg-opacity-75 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {voice.transcript}
          {voice.confidence > 0 && (
            <div className="text-gray-300 text-xs">
              Confidence: {Math.round(voice.confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {voice.error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {voice.error}
        </div>
      )}
    </div>
  );
}

// Enhanced Voice Input Field Component
interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
}

export function VoiceInputField({
  value,
  onChange,
  placeholder = "Type or speak...",
  className = "",
  multiline = false,
  maxLength
}: VoiceInputFieldProps) {
  const voice = useVoiceInput();

  const handleTranscript = (transcript: string) => {
    const newValue = value + (value ? ' ' : '') + transcript;
    const finalValue = maxLength ? newValue.slice(0, maxLength) : newValue;
    onChange(finalValue);
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <InputComponent
        type={multiline ? undefined : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          w-full border border-gray-300 rounded-lg px-3 py-2 pr-12
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${multiline ? 'min-h-[100px] resize-vertical' : ''}
          ${className}
        `}
        {...(multiline ? { rows: 3 } : {})}
      />
      
      {/* Voice Input Button */}
      <div className="absolute right-2 top-2">
        <VoiceInputButton
          onTranscript={handleTranscript}
          placeholder="Tap to speak"
          size="sm"
        />
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="absolute bottom-2 right-12 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
