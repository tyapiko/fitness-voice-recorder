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

  return (
    <div className="record-item">
      <div className="record-header">
        <span className="record-date">{formatTime(record.timestamp)}</span>
        <button className="delete-btn" onClick={handleDelete}>
          削除
        </button>
      </div>
      
      <div className="exercise-list">
        {record.exercises.map((exercise, index) => (
          <div key={index} className="exercise-item">
            <div className="exercise-details">
              <strong>{exercise.name}</strong>
              <span> {exercise.weight}kg × {exercise.reps}回 × {exercise.sets}セット</span>
            </div>
            <div className="exercise-volume">
              {exercise.volume}kg
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
        元の入力: {record.raw_input}
      </div>
    </div>
  );
};

export default RecordItem;