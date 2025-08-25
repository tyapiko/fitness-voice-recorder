import React, { useState } from 'react';

const TrainingMatrix = ({ records }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [periodFilter, setPeriodFilter] = useState('today'); // 'today', 'week', 'month', '3months', '6months', 'year', 'all'

  // 期間に基づいてレコードをフィルタリング
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate;
    
    switch (periodFilter) {
      case 'today':
        return records.filter(record => 
          new Date(record.timestamp).toDateString() === selectedDate
        );
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return records;
      default:
        return records.filter(record => 
          new Date(record.timestamp).toDateString() === selectedDate
        );
    }
    
    return records.filter(record => 
      new Date(record.timestamp) >= startDate
    );
  };

  // マトリックス用データを生成（自重トレーニング専用）
  const generateMatrix = (filteredRecords) => {
    const exerciseStats = {};
    
    filteredRecords.forEach(record => {
      record.exercises.forEach(exercise => {
        const name = exercise.name;
        if (!exerciseStats[name]) {
          exerciseStats[name] = {
            totalReps: 0,
            totalSets: 0,
            sessions: 0,
            lastDate: null
          };
        }
        
        exerciseStats[name].totalReps += exercise.reps || 0;
        exerciseStats[name].totalSets += exercise.sets || 0;
        exerciseStats[name].sessions += 1;
        
        const recordDate = new Date(record.timestamp);
        if (!exerciseStats[name].lastDate || recordDate > exerciseStats[name].lastDate) {
          exerciseStats[name].lastDate = recordDate;
        }
      });
    });
    
    return exerciseStats;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    }
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case 'today': return formatDate(selectedDate);
      case 'week': return '過去1週間';
      case 'month': return '過去1ヶ月';
      case '3months': return '過去3ヶ月';
      case '6months': return '過去6ヶ月';
      case 'year': return '過去1年';
      case 'all': return '全期間';
      default: return formatDate(selectedDate);
    }
  };

  const filteredRecords = getFilteredRecords();
  const matrixData = generateMatrix(filteredRecords);

  // 日付選択用の過去30日のオプションを生成
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toDateString();
      
      // この日付にレコードがあるかチェック
      const hasRecords = records.some(record => 
        new Date(record.timestamp).toDateString() === dateString
      );
      
      if (i === 0 || hasRecords) {
        dates.push({
          value: dateString,
          label: formatDate(dateString),
          hasRecords
        });
      }
    }
    return dates;
  };

  return (
    <div className="training-matrix">
      {/* 期間選択 */}
      <div className="matrix-controls">
        <div className="period-selector">
          <button 
            className={`period-btn ${periodFilter === 'today' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('today')}
          >
            日別
          </button>
          <button 
            className={`period-btn ${periodFilter === 'week' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('week')}
          >
            1週間
          </button>
          <button 
            className={`period-btn ${periodFilter === 'month' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('month')}
          >
            1ヶ月
          </button>
          <button 
            className={`period-btn ${periodFilter === '3months' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('3months')}
          >
            3ヶ月
          </button>
          <button 
            className={`period-btn ${periodFilter === '6months' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('6months')}
          >
            6ヶ月
          </button>
          <button 
            className={`period-btn ${periodFilter === 'year' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('year')}
          >
            1年
          </button>
          <button 
            className={`period-btn ${periodFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('all')}
          >
            全期間
          </button>
        </div>
        
        {/* 日付選択（日別モードの時のみ表示） */}
        {periodFilter === 'today' && (
          <div className="date-selector">
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-select"
            >
              {getDateOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* マトリックス表示 */}
      <div className="matrix-header">
        <h3>{getPeriodLabel()}のトレーニングマトリックス</h3>
      </div>

      {Object.keys(matrixData).length === 0 ? (
        <div className="no-data">
          この期間の記録がありません
        </div>
      ) : (
        <div className="matrix-compact-grid">
          {Object.entries(matrixData).map(([exerciseName, stats]) => (
            <div key={exerciseName} className="matrix-compact-card">
              <div className="exercise-name-compact">{exerciseName}</div>
              <div className="stats-compact">
                <span className="reps-compact">{stats.totalReps}回</span>
                <span className="sets-compact">{stats.totalSets}セット</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingMatrix;