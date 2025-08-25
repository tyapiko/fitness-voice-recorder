import React, { useState, useEffect } from 'react';
import TabNavigation from './components/TabNavigation';
import RecordTab from './components/RecordTab';
import ProgressTab from './components/ProgressTab';
import HistoryTab from './components/HistoryTab';
import useIndexedDB from './hooks/useIndexedDB';

function App() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('record');
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'record':
        return (
          <RecordTab
            onRecordSaved={addRecord}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            todayRecords={getTodayRecords()}
          />
        );
      case 'progress':
        return <ProgressTab records={records} />;
      case 'history':
        return <HistoryTab records={records} onDelete={deleteRecord} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>WorkoutVoice</h1>
        <p>音声で自重トレーニング記録を簡単に</p>
      </header>

      <main className="app-main">
        {renderActiveTab()}
      </main>

      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}

export default App;