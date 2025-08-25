import React, { useState, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { EXERCISE_LIST, EXERCISE_CATEGORIES, addCustomExercise } from '../data/exerciseTypes.js';
import useIndexedDB from '../hooks/useIndexedDB';

const RecordTab = ({ onRecordSaved, isLoading, setIsLoading, todayRecords = [], allRecords = [] }) => {
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'manual'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [editingExercise, setEditingExercise] = useState(null); // 編集中の種目ID
  const [editValues, setEditValues] = useState({ reps: '', sets: '' }); // 編集中の値
  const [customExercises, setCustomExercises] = useState([]); // カスタム種目リスト
  const [showAddExercise, setShowAddExercise] = useState(false); // 種目追加UI表示
  const [newExerciseName, setNewExerciseName] = useState(''); // 新種目名
  const { saveRecord, saveCustomExercise, getCustomExercises } = useIndexedDB();
  
  // カスタム種目の読み込み
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const exercises = await getCustomExercises();
        setCustomExercises(exercises);
      } catch (error) {
        console.error('カスタム種目読み込みエラー:', error);
      }
    };
    loadCustomExercises();
  }, [getCustomExercises]);

  // 全種目リスト（固定 + カスタム）
  const allExercises = [...EXERCISE_LIST, ...customExercises];

  // デバッグ情報
  console.log('RecordTab rendered with:', {
    todayRecords: todayRecords.length,
    allRecords: allRecords.length,
    firstRecord: allRecords[0],
    customExercises: customExercises.length
  });
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

  // 継続日数を計算
  const calculateStreaks = (records) => {
    if (records.length === 0) return { currentStreak: 0, maxStreak: 0 };
    
    // 日付別にグループ化
    const dateGroups = {};
    records.forEach(record => {
      const dateStr = new Date(record.timestamp).toDateString();
      dateGroups[dateStr] = true;
    });
    
    const workoutDates = Object.keys(dateGroups)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a); // 新しい日付順
    
    if (workoutDates.length === 0) return { currentStreak: 0, maxStreak: 0 };
    
    // 現在の継続日数を計算
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 今日または昨日から連続している日数を数える
    let checkDate = new Date();
    if (workoutDates[0].toDateString() !== today) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (checkDate >= workoutDates[workoutDates.length - 1]) {
      const checkDateStr = checkDate.toDateString();
      if (dateGroups[checkDateStr]) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // 最大継続日数を計算
    let maxStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < workoutDates.length; i++) {
      const currentDate = workoutDates[i];
      const prevDate = workoutDates[i - 1];
      const dayDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return { currentStreak, maxStreak };
  };

  const { currentStreak, maxStreak } = calculateStreaks(allRecords);

  // 編集モードの開始
  const startEditing = (exerciseId, currentReps, currentSets) => {
    setEditingExercise(exerciseId);
    setEditValues({ reps: currentReps.toString(), sets: currentSets.toString() });
  };

  // 編集のキャンセル
  const cancelEditing = () => {
    setEditingExercise(null);
    setEditValues({ reps: '', sets: '' });
  };

  // 編集内容の保存
  const saveEdit = async (exerciseId) => {
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    if (!exercise || !editValues.reps || !editValues.sets) {
      alert('回数とセット数を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const record = {
        id: Date.now().toString(),
        timestamp: new Date(),
        raw_input: `${exercise.name} ${editValues.reps}回 ${editValues.sets}セット`,
        exercises: [{
          name: exercise.name,
          weight: exercise.defaultWeight,
          reps: parseInt(editValues.reps),
          sets: parseInt(editValues.sets),
          volume: parseInt(editValues.reps) * parseInt(editValues.sets)
        }]
      };

      await saveRecord(record);
      onRecordSaved(record);
      
      // 編集モードを終了
      cancelEditing();
      
    } catch (error) {
      console.error('記録保存エラー:', error);
      alert('記録の保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 新規記録の追加（未実施の種目用）
  const addNewRecord = async (exerciseId) => {
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    // 編集モードを開始（デフォルト値で）
    setEditingExercise(exerciseId);
    setEditValues({ reps: '10', sets: '1' });
  };

  // カスタム種目追加
  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      alert('種目名を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const customExercise = await addCustomExercise(newExerciseName.trim());
      await saveCustomExercise(customExercise);
      
      // リストを更新
      setCustomExercises(prev => [...prev, customExercise]);
      
      // UIをリセット
      setNewExerciseName('');
      setShowAddExercise(false);
      
      alert(`「${customExercise.name}」を追加しました！`);
      
    } catch (error) {
      console.error('カスタム種目追加エラー:', error);
      alert('種目の追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="record-tab">
      {/* メインの記録エリア */}
      <div className="main-record-area">
        <h2>トレーニングを記録</h2>
        
        {/* 入力方法選択 */}
        <div className="input-mode-selector">
          <button 
            className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
            onClick={() => setInputMode('voice')}
          >
            🎤 音声で話す
          </button>
          <button 
            className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
          >
            📝 種目を選ぶ
          </button>
        </div>

        {/* 音声入力モード */}
        {inputMode === 'voice' && (
          <div className="voice-input-section">
            <p className="record-hint">
              💬 例: 「腕立て伏せ20回3セット」「懸垂10回2セット」「昨日スクワット30回」
            </p>
            
            <VoiceRecorder 
              onRecordSaved={onRecordSaved} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

          </div>
        )}

        {/* 手動入力モード（今日の記録カードで直接編集） */}
        {inputMode === 'manual' && (
          <div className="manual-input-section">
            <p className="record-hint">
              📋 下の記録カードをクリックして直接編集してください
            </p>
          </div>
        )}
      </div>

      {/* 継続率カード */}
      {(todayRecords.length > 0 || allRecords.length > 0) && (
        <div className="streak-card">
          <div className="streak-header">
            <div className="streak-icon">🔥</div>
            <h3 className="streak-title">継続力</h3>
            <p className="streak-subtitle">毎日の積み重ね</p>
          </div>
          <div className="streak-stats">
            <div className="streak-item primary">
              <div className="streak-value">{currentStreak}</div>
              <div className="streak-unit">日</div>
              <div className="streak-label">現在</div>
            </div>
            <div className="streak-divider"></div>
            <div className="streak-item secondary">
              <div className="streak-value">{maxStreak}</div>
              <div className="streak-unit">日</div>
              <div className="streak-label">最高</div>
            </div>
          </div>
          <div className="streak-progress-bar">
            <div 
              className="streak-progress-fill" 
              style={{ width: `${maxStreak > 0 ? (currentStreak / maxStreak) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 今日のトレーニング記録 */}
      <div className="today-exercises">
        <div className="today-exercises-header">
          <h3>今日のトレーニング記録 📊</h3>
          <button 
            className="add-exercise-btn"
            onClick={() => setShowAddExercise(true)}
            disabled={isLoading}
          >
            ➕ 種目追加
          </button>
        </div>
        
        {/* カスタム種目追加UI */}
        {showAddExercise && (
          <div className="add-exercise-form">
            <div className="add-exercise-inputs">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="新しい種目名を入力"
                className="exercise-name-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomExercise()}
              />
              <button 
                onClick={handleAddCustomExercise}
                disabled={isLoading || !newExerciseName.trim()}
                className="save-exercise-btn"
              >
                {isLoading ? '分析中...' : '追加'}
              </button>
              <button 
                onClick={() => {
                  setShowAddExercise(false);
                  setNewExerciseName('');
                }}
                className="cancel-exercise-btn"
              >
                キャンセル
              </button>
            </div>
            <p className="add-exercise-hint">
              💡 AIが自動で部位と絵文字を判定します
            </p>
          </div>
        )}

        <div className="today-exercise-grid">
          {allExercises.map(exercise => {
            // 今日のこの種目の記録を集計
            const todayStats = todayRecords.reduce((stats, record) => {
              record.exercises.forEach(ex => {
                if (ex.name === exercise.name) {
                  stats.totalReps += ex.reps || 0;
                  stats.totalSets += ex.sets || 0;
                  stats.sessions += 1;
                }
              });
              return stats;
            }, { totalReps: 0, totalSets: 0, sessions: 0 });

            const hasData = todayStats.totalReps > 0;

            return (
              <div 
                key={exercise.id} 
                className={`today-exercise-card ${hasData ? 'completed' : 'not-completed'} ${inputMode === 'manual' ? 'editable' : ''}`}
                onClick={() => inputMode === 'manual' && (hasData ? startEditing(exercise.id, todayStats.totalReps, todayStats.totalSets) : addNewRecord(exercise.id))}
              >
                <div className="today-exercise-header">
                  <span className="today-exercise-icon">{exercise.icon}</span>
                  <span className="today-exercise-name">{exercise.name}</span>
                </div>
                <div className="today-exercise-stats">
                  {editingExercise === exercise.id ? (
                    <div className="edit-form">
                      <div className="edit-input-group">
                        <input
                          type="number"
                          value={editValues.reps}
                          onChange={(e) => setEditValues({...editValues, reps: e.target.value})}
                          placeholder="回数"
                          className="edit-input"
                          min="1"
                        />
                        <span className="edit-unit">{exercise.unit}</span>
                      </div>
                      <div className="edit-input-group">
                        <input
                          type="number"
                          value={editValues.sets}
                          onChange={(e) => setEditValues({...editValues, sets: e.target.value})}
                          placeholder="セット"
                          className="edit-input"
                          min="1"
                        />
                        <span className="edit-unit">セット</span>
                      </div>
                      <div className="edit-actions">
                        <button className="save-btn" onClick={(e) => { e.stopPropagation(); saveEdit(exercise.id); }}>
                          ✓
                        </button>
                        <button className="cancel-btn" onClick={(e) => { e.stopPropagation(); cancelEditing(); }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {hasData ? (
                        <>
                          <div className="stat-item">
                            <span className="stat-value">{todayStats.totalReps}</span>
                            <span className="stat-unit">{exercise.unit}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{todayStats.totalSets}</span>
                            <span className="stat-unit">セット</span>
                          </div>
                        </>
                      ) : (
                        <span className="no-data">{inputMode === 'manual' ? 'タップして記録' : '未実施'}</span>
                      )}
                      {inputMode === 'manual' && (
                        <div className="edit-hint">✏️</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 初回利用時のウェルカムメッセージ */}
      {todayRecords.length === 0 && (
        <div className="welcome-message">
          <div className="welcome-icon">💪</div>
          <h3>WorkoutVoiceへようこそ！</h3>
          <p>2つの方法でトレーニングを記録できます</p>
          <div className="welcome-tips">
            <div className="tip">🎤 <strong>音声で話す</strong>：「腕立て伏せ20回3セット」と話すだけ</div>
            <div className="tip">📝 <strong>種目を選ぶ</strong>：ボタンから種目を選んで数値入力</div>
            <div className="tip">📊 どちらも同じように統計が作成されます</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordTab;