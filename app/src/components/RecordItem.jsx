import React from 'react';

const RecordItem = ({ record, onDelete, workoutMode = 'gym' }) => {
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

  return (
    <div className="record-item-simple">
      <div className="record-header">
        <span className="record-time">{formatTime(record.timestamp)}</span>
        <button className="delete-btn" onClick={handleDelete}>
          削除
        </button>
      </div>
      
      <div className="exercise-list">
        {record.exercises.map((exercise, index) => (
          <div key={index} className="exercise-simple">
            <div className="exercise-main">
              <strong className="exercise-name">{exercise.name}</strong>
              <span className="exercise-details">
                {workoutMode === 'gym' && exercise.weight > 0 && `${exercise.weight}kg`}
                {exercise.reps > 0 && ` ${workoutMode === 'gym' && exercise.weight > 0 ? '×' : ''} ${exercise.reps}回`}
                {exercise.sets > 0 && ` × ${exercise.sets}セット`}
              </span>
            </div>
            {exercise.volume > 0 && (
              <div className="exercise-volume">
                {workoutMode === 'gym' ? `${exercise.volume}kg` : `${exercise.volume}回`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordItem;