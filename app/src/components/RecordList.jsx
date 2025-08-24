import React from 'react';
import RecordItem from './RecordItem';

const RecordList = ({ records, onDelete, workoutMode }) => {
  if (records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
        まだ記録がありません。音声で記録を追加してください。
      </div>
    );
  }

  return (
    <div>
      {records.map(record => (
        <RecordItem 
          key={record.id} 
          record={record} 
          onDelete={onDelete}
          workoutMode={workoutMode}
        />
      ))}
    </div>
  );
};

export default RecordList;