import React from 'react';

const StatsOverview = ({ records }) => {
  const today = new Date().toDateString();
  const todayRecords = records.filter(record => 
    new Date(record.timestamp).toDateString() === today
  );

  // 今日の統計
  const todayStats = todayRecords.reduce((stats, record) => {
    record.exercises.forEach(exercise => {
      stats.totalVolume += exercise.volume || 0;
      stats.totalSets += exercise.sets || 0;
      stats.totalReps += exercise.reps || 0;
      stats.exerciseCount += 1;
      
      // 種目別統計
      if (!stats.exerciseTypes[exercise.name]) {
        stats.exerciseTypes[exercise.name] = {
          count: 0,
          volume: 0,
          emoji: getExerciseEmoji(exercise.name)
        };
      }
      stats.exerciseTypes[exercise.name].count += 1;
      stats.exerciseTypes[exercise.name].volume += exercise.volume || 0;
    });
    return stats;
  }, {
    totalVolume: 0,
    totalSets: 0,
    totalReps: 0,
    exerciseCount: 0,
    exerciseTypes: {}
  });

  // 週間統計（過去7日）
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekRecords = records.filter(record => 
    new Date(record.timestamp) >= weekAgo
  );

  const weekVolume = weekRecords.reduce((sum, record) => 
    sum + record.exercises.reduce((exerciseSum, ex) => exerciseSum + (ex.volume || 0), 0), 0
  );

  const workoutDays = new Set(weekRecords.map(record => 
    new Date(record.timestamp).toDateString()
  )).size;

  function getExerciseEmoji(exerciseName) {
    const name = exerciseName.toLowerCase();
    if (name.includes('ベンチ') || name.includes('bench')) return '🏋️‍♀️';
    if (name.includes('スクワット') || name.includes('squat')) return '🦵';
    if (name.includes('デッドリフト') || name.includes('deadlift')) return '💪';
    if (name.includes('腹筋') || name.includes('abs')) return '🔥';
    if (name.includes('腕立て') || name.includes('push')) return '💥';
    return '💪';
  }

  return (
    <div className="stats-overview">
      <h3>📊 トレーニング統計</h3>
      
      {/* 今日の統計 */}
      <div className="stats-section">
        <h4>🏃‍♂️ 今日の実績</h4>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">🏋️</div>
            <div className="stat-info">
              <div className="stat-number">{todayStats.totalVolume}</div>
              <div className="stat-label">総ボリューム (kg)</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <div className="stat-number">{todayStats.exerciseCount}</div>
              <div className="stat-label">実施種目数</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔢</div>
            <div className="stat-info">
              <div className="stat-number">{todayStats.totalSets}</div>
              <div className="stat-label">総セット数</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔁</div>
            <div className="stat-info">
              <div className="stat-number">{todayStats.totalReps}</div>
              <div className="stat-label">総レップ数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 種目別統計 */}
      {Object.keys(todayStats.exerciseTypes).length > 0 && (
        <div className="stats-section">
          <h4>🎯 今日の種目別実績</h4>
          <div className="exercise-types-grid">
            {Object.entries(todayStats.exerciseTypes).map(([name, data]) => (
              <div key={name} className="exercise-type-card">
                <div className="exercise-type-header">
                  <span className="exercise-emoji">{data.emoji}</span>
                  <span className="exercise-name">{name}</span>
                </div>
                <div className="exercise-type-stats">
                  <span className="type-count">{data.count}回実施</span>
                  <span className="type-volume">{data.volume}kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 週間統計 */}
      <div className="stats-section">
        <h4>📈 週間実績</h4>
        <div className="week-stats">
          <div className="week-stat-item">
            <span className="week-stat-label">トレーニング日数</span>
            <span className="week-stat-value">{workoutDays} / 7日</span>
          </div>
          <div className="week-stat-item">
            <span className="week-stat-label">週間総ボリューム</span>
            <span className="week-stat-value">{weekVolume}kg</span>
          </div>
          <div className="week-stat-item">
            <span className="week-stat-label">平均/日</span>
            <span className="week-stat-value">{workoutDays > 0 ? Math.round(weekVolume / workoutDays) : 0}kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;