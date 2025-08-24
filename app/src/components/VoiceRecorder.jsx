import React, { useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useLLM from '../hooks/useLLM';
import useIndexedDB from '../hooks/useIndexedDB';

const VoiceRecorder = ({ onRecordSaved, isLoading, setIsLoading, workoutMode }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const { isListening, startListening, stopListening } = useSpeechRecognition(setRecognizedText);
  const { processWithLLM } = useLLM();
  const { saveRecord } = useIndexedDB();

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      setRecognizedText('');
      startListening();
    }
  };

  const handleSave = async () => {
    if (!recognizedText.trim()) return;

    setIsLoading(true);
    try {
      const structuredData = await processWithLLM(recognizedText, workoutMode);
      
      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        raw_input: recognizedText,
        exercises: structuredData.exercises || [],
        created_at: new Date(),
        updated_at: new Date()
      };

      await saveRecord(record);
      onRecordSaved(record);
      setRecognizedText('');
    } catch (error) {
      console.error('記録保存エラー:', error);
      alert('記録の保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRecognizedText('');
  };

  return (
    <div className="voice-section">
      <button 
        className={`record-button ${isListening ? 'recording' : ''}`}
        onClick={handleRecord}
        disabled={isLoading}
      >
        🎤 {isListening ? '録音中...' : '録音開始'}
      </button>

      {recognizedText && (
        <>
          <div className="recognized-text">
            <strong>認識テキスト:</strong>
            <p>{recognizedText}</p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleClear}
              disabled={isLoading}
            >
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;