import React, { useState, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useLLM from '../hooks/useLLM';
import useIndexedDB from '../hooks/useIndexedDB';

const VoiceRecorder = ({ onRecordSaved, isLoading, setIsLoading }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [customExercises, setCustomExercises] = useState([]);
  const [message, setMessage] = useState(null); // エラーと成功メッセージ両方に対応
  const [messageType, setMessageType] = useState('error'); // 'error' or 'success'
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
      setMessage(null); // メッセージをクリア
      startListening();
    }
  };

  const handleSave = async () => {
    if (!recognizedText.trim()) {
      setMessage('入力テキストがありません。');
      setMessageType('error');
      alert('入力テキストがありません。');
      return;
    }

    setIsLoading(true);
    setMessage(null); // メッセージをクリア
    
    console.log('保存処理開始:', recognizedText);
    
    // 必ず結果を表示するため、処理開始をUI表示
    setMessage('処理中...');
    setMessageType('info');
    
    try {
      // まず入力テキストを検証
      const inputText = recognizedText.trim();
      console.log('入力テキスト:', inputText);
      
      // 無効な種目名を事前チェック
      const possibleExerciseName = extractPossibleExerciseNameFromInput(inputText);
      console.log('事前抽出された種目名:', possibleExerciseName);
      
      // test等の明らかに無効な英語単語のみブロック
      const invalidEnglishWords = /^(test|hello|world|ok|yes|no)(\d+.*)?$/i;
      
      if (invalidEnglishWords.test(inputText.trim())) {
        const errorMsg = `「${inputText.trim()}」というトレーニングメニューはありません。\n正しいメニュー名で再度お試しください。`;
        console.log('英語の無効単語を検出:', inputText.trim());
        setMessage(errorMsg);
        setMessageType('error');
        alert(errorMsg);
        return;
      }
      
      const structuredData = await processWithLLM(recognizedText, customExercises);
      console.log('LLM処理結果:', structuredData);
      
      // 種目が空の場合のみエラー（検証を緩和）
      if (!structuredData.exercises || structuredData.exercises.length === 0) {
        const errorMsg = `入力を認識できませんでした。\n例: スクワット10回、腕立て伏せ20回3セット`;
        console.log('種目が空のためエラーを発生:', errorMsg);
        setMessage(errorMsg);
        setMessageType('error');
        alert(errorMsg);
        return;
      }
      
      console.log('LLM処理成功:', structuredData.exercises);
      
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

      // データベースに保存
      const savedId = await saveRecord(record);
      console.log('データベース保存ID:', savedId);
      
      // 保存が実際に成功したことを確認
      if (savedId) {
        onRecordSaved(record);
        
        // 成功メッセージを表示（実際に保存されたデータを基に）
        const exerciseDetails = record.exercises.map(ex => 
          `${ex.name} ${ex.reps}回${ex.sets > 1 ? ` × ${ex.sets}セット` : ''}`
        ).join('、');
        const successMsg = `✅ 登録に成功しました！\n${exerciseDetails}`;
        console.log('保存成功:', successMsg);
        setMessage(successMsg);
        setMessageType('success');
        alert(successMsg);
        
        setRecognizedText('');
      } else {
        // 保存に失敗した場合
        const errorMsg = `❌ データベースへの保存に失敗しました\n「${possibleExerciseName}」の登録を完了できませんでした`;
        console.log('データベース保存失敗:', errorMsg);
        setMessage(errorMsg);
        setMessageType('error');
        alert(errorMsg);
      }
    } catch (error) {
      console.error('記録保存エラー:', error);
      console.error('エラーメッセージ:', error.message);
      
      // エラーメッセージを表示（ユーザーフレンドリーに）
      const errorMessage = error.message || '登録に失敗しました。\n再度お試しください。';
      
      console.log('設定するエラーメッセージ:', errorMessage);
      setMessage(errorMessage);
      setMessageType('error');
      
      // 確実に表示するためalertも使用
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('処理完了');
    }
  };

  // 入力テキストから種目名を抽出する関数（コンポーネント内で定義）
  const extractPossibleExerciseNameFromInput = (text) => {
    const patterns = [
      /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+回/,
      /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+セット/,
      /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+分/,
      /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+秒/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    const words = text.trim().split(/\s+/);
    return words[0] || 'unknown';
  };

  const handleClear = () => {
    setRecognizedText('');
    setMessage(null); // メッセージもクリア
  };

  const handleMessageClose = () => {
    setMessage(null);
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

      {/* メッセージ表示（成功・エラー・情報） */}
      {message && (
        <div className={`message ${messageType}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === 'success' ? '✅' : messageType === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="message-text">
              {message.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <button className="message-close" onClick={handleMessageClose}>
              ✖
            </button>
          </div>
        </div>
      )}

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