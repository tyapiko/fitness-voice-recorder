import React from 'react';

const RecordItem = ({ record, onDelete }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('この記録を削除しますか？')) {
      onDelete(record.id);
    }
  };

  const getExerciseEmoji = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    if (name.includes('ベンチ') || name.includes('bench')) return '🏋️‍♀️';
    if (name.includes('スクワット') || name.includes('squat')) return '🦵';
    if (name.includes('デッドリフト') || name.includes('deadlift')) return '💪';
    if (name.includes('腹筋') || name.includes('abs')) return '🔥';
    if (name.includes('腕立て') || name.includes('push')) return '💥';
    if (name.includes('ランニング') || name.includes('run')) return '🏃‍♂️';
    return '💪';
  };

  const totalVolume = record.exercises.reduce((sum, ex) => sum + (ex.volume || 0), 0);

  return (
    <div className="record-item-enhanced">
      <div className="record-header">
        <div className="record-info">
          <span className="record-time">⏰ {formatTime(record.timestamp)}</span>
          <span className="total-volume-badge">📊 合計: {totalVolume}kg</span>
        </div>
        <button className="delete-btn" onClick={handleDelete}>
          🗑️
        </button>
      </div>
      
      <div className="exercise-grid">
        {record.exercises.map((exercise, index) => (
          <div key={index} className="exercise-card">
            <div className="exercise-header">
              <span className="exercise-emoji">{getExerciseEmoji(exercise.name)}</span>
              <strong className="exercise-name">{exercise.name}</strong>
            </div>
            <div className="exercise-stats">
              {exercise.weight > 0 && (
                <div className="stat-item">
                  <span className="stat-label">重量</span>
                  <span className="stat-value">{exercise.weight}kg</span>
                </div>
              )}
              {exercise.reps > 0 && (
                <div className="stat-item">
                  <span className="stat-label">回数</span>
                  <span className="stat-value">{exercise.reps}回</span>
                </div>
              )}
              {exercise.sets > 0 && (
                <div className="stat-item">
                  <span className="stat-label">セット</span>
                  <span className="stat-value">{exercise.sets}セット</span>
                </div>
              )}
              {exercise.volume > 0 && (
                <div className="stat-item volume-highlight">
                  <span className="stat-label">ボリューム</span>
                  <span className="stat-value">{exercise.volume}kg</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {record.raw_input && (
        <div className="raw-input">
          💬 「{record.raw_input}」
        </div>
      )}
    </div>
  );
};

export default RecordItem;