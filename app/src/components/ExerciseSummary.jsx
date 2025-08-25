import React from 'react';

const ExerciseSummary = ({ records, workoutMode }) => {
  if (records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
        まだ記録がありません。音声で記録を追加してください。
      </div>
    );
  }

  // 日付別・種目別に統計を集計
  const aggregateByExercise = (records) => {
    const exerciseStats = {};

    records.forEach(record => {
      const date = new Date(record.timestamp).toDateString();
      
      record.exercises.forEach(exercise => {
        const exerciseName = exercise.name;
        
        if (!exerciseStats[exerciseName]) {
          exerciseStats[exerciseName] = {};
        }
        
        if (!exerciseStats[exerciseName][date]) {
          exerciseStats[exerciseName][date] = {
            totalReps: 0,
            totalSets: 0,
            totalWeight: 0,
            totalVolume: 0,
            sessions: 0
          };
        }
        
        exerciseStats[exerciseName][date].totalReps += exercise.reps || 0;
        exerciseStats[exerciseName][date].totalSets += exercise.sets || 0;
        exerciseStats[exerciseName][date].totalWeight += exercise.weight || 0;
        exerciseStats[exerciseName][date].totalVolume += exercise.volume || 0;
        exerciseStats[exerciseName][date].sessions += 1;
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

  const exerciseStats = aggregateByExercise(records);

  return (
    <div className="exercise-summary">
      {Object.entries(exerciseStats).map(([exerciseName, dateStats]) => {
        const sortedDates = Object.keys(dateStats).sort((a, b) => new Date(b) - new Date(a));
        const recentDates = sortedDates.slice(0, 7); // 最新7日分

        return (
          <div key={exerciseName} className="exercise-section">
            <h3 className="exercise-title">
              {exerciseName}
            </h3>
            
            <div className="exercise-timeline">
              {recentDates.map(date => {
                const stats = dateStats[date];
                return (
                  <div key={date} className="timeline-item">
                    <div className="timeline-date">
                      {formatDate(date)}
                    </div>
                    <div className="timeline-stats">
                      {workoutMode === 'gym' && stats.totalWeight > 0 && (
                        <span className="stat-item">
                          {stats.totalWeight}kg
                        </span>
                      )}
                      <span className="stat-item">
                        {stats.totalReps}回
                      </span>
                      <span className="stat-item">
                        {stats.totalSets}セット
                      </span>
                      <span className="stat-total">
                        = {workoutMode === 'gym' ? `${stats.totalVolume}kg` : `${stats.totalVolume}回`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {sortedDates.length > 7 && (
              <div className="more-dates-note">
                他 {sortedDates.length - 7} 日の記録
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExerciseSummary;