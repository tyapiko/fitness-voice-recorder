import React, { useState, useEffect } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import RecordList from './components/RecordList';
import PastRecordList from './components/PastRecordList';
import StatsOverview from './components/StatsOverview';
import useIndexedDB from './hooks/useIndexedDB';

function App() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutMode, setWorkoutMode] = useState('gym'); // 'gym' or 'home'
  const { getRecords, deleteRecord: deleteFromDB, isInitialized } = useIndexedDB();

  useEffect(() => {
    const loadRecords = async () => {
      if (isInitialized) {
        try {
          const savedRecords = await getRecords();
          setRecords(savedRecords);
        } catch (error) {
          console.error('記録読み込みエラー:', error);
        }
      }
    };

    loadRecords();
  }, [isInitialized, getRecords]);

  const addRecord = (newRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  const deleteRecord = async (id) => {
    try {
      await deleteFromDB(id);
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (error) {
      console.error('記録削除エラー:', error);
      alert('記録の削除に失敗しました。');
    }
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return records.filter(record => 
      new Date(record.timestamp).toDateString() === today
    );
  };

  const getPastRecords = () => {
    const today = new Date().toDateString();
    return records.filter(record => 
      new Date(record.timestamp).toDateString() !== today
    );
  };

  // 日付別にグループ化
  const groupRecordsByDate = (records) => {
    const grouped = {};
    records.forEach(record => {
      const date = new Date(record.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    return grouped;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>WorkoutVoice</h1>
        <p>音声で筋トレ記録を簡単に</p>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${workoutMode === 'gym' ? 'active' : ''}`}
            onClick={() => setWorkoutMode('gym')}
          >
            ウェイトトレーニング
            <span className="mode-desc">ジム・重量あり</span>
          </button>
          <button 
            className={`mode-btn ${workoutMode === 'home' ? 'active' : ''}`}
            onClick={() => setWorkoutMode('home')}
          >
            自重トレーニング
            <span className="mode-desc">自宅・重量なし</span>
          </button>
        </div>
      </header>

      <VoiceRecorder 
        onRecordSaved={addRecord} 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        workoutMode={workoutMode}
      />

      {records.length > 0 && (
        <StatsOverview records={records} workoutMode={workoutMode} />
      )}

      <div className="records-section">
        <h2>本日の記録</h2>
        <RecordList 
          records={getTodayRecords()}
          onDelete={deleteRecord}
          workoutMode={workoutMode}
        />
      </div>

      {getPastRecords().length > 0 && (
        <div className="records-section">
          <h2>過去の記録</h2>
          <PastRecordList 
            records={getPastRecords()}
            onDelete={deleteRecord}
            workoutMode={workoutMode}
          />
        </div>
      )}
    </div>
  );
}

export default App;