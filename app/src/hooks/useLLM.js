import { useCallback } from 'react';
import { processWithLLM } from '../utils/llmClient';

const useLLM = () => {
  const processText = useCallback(async (text, customExercises = []) => {
    if (!text.trim()) {
      throw new Error('テキストが入力されていません');
    }

    try {
      const result = await processWithLLM(text, customExercises);
      return result;
    } catch (error) {
      console.error('LLM処理エラー:', error);
      throw error;
    }
  }, []);

  return {
    processWithLLM: processText
  };
};

export default useLLM;