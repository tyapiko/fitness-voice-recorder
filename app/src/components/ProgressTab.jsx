import React, { useState } from 'react';
import { EXERCISE_LIST, EXERCISE_CATEGORIES, calculateBodyPartStats, BODY_PART_LEVELS } from '../data/exerciseTypes.js';

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

  // 固定メニューベースの種目統計を計算
  const getExerciseStats = () => {
    const filteredRecords = getFilteredRecords();
    const exerciseStats = {};
    
    
    // 全ての固定メニューを初期化
    EXERCISE_LIST.forEach(exercise => {
      exerciseStats[exercise.name] = {
        ...exercise,
        totalReps: 0,
        totalSets: 0,
        sessions: 0,
        lastPerformed: null
      };
    });
    
    // 実際の記録データで統計を更新
    filteredRecords.forEach(record => {
      record.exercises.forEach(exercise => {
        if (exerciseStats[exercise.name]) {
          exerciseStats[exercise.name].totalReps += exercise.reps || 0;
          exerciseStats[exercise.name].totalSets += exercise.sets || 0;
          exerciseStats[exercise.name].sessions += 1;
          exerciseStats[exercise.name].lastPerformed = record.timestamp;
        }
      });
    });
    
    return Object.values(exerciseStats);
  };

  const streak = calculateStreak();
  
  // 安全にexerciseStatsを取得
  let exerciseStats = [];
  
  try {
    exerciseStats = getExerciseStats();
  } catch (error) {
    console.error('Exercise stats calculation error:', error);
    exerciseStats = [];
  }

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


      {/* 体の部位レベル表示 */}
      <div className="body-part-levels">
        <h3>体の部位レベル 🏆</h3>
        <div className="level-cards">
          {(() => {
            const bodyPartStats = calculateBodyPartStats(getFilteredRecords());
            return Object.entries(bodyPartStats).map(([bodyPart, stats]) => (
              <div key={bodyPart} className="level-card">
                <div className="level-header">
                  <span className="body-part-name">{bodyPart}</span>
                  <span className="level-badge" style={{ backgroundColor: stats.color }}>
                    Lv.{stats.level}
                  </span>
                </div>
                <div className="level-name" style={{ color: stats.color }}>
                  {stats.name}
                </div>
                <div className="level-stats">
                  <span className="total-reps">{stats.totalReps}回</span>
                  {stats.nextThreshold && (
                    <span className="next-level">
                      次のレベルまで {stats.nextThreshold - stats.totalReps}回
                    </span>
                  )}
                </div>
                {stats.nextThreshold && (
                  <div className="level-progress">
                    <div 
                      className="level-progress-fill" 
                      style={{ 
                        width: `${((stats.totalReps - BODY_PART_LEVELS[stats.level].threshold) / 
                          (stats.nextThreshold - BODY_PART_LEVELS[stats.level].threshold)) * 100}%`,
                        backgroundColor: stats.color 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 全種目の記録カード */}
      <div className="progress-exercises">
        <h3>全種目の記録 📊</h3>
        <div className="progress-exercise-grid">
          {EXERCISE_LIST.map(exercise => {
            const stats = exerciseStats.find(stat => stat.name === exercise.name);
            const hasData = stats && stats.totalReps > 0;
            const lastPerformed = (stats && stats.lastPerformed) 
              ? new Date(stats.lastPerformed).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
              : null;

            return (
              <div key={exercise.id} className={`progress-exercise-card ${hasData ? 'has-data' : 'no-data'}`}>
                <div className="progress-exercise-header">
                  <span className="progress-exercise-icon">{exercise.icon}</span>
                  <span className="progress-exercise-name">{exercise.name}</span>
                </div>
                <div className="progress-exercise-stats">
                  {hasData ? (
                    <>
                      <div className="stat-item">
                        <span className="stat-value">{stats.totalReps}</span>
                        <span className="stat-unit">{exercise.unit}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{stats.totalSets}</span>
                        <span className="stat-unit">セット</span>
                      </div>
                    </>
                  ) : (
                    <span className="no-data">記録なし</span>
                  )}
                </div>
              </div>
            );
          })}
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