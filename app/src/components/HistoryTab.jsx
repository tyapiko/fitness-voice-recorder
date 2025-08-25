import React, { useState } from 'react';

const HistoryTab = ({ records, onDelete }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // 月間カレンダーデータを生成
  const generateCalendarData = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 週の始まり（日曜日）から開始
    
    const calendarData = [];
    const recordsByDate = {};
    
    // レコードを日付別にグループ化
    records.forEach(record => {
      const dateString = new Date(record.timestamp).toDateString();
      if (!recordsByDate[dateString]) {
        recordsByDate[dateString] = [];
      }
      recordsByDate[dateString].push(record);
    });
    
    // カレンダーデータを生成
    for (let week = 0; week < 6; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        const dateString = currentDate.toDateString();
        const dayRecords = recordsByDate[dateString] || [];
        
        weekData.push({
          date: currentDate,
          records: dayRecords,
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: currentDate.toDateString() === new Date().toDateString()
        });
      }
      calendarData.push(weekData);
    }
    
    return calendarData;
  };

  // 選択された日の詳細レコードを取得
  const getSelectedDateRecords = () => {
    if (!selectedDate) return [];
    
    return records.filter(record => 
      new Date(record.timestamp).toDateString() === selectedDate.toDateString()
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // 月を変更
  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
    setSelectedDate(null);
  };

  const calendarData = generateCalendarData();
  const selectedDateRecords = getSelectedDateRecords();

  return (
    <div className="history-tab">
      {/* 月間ナビゲーション */}
      <div className="month-navigation">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          ←
        </button>
        <h2 className="month-title">
          {selectedMonth.getFullYear()}年 {selectedMonth.getMonth() + 1}月
        </h2>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          →
        </button>
      </div>

      {/* カレンダー */}
      <div className="calendar-container">
        <div className="calendar-header">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="calendar-header-day">{day}</div>
          ))}
        </div>
        
        <div className="calendar-body">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  className={`calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${
                    day.isToday ? 'today' : ''
                  } ${
                    selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                  } ${
                    day.records.length > 0 ? 'has-records' : ''
                  }`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span className="calendar-day-number">{day.date.getDate()}</span>
                  {day.records.length > 0 && (
                    <div className="calendar-day-indicator">
                      <span className="record-count">{day.records.length}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 選択された日の詳細 */}
      {selectedDate && (
        <div className="selected-date-details">
          <h3>
            {selectedDate.toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}の記録
          </h3>
          
          {selectedDateRecords.length > 0 ? (
            <div className="date-records">
              {/* 日付別の合計テーブル */}
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>種目名</th>
                      <th>重量</th>
                      <th>回数</th>
                      <th>セット数</th>
                      <th>合計</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // 種目別に集計
                      const exerciseMap = {};
                      const recordIds = [];
                      
                      selectedDateRecords.forEach(record => {
                        record.exercises.forEach(exercise => {
                          const key = exercise.name;
                          if (!exerciseMap[key]) {
                            exerciseMap[key] = {
                              name: exercise.name,
                              weight: exercise.weight || 0,
                              totalReps: 0,
                              totalSets: 0,
                              recordIds: []
                            };
                          }
                          exerciseMap[key].totalReps += exercise.reps || 0;
                          exerciseMap[key].totalSets += exercise.sets || 0;
                          if (!exerciseMap[key].recordIds.includes(record.id)) {
                            exerciseMap[key].recordIds.push(record.id);
                          }
                        });
                        recordIds.push(record.id);
                      });

                      return Object.values(exerciseMap).map((exercise, index) => (
                        <tr key={index}>
                          <td className="exercise-name-cell">{exercise.name}</td>
                          <td className="weight-cell">
                            {exercise.weight > 0 ? `${exercise.weight}kg` : '-'}
                          </td>
                          <td className="reps-cell">{exercise.totalReps}回</td>
                          <td className="sets-cell">{exercise.totalSets}セット</td>
                          <td className="total-cell">
                            {exercise.weight > 0 
                              ? `${exercise.weight * exercise.totalReps * exercise.totalSets}kg`
                              : `${exercise.totalReps * exercise.totalSets}`
                            }
                          </td>
                          <td className="action-cell">
                            <button 
                              className="delete-btn-table" 
                              onClick={() => {
                                // その種目に関連するすべてのレコードを削除
                                exercise.recordIds.forEach(id => onDelete(id));
                              }}
                              title="この種目の記録を削除"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              
              {/* 詳細な時系列記録 */}
              <div className="detailed-records">
                <h4>詳細記録</h4>
                {selectedDateRecords.map(record => (
                  <div key={record.id} className="history-record-item">
                    <div className="record-header">
                      <span className="record-time">
                        {new Date(record.timestamp).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button 
                        className="delete-btn-small" 
                        onClick={() => onDelete(record.id)}
                        title="削除"
                      >
                        ×
                      </button>
                    </div>
                    <div className="record-exercises">
                      {record.exercises.map((exercise, index) => (
                        <div key={index} className="exercise-detail">
                          <span className="exercise-name">{exercise.name}</span>
                          <span className="exercise-stats">
                            {exercise.reps}回 × {exercise.sets}セット
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-records-for-date">
              <p>この日の記録はありません</p>
            </div>
          )}
        </div>
      )}

      {/* データがない場合 */}
      {records.length === 0 && (
        <div className="no-history-data">
          <div className="no-data-icon">📅</div>
          <h3>まだ履歴がありません</h3>
          <p>トレーニングを記録すると履歴が表示されます</p>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;