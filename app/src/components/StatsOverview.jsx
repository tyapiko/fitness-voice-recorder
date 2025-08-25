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
    <div className="stats-simple">
      <div className="today-summary">
        <div className="summary-item">
          <span className="summary-label">今日の合計</span>
          <span className="summary-value">
            {todayStats.totalVolume}回
          </span>
        </div>
        
        {workoutDays > 0 && (
          <div className="summary-item">
            <span className="summary-label">今週</span>
            <span className="summary-value">
              {workoutDays}日 / {weekVolume}回
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;