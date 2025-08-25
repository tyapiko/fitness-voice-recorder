import Dexie from 'dexie';

export class WorkoutDatabase extends Dexie {
  constructor() {
    super('WorkoutVoiceDB');
    
    this.version(1).stores({
      workouts: '&id, timestamp, raw_input, exercises, created_at, updated_at'
    });

    this.version(2).stores({
      workouts: '&id, timestamp, raw_input, exercises, created_at, updated_at',
      customExercises: '&id, name, category, targetMuscle, icon, unit, isCustom, keywords'
    });
  }
}

export const db = new WorkoutDatabase();

export const initializeDB = async () => {
  try {
    await db.open();
    console.log('IndexedDB初期化完了');
  } catch (error) {
    console.error('IndexedDB初期化エラー:', error);
  }
};