import React, { useState, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useLLM from '../hooks/useLLM';
import useIndexedDB from '../hooks/useIndexedDB';

const VoiceRecorder = ({ onRecordSaved, isLoading, setIsLoading }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [customExercises, setCustomExercises] = useState([]);
  const { isListening, startListening, stopListening } = useSpeechRecognition(setRecognizedText);
  const { processWithLLM } = useLLM();
  const { saveRecord, getCustomExercises } = useIndexedDB();

  // カスタム種目を読み込む
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const exercises = await getCustomExercises();
        setCustomExercises(exercises);
      } catch (error) {
        console.error('カスタム種目読み込みエラー:', error);
      }
    };
    loadCustomExercises();
  }, [getCustomExercises]);

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
      const structuredData = await processWithLLM(recognizedText, customExercises);
      
      // 日付が指定されている場合はその日付を使用、なければ現在日時
      let recordTimestamp = new Date();
      if (structuredData.date) {
        recordTimestamp = new Date(structuredData.date);
        // 時刻は現在時刻を使用（日付のみ変更）
        const now = new Date();
        recordTimestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      }
      
      const record = {
        id: crypto.randomUUID(),
        timestamp: recordTimestamp,
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