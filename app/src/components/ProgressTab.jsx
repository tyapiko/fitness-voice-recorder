import React, { useState } from 'react';

const ProgressTab = ({ records }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // 期間に基づいてレコードをフィルタリング
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
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
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return records.filter(record => 
      new Date(record.timestamp) >= startDate
    );
  };

  // ストリーク（連続記録日数）を計算
  const calculateStreak = () => {
    const sortedDates = [...new Set(records.map(record => 
      new Date(record.timestamp).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const recordDate = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (recordDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // 週間データを生成
  const generateWeeklyData = () => {
    const filteredRecords = getFilteredRecords();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const dayRecords = filteredRecords.filter(record => 
        new Date(record.timestamp).toDateString() === dateString
      );
      
      const totalReps = dayRecords.reduce((sum, record) => 
        sum + record.exercises.reduce((exerciseSum, ex) => 
          exerciseSum + (ex.reps || 0), 0
        ), 0
      );
      
      weekData.push({
        date: date.getDate(),
        dayName: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        reps: totalReps,
        hasRecord: dayRecords.length > 0
      });
    }
    
    return weekData;
  };

  // 人気種目TOP5を計算
  const getTopExercises = () => {
    const filteredRecords = getFilteredRecords();
    const exerciseStats = {};
    
    filteredRecords.forEach(record => {
      record.exercises.forEach(exercise => {
        if (!exerciseStats[exercise.name]) {
          exerciseStats[exercise.name] = {
            name: exercise.name,
            totalReps: 0,
            sessions: 0
          };
        }
        exerciseStats[exercise.name].totalReps += exercise.reps || 0;
        exerciseStats[exercise.name].sessions += 1;
      });
    });
    
    return Object.values(exerciseStats)
      .sort((a, b) => b.totalReps - a.totalReps)
      .slice(0, 5);
  };

  const streak = calculateStreak();
  const weekData = generateWeeklyData();
  const topExercises = getTopExercises();
  const maxReps = Math.max(...weekData.map(d => d.reps), 1);

  return (
    <div className="progress-tab">
      {/* ヘッダー統計 */}
      <div className="progress-header">
        <div className="streak-card">
          <div className="streak-number">{streak}</div>
          <div className="streak-label">日連続記録中 🔥</div>
        </div>
      </div>

      {/* 期間選択 */}
      <div className="period-selector-compact">
        <button 
          className={`period-btn-compact ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('week')}
        >
          1週間
        </button>
        <button 
          className={`period-btn-compact ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          1ヶ月
        </button>
        <button 
          className={`period-btn-compact ${selectedPeriod === '3months' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('3months')}
        >
          3ヶ月
        </button>
      </div>

      {/* 週間グラフ */}
      <div className="weekly-chart">
        <h3>週間アクティビティ</h3>
        <div className="chart-container">
          {weekData.map((day, index) => (
            <div key={index} className="chart-day">
              <div className="chart-bar-container">
                <div 
                  className={`chart-bar ${day.hasRecord ? 'has-record' : ''}`}
                  style={{ 
                    height: `${Math.max((day.reps / maxReps) * 100, 4)}%`
                  }}
                >
                  {day.reps > 0 && (
                    <span className="chart-value">{day.reps}</span>
                  )}
                </div>
              </div>
              <div className="chart-label">
                <div className="chart-day-name">{day.dayName}</div>
                <div className="chart-day-date">{day.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 人気種目 */}
      <div className="top-exercises">
        <h3>よくやる種目 TOP5</h3>
        <div className="progress-table-container">
          <table className="progress-table">
            <thead>
              <tr>
                <th>順位</th>
                <th>種目名</th>
                <th>重量</th>
                <th>合計回数</th>
                <th>セッション数</th>
                <th>総合計</th>
              </tr>
            </thead>
            <tbody>
              {topExercises.map((exercise, index) => {
                // 重量を取得（最初のレコードから）
                const exerciseWeight = getFilteredRecords()
                  .flatMap(record => record.exercises)
                  .find(ex => ex.name === exercise.name)?.weight || 0;
                
                const totalVolume = exerciseWeight > 0 
                  ? exerciseWeight * exercise.totalReps
                  : exercise.totalReps;

                return (
                  <tr key={exercise.name}>
                    <td className="rank-cell">#{index + 1}</td>
                    <td className="exercise-name-cell">{exercise.name}</td>
                    <td className="weight-cell">
                      {exerciseWeight > 0 ? `${exerciseWeight}kg` : '-'}
                    </td>
                    <td className="reps-cell">{exercise.totalReps}回</td>
                    <td className="sessions-cell">{exercise.sessions}回</td>
                    <td className="total-cell">
                      {exerciseWeight > 0 ? `${totalVolume}kg` : `${totalVolume}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* データがない場合 */}
      {records.length === 0 && (
        <div className="no-progress-data">
          <div className="no-data-icon">📊</div>
          <h3>まだ記録がありません</h3>
          <p>トレーニングを記録して進捗を確認しましょう！</p>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;