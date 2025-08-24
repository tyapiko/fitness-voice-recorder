import { useState, useRef, useCallback } from 'react';

const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('お使いのブラウザは音声認識をサポートしていません。Chrome または Firefox をお使いください。');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('音声認識エラー:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          alert('音声が認識されませんでした。もう一度お試しください。');
          break;
        case 'audio-capture':
          alert('マイクにアクセスできません。マイクの許可を確認してください。');
          break;
        case 'not-allowed':
          alert('マイクの使用が許可されていません。ブラウザの設定を確認してください。');
          break;
        default:
          alert('音声認識中にエラーが発生しました。');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening
  };
};

export default useSpeechRecognition;