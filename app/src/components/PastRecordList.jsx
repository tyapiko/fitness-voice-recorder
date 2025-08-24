import React from 'react';
import RecordItem from './RecordItem';

const PastRecordList = ({ records, onDelete, workoutMode }) => {
  if (records.length === 0) {
    return null;
  }

  // 日付別にグループ化
  const groupRecordsByDate = (records) => {
    const grouped = {};
    records.forEach(record => {
      const date = new Date(record.timestamp);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    }
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const groupedRecords = groupRecordsByDate(records);
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  // 最新の5日分のみ表示
  const recentDates = sortedDates.slice(0, 5);

  return (
    <div className="past-records">
      {recentDates.map(dateKey => (
        <div key={dateKey} className="date-group">
          <h3 className="date-header">{formatDate(dateKey)}</h3>
          <div className="date-records">
            {groupedRecords[dateKey].map(record => (
              <RecordItem
                key={record.id}
                record={record}
                onDelete={onDelete}
                workoutMode={workoutMode}
              />
            ))}
          </div>
        </div>
      ))}
      
      {sortedDates.length > 5 && (
        <div className="more-records-note">
          他 {sortedDates.length - 5} 日の記録があります
        </div>
      )}
    </div>
  );
};

export default PastRecordList;