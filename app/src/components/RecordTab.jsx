import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

const RecordTab = ({ onRecordSaved, isLoading, setIsLoading, todayRecords = [] }) => {
  // 今日の統計を計算
  const todayStats = todayRecords.reduce((stats, record) => {
    record.exercises.forEach(exercise => {
      stats.totalReps += exercise.reps || 0;
      stats.totalSets += exercise.sets || 0;
      stats.exerciseCount += 1;
    });
    return stats;
  }, {
    totalReps: 0,
    totalSets: 0,
    exerciseCount: 0
  });

  return (
    <div className="record-tab">
      {/* 今日の進捗カード */}
      {todayRecords.length > 0 && (
        <div className="today-progress-card">
          <h3>今日の進捗 🔥</h3>
          <div className="progress-stats">
            <div className="progress-item">
              <span className="progress-number">{todayStats.exerciseCount}</span>
              <span className="progress-label">種目</span>
            </div>
            <div className="progress-item">
              <span className="progress-number">{todayStats.totalReps}</span>
              <span className="progress-label">回数</span>
            </div>
            <div className="progress-item">
              <span className="progress-number">{todayStats.totalSets}</span>
              <span className="progress-label">セット</span>
            </div>
          </div>
        </div>
      )}

      {/* メイン録音エリア */}
      <div className="main-record-area">
        <h2>トレーニングを記録しよう</h2>
        <p className="record-hint">例: 「腕立て伏せ20回3セット」</p>
        
        <VoiceRecorder 
          onRecordSaved={onRecordSaved} 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>

      {/* 今日の記録一覧 */}
      {todayRecords.length > 0 && (
        <div className="today-records">
          <h3>今日の記録</h3>
          <div className="record-table-container">
            <table className="record-table">
              <thead>
                <tr>
                  <th>種目名</th>
                  <th>重量</th>
                  <th>回数</th>
                  <th>セット数</th>
                  <th>合計</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // 種目別に集計
                  const exerciseMap = {};
                  todayRecords.forEach(record => {
                    record.exercises.forEach(exercise => {
                      const key = exercise.name;
                      if (!exerciseMap[key]) {
                        exerciseMap[key] = {
                          name: exercise.name,
                          weight: exercise.weight || 0,
                          totalReps: 0,
                          totalSets: 0,
                          sessions: []
                        };
                      }
                      exerciseMap[key].totalReps += exercise.reps || 0;
                      exerciseMap[key].totalSets += exercise.sets || 0;
                      exerciseMap[key].sessions.push({
                        reps: exercise.reps || 0,
                        sets: exercise.sets || 0,
                        time: record.timestamp
                      });
                    });
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
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 初回利用時のウェルカムメッセージ */}
      {todayRecords.length === 0 && (
        <div className="welcome-message">
          <div className="welcome-icon">💪</div>
          <h3>WorkoutVoiceへようこそ！</h3>
          <p>音声でかんたんに自重トレーニングを記録できます</p>
          <div className="welcome-tips">
            <div className="tip">🎤 録音ボタンを押して話しかけるだけ</div>
            <div className="tip">📅 「昨日腹筋30回」で過去記録も可能</div>
            <div className="tip">📊 自動で統計が作成されます</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordTab;