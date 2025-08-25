import { useCallback, useEffect, useState } from 'react';
import { db, initializeDB } from '../utils/dbSchema';

const useIndexedDB = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
        setIsInitialized(true);
      } catch (error) {
        console.error('DB初期化エラー:', error);
      }
    };
    init();
  }, []);

  const saveRecord = useCallback(async (record) => {
    if (!isInitialized) {
      throw new Error('データベースが初期化されていません');
    }

    try {
      const id = await db.workouts.add(record);
      console.log('記録保存完了:', id);
      return id;
    } catch (error) {
      console.error('記録保存エラー:', error);
      throw error;
    }
  }, [isInitialized]);

  const getRecords = useCallback(async (limit = 100) => {
    if (!isInitialized) {
      return [];
    }

    try {
      const records = await db.workouts
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
      
      return records;
    } catch (error) {
      console.error('記録取得エラー:', error);
      return [];
    }
  }, [isInitialized]);

  const deleteRecord = useCallback(async (id) => {
    if (!isInitialized) {
      throw new Error('データベースが初期化されていません');
    }

    try {
      await db.workouts.delete(id);
      console.log('記録削除完了:', id);
    } catch (error) {
      console.error('記録削除エラー:', error);
      throw error;
    }
  }, [isInitialized]);

  const getTodayRecords = useCallback(async () => {
    if (!isInitialized) {
      return [];
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const records = await db.workouts
        .where('timestamp')
        .between(startOfDay, endOfDay)
        .reverse()
        .toArray();

      return records;
    } catch (error) {
      console.error('今日の記録取得エラー:', error);
      return [];
    }
  }, [isInitialized]);

  const clearAllRecords = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('データベースが初期化されていません');
    }

    try {
      await db.workouts.clear();
      console.log('全記録削除完了');
    } catch (error) {
      console.error('全記録削除エラー:', error);
      throw error;
    }
  }, [isInitialized]);

  const saveCustomExercise = useCallback(async (customExercise) => {
    if (!isInitialized) {
      throw new Error('データベースが初期化されていません');
    }

    try {
      const id = await db.customExercises.add(customExercise);
      console.log('カスタム種目保存完了:', id);
      return id;
    } catch (error) {
      console.error('カスタム種目保存エラー:', error);
      throw error;
    }
  }, [isInitialized]);

  const getCustomExercises = useCallback(async () => {
    if (!isInitialized) {
      return [];
    }

    try {
      const exercises = await db.customExercises.toArray();
      return exercises;
    } catch (error) {
      console.error('カスタム種目取得エラー:', error);
      return [];
    }
  }, [isInitialized]);

  const deleteCustomExercise = useCallback(async (id) => {
    if (!isInitialized) {
      throw new Error('データベースが初期化されていません');
    }

    try {
      await db.customExercises.delete(id);
      console.log('カスタム種目削除完了:', id);
    } catch (error) {
      console.error('カスタム種目削除エラー:', error);
      throw error;
    }
  }, [isInitialized]);

  return {
    isInitialized,
    saveRecord,
    getRecords,
    deleteRecord,
    getTodayRecords,
    clearAllRecords,
    saveCustomExercise,
    getCustomExercises,
    deleteCustomExercise
  };
};

export default useIndexedDB;