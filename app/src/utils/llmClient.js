import { EXERCISE_LIST, findExerciseByKeyword } from '../data/exerciseTypes.js';

const LLM_ENDPOINT = import.meta.env.VITE_LLM_ENDPOINT || 'http://localhost:1234/v1/chat/completions';
const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY;

// リクエストヘッダーの設定（APIキー対応）
const getRequestHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // OpenAI API
  if (LLM_ENDPOINT.includes('api.openai.com') && LLM_API_KEY) {
    headers['Authorization'] = `Bearer ${LLM_API_KEY}`;
  }
  
  // Anthropic Claude API
  if (LLM_ENDPOINT.includes('api.anthropic.com') && LLM_API_KEY) {
    headers['x-api-key'] = LLM_API_KEY;
    headers['anthropic-version'] = '2023-06-01';
  }
  
  // Google Gemini API
  if (LLM_ENDPOINT.includes('generativelanguage.googleapis.com') && LLM_API_KEY) {
    // Gemini APIはURLにキーを含める
  }
  
  return headers;
};

const GYM_SYSTEM_PROMPT = `あなたはジムでの筋トレ記録を解析するアシスタントです。
日本語の自然な表現から、以下の情報を抽出してJSON形式で返してください：

- 種目名（name）※音声認識の誤字があれば正しい名称に修正
- 重量（weight）※必須、単位も識別
- 回数（reps）
- セット数（sets）

【重要】音声認識による誤字修正例：
- "住宅伏せ" → "腕立て伏せ"
- "ベット" → "ベンチプレス"
- "スカート" → "スクワット" 
- "腹金" → "腹筋"
- "デッドリフト" → "デッドリフト"（正しい）

一般的な筋トレ種目名に近い音の誤認識は積極的に修正してください。

計算ルール：
- volume = weight * reps * sets

例:
入力: "住宅伏せ20回3セット"
出力: {
  "exercises": [
    {
      "name": "腕立て伏せ",
      "weight": 0,
      "weight_unit": "kg",
      "reps": 20,
      "sets": 3,
      "volume": 60
    }
  ],
  "confidence": 0.95
}`;

const generateSystemPrompt = (customExercises = []) => {
  const customExerciseNames = customExercises.map(ex => ex.name);
  const allValidExercises = [
    '腕立て伏せ', '腹筋', 'スクワット', '懸垂', 'プランク', 'ランジ', 'バーピー',
    'ディップス', 'マウンテンクライマー', 'ジャンピングスクワット',
    'シットアップ', 'クランチ', 'レッグレイズ', 'カーフレイズ',
    'ウォーキング', 'ランニング', 'ストレッチ', 'ヨガ',
    ...customExerciseNames
  ];

  return `あなたは自宅での筋トレ記録を解析するアシスタントです。
日本語の自然な表現から、筋トレに関する情報を抽出してJSON形式で返してください：

- 種目名（name）※音声認識の誤字があれば正しい筋トレ種目名に修正
- 回数（reps）※自重トレーニングなので回数重視
- セット数（sets）※省略されていれば1セットとして扱う
- 日付（date）※日付が明示されている場合のみ、YYYY-MM-DD形式で返す

対応可能な種目リスト：
${allValidExercises.map(name => `- ${name}`).join('\n')}

【音声認識誤字修正例】：
- "住宅伏せ" → "腕立て伏せ"
- "腹金" → "腹筋" 
- "献血"/"検証"/"賢治" → "懸垂"
- "スカート" → "スクワット"
- "柔軟" → "ストレッチ"

【重要】英語の単語（test、hello等）は筋トレ種目ではないので、
これらが入力された場合はexercisesを空配列で返してください。

【日付解析】以下の表現から日付を認識してください：
- "8月24日" → "2025-08-24"
- "昨日" → 今日から1日前の日付
- "一昨日" → 今日から2日前の日付
- "3日前" → 今日から3日前の日付
- "先週の月曜日" → 先週の月曜日の日付
- 日付が含まれない場合は、dateフィールドは含めない

自重トレーニングなので重量は0に設定してください。
計算ルール：
- volume = reps * sets (重量なしの場合)

【重要】セット数が省略された場合は、自動的に1セットとして扱ってください。

例1（日付あり）:
入力: "8月24日腹筋20回2セット"
出力: {
  "exercises": [
    {
      "name": "腹筋",
      "weight": 0,
      "weight_unit": "kg",
      "reps": 20,
      "sets": 2,
      "volume": 40
    }
  ],
  "date": "2025-08-24",
  "confidence": 0.95
}

例2（日付なし）:
入力: "住宅伏せ30回3セット"
出力: {
  "exercises": [
    {
      "name": "腕立て伏せ",
      "weight": 0,
      "weight_unit": "kg",
      "reps": 30,
      "sets": 3,
      "volume": 90
    }
  ],
  "confidence": 0.95
}

例3（セット数省略）:
入力: "スクワット10回"
出力: {
  "exercises": [
    {
      "name": "スクワット",
      "weight": 0,
      "weight_unit": "kg",
      "reps": 10,
      "sets": 1,
      "volume": 10
    }
  ],
  "confidence": 0.95
}`
};

export const processWithLLM = async (text, customExercises = []) => {
  try {
    console.log('LLM処理開始:', text);
    console.log('カスタム種目:', customExercises);
    
    const systemPrompt = generateSystemPrompt(customExercises);
    
    const requestBody = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3,
      max_tokens: 500,
      stream: false
    };
    
    console.log('LLMリクエスト:', JSON.stringify(requestBody, null, 2));
    
    // エンドポイントとリクエストボディの調整（API種別に応じて）
    let finalEndpoint = LLM_ENDPOINT;
    let finalRequestBody = requestBody;
    
    // Google Gemini APIの場合、特別な形式に変更
    if (LLM_ENDPOINT.includes('generativelanguage.googleapis.com')) {
      finalEndpoint = `${LLM_ENDPOINT}?key=${LLM_API_KEY}`;
      finalRequestBody = {
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser: ${text}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      };
    }

    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify(finalRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', response.status, errorText);
      throw new Error(`LLM API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('LLMレスポンス:', data);
    
    let content;
    
    // レスポンス形式の統一（API種別に応じて）
    if (LLM_ENDPOINT.includes('generativelanguage.googleapis.com')) {
      // Google Gemini API
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('無効なGemini APIレスポンス形式');
      }
      content = data.candidates[0].content.parts[0].text.trim();
    } else if (LLM_ENDPOINT.includes('api.anthropic.com')) {
      // Anthropic Claude API
      if (!data.content || !data.content[0]) {
        throw new Error('無効なClaude APIレスポンス形式');
      }
      content = data.content[0].text.trim();
    } else {
      // OpenAI API or LM Studio (OpenAI compatible)
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('無効なLLMレスポンス形式');
      }
      content = data.choices[0].message.content.trim();
    }
    
    // JSONの抽出（コードブロックがある場合に対応）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLMからのレスポンスが無効です');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // バリデーション
    if (!result.exercises || !Array.isArray(result.exercises)) {
      throw new Error('無効なデータ形式です');
    }

    // デフォルト値の設定と種目名の検証
    result.exercises = result.exercises
      .map(exercise => {
        // 英語の明らかに無効な単語のみ最終チェック
        const invalidEnglishWords = ['test', 'hello', 'ok', 'yes', 'no'];
        if (invalidEnglishWords.includes(exercise.name.toLowerCase())) {
          console.log(`明らかに無効な英語単語を除外: "${exercise.name}"`);
          return null;
        }
        
        // 種目名を修正・検証（カスタム種目も含めて） - より寛容に
        let correctedName = exercise.name;
        
        // カスタム種目チェック
        if (customExercises.find(ex => ex.name === exercise.name)) {
          correctedName = exercise.name;
        } else {
          // 固定種目から検索
          const fixedExercise = findExerciseByKeyword(exercise.name);
          if (fixedExercise) {
            correctedName = fixedExercise.name;
          } else if (allValidExercises.includes(exercise.name)) {
            correctedName = exercise.name;
          }
          // 見つからなくても、日本語であれば通す（ユーザビリティ優先）
          else if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(exercise.name)) {
            correctedName = exercise.name;
          } else {
            console.log(`無効な種目名を除外: "${exercise.name}"`);
            return null;
          }
        }
        
        const reps = exercise.reps || 0;
        const sets = exercise.sets || 1; // セット数が0の場合は1に設定
        
        return {
          name: correctedName,
          weight: exercise.weight || 0,
          weight_unit: exercise.weight_unit || 'kg',
          reps: reps,
          sets: sets,
          volume: exercise.volume || (reps * sets)
        };
      })
      .filter(exercise => exercise !== null); // nullの要素を除外
    
    console.log('処理後の種目数:', result.exercises.length);
    console.log('処理後の種目:', result.exercises);
    
    // すべての種目が無効だった場合はエラーを投げる
    if (result.exercises.length === 0) {
      console.log('有効な筋トレ種目が見つかりませんでした');
      
      // 入力テキストから種目名らしきものを抽出して具体的なエラーメッセージを作成
      const possibleExerciseName = extractPossibleExerciseName(text);
      console.log('抽出された種目名:', possibleExerciseName);
      if (possibleExerciseName) {
        const errorMessage = `「${possibleExerciseName}」というトレーニングメニューはありません。\n正しいメニュー名で再度お試しください。`;
        console.log('作成されたエラーメッセージ:', errorMessage);
        throw new Error(errorMessage);
      } else {
        throw new Error('筋トレに関連する種目が見つかりませんでした。');
      }
    }

    return result;
  } catch (error) {
    console.error('LLM処理エラー:', error);
    
    // LLMエラーの場合でも確実に無効種目エラーを発生させる
    console.log('LLMエラー発生 - フォールバックでエラー処理');
    
    try {
      // フォールバック: 簡単な解析を試行
      const fallbackResult = fallbackParse(text, customExercises);
      console.log('フォールバック結果:', fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('フォールバックでもエラー:', fallbackError);
      // フォールバックでもダメな場合、確実にエラーを投げる
      const possibleExerciseName = extractPossibleExerciseName(text);
      throw new Error(`「${possibleExerciseName}」というトレーニングメニューはありません。\n正しいメニュー名で再度お試しください。`);
    }
  }
};

// 固定メニューから有効な種目名リストを生成
const VALID_EXERCISES = EXERCISE_LIST.map(exercise => exercise.name);

// 種目名が有効かチェック（カスタム種目も含める）
const isValidExercise = (name, customExercises = []) => {
  const allValidExercises = [...VALID_EXERCISES, ...customExercises.map(ex => ex.name)];
  return allValidExercises.includes(name);
};

// 固定メニューベースの種目名修正システム（カスタム種目対応）
const correctExerciseName = (name, customExercises = []) => {
  console.log(`種目名修正処理: "${name}"`);
  
  // 1. 既に有効な種目名の場合はそのまま（カスタム種目も含める）
  if (isValidExercise(name, customExercises)) {
    console.log(`有効な種目名: "${name}"`);
    return name;
  }
  
  // 2. キーワードベースマッチング（固定メニューから）
  const matchedExercise = findExerciseByKeyword(name);
  if (matchedExercise) {
    console.log(`キーワードマッチング: "${name}" → "${matchedExercise.name}"`);
    return matchedExercise.name;
  }

  // 3. カスタム種目のキーワードマッチング
  for (const customEx of customExercises) {
    if (customEx.keywords && customEx.keywords.some(keyword => 
      keyword.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(keyword.toLowerCase())
    )) {
      console.log(`カスタム種目キーワードマッチング: "${name}" → "${customEx.name}"`);
      return customEx.name;
    }
  }
  
  // 4. 類似文字列検索（フォールバック、カスタム種目も含める）
  const similarExercise = findSimilarExercise(name, customExercises);
  if (similarExercise) {
    console.log(`文字列類似マッチング: "${name}" → "${similarExercise}"`);
    return similarExercise;
  }
  
  console.log(`マッチしない種目名: "${name}"`);
  return null;
};

// 類似する種目名を検索（レーベンシュタイン距離ベース、カスタム種目対応）
const findSimilarExercise = (name, customExercises = []) => {
  let minDistance = Infinity;
  let bestMatch = null;
  
  const allValidExercises = [...VALID_EXERCISES, ...customExercises.map(ex => ex.name)];
  
  for (const validExercise of allValidExercises) {
    const distance = levenshteinDistance(name, validExercise);
    // 2文字以内の違いなら候補とする
    if (distance <= 2 && distance < minDistance) {
      minDistance = distance;
      bestMatch = validExercise;
    }
  }
  
  return bestMatch;
};

// レーベンシュタイン距離計算
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// 入力テキストから種目名らしきものを抽出
const extractPossibleExerciseName = (text) => {
  console.log(`種目名抽出処理: "${text}"`);
  
  // 簡単なパターンマッチングで種目名らしきものを抽出
  const patterns = [
    /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+回/,  // "○○10回" のパターン（日本語、英語、数字対応）
    /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+セット/, // "○○2セット" のパターン
    /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+分/,  // "○○5分" のパターン
    /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)\s*\d+秒/,  // "○○30秒" のパターン
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      console.log(`パターンマッチ成功: "${match[1]}"`);
      return match[1];
    }
  }
  
  // パターンにマッチしない場合は最初の単語を返す
  const words = text.trim().split(/\s+/);
  const firstWord = words[0];
  console.log(`デフォルト抽出: "${firstWord}"`);
  return firstWord;
};

// フォールバック機能: LLMが使用できない場合の簡単な解析
const fallbackParse = (text, customExercises = []) => {
  const exercises = [];
  
  // 基本的なパターンマッチング
  const patterns = [
    /(\w+)\s*(\d+)kg\s*(\d+)回\s*(\d+)セット/g,
    /(\w+)\s*(\d+)キロ\s*(\d+)回\s*(\d+)セット/g,
    /(\w+)\s*(\d+)kg\s*(\d+)rep\s*(\d+)set/gi,
    /(\w+)\s*(\d+)回\s*(\d+)セット/g,  // 自重用パターン
    /(\w+)\s*(\d+)回/g,  // 回数のみのパターン（セット数1として扱う）
  ];

  patterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let name, weight, reps, sets;
      
      if (patternIndex === 4) {
        // 回数のみのパターン: "スクワット10回"
        [, name, reps] = match;
        weight = 0;
        sets = 1;
      } else if (patternIndex === 3) {
        // 自重パターン: "スクワット10回2セット"
        [, name, reps, sets] = match;
        weight = 0;
      } else {
        // その他のパターン
        [, name, weight, reps, sets] = match;
        
        // 重量がない場合のパターン調整
        if (!sets && reps && weight) {
          sets = weight;
          weight = 0;
          reps = parseInt(reps);
        }
      }
      
      // 種目名の誤字修正と検証（カスタム種目も含める）
      const correctedName = correctExerciseName(name, customExercises);
      
      // 無効な種目名の場合はスキップ
      if (!correctedName) {
        console.log(`フォールバックで無効な種目名を除外: "${name}"`);
        continue;
      }
      
      const weightNum = parseInt(weight) || 0;
      const repsNum = parseInt(reps) || 0;
      const setsNum = parseInt(sets) || 1; // セット数が0の場合は1に設定
      
      exercises.push({
        name: correctedName,
        weight: 0,
        weight_unit: 'kg',
        reps: repsNum,
        sets: setsNum,
        volume: repsNum * setsNum
      });
    }
  });

  // パターンが一致しない場合のデフォルト処理
  if (exercises.length === 0) {
    const correctedName = correctExerciseName(text.trim(), customExercises);
    
    // 有効な種目名の場合のみ追加
    if (correctedName) {
      exercises.push({
        name: correctedName,
        weight: 0,
        weight_unit: 'kg',
        reps: 0,
        sets: 0,
        volume: 0
      });
    } else {
      // フォールバックでも無効な場合、具体的なエラーメッセージを作成
      console.log('フォールバックでも種目が見つかりませんでした');
      const possibleExerciseName = extractPossibleExerciseName(text);
      console.log('フォールバック抽出された種目名:', possibleExerciseName);
      if (possibleExerciseName) {
        const errorMessage = `「${possibleExerciseName}」というトレーニングメニューはありません。\n正しいメニュー名で再度お試しください。`;
        console.log('フォールバック作成されたエラーメッセージ:', errorMessage);
        throw new Error(errorMessage);
      } else {
        throw new Error('筋トレに関連する種目が見つかりませんでした。');
      }
    }
  }

  return {
    exercises,
    confidence: 0.3,
    fallback: true
  };
};