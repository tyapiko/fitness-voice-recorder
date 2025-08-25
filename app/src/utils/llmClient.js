import { EXERCISE_LIST, findExerciseByKeyword } from '../data/exerciseTypes.js';

const LLM_ENDPOINT = 'http://localhost:1234/v1/chat/completions';

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

const HOME_SYSTEM_PROMPT = `あなたは自宅での筋トレ記録を解析するアシスタントです。
日本語の自然な表現から、筋トレに関する情報のみを抽出してJSON形式で返してください：

- 種目名（name）※音声認識の誤字があれば正しい筋トレ種目名に修正
- 回数（reps）※自重トレーニングなので回数重視
- セット数（sets）
- 日付（date）※日付が明示されている場合のみ、YYYY-MM-DD形式で返す

【重要】筋トレ以外の言葉は絶対に種目として登録しないでください。
有効な筋トレ種目のみ抽出してください：
- 腕立て伏せ、腹筋、スクワット、懸垂、プランク、ランジ、バーピー
- ディップス、マウンテンクライマー、ジャンピングスクワット
- シットアップ、クランチ、レッグレイズ、カーフレイズ
- ウォーキング、ランニング、ストレッチ、ヨガ

【音声認識誤字修正例（重要）】：
- "住宅伏せ" → "腕立て伏せ"
- "腹金" → "腹筋"
- "研修" → "懸垂" ★重要★
- "献血" → "懸垂"
- "検証" → "懸垂" 
- "賢治" → "懸垂"
- "懸垂" → "懸垂"（正しい）
- "スカート" → "スクワット"
- "ランニング" → "ランニング"（正しい）
- "柔軟" → "ストレッチ"

筋トレに関係のない言葉（例：研修、会議、勉強、仕事など）が含まれていても、
それらは無視して筋トレ種目のみを抽出してください。

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
}`;

export const processWithLLM = async (text, customExercises = []) => {
  try {
    console.log('LLM処理開始:', text);
    
    const systemPrompt = HOME_SYSTEM_PROMPT;
    
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
    
    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', response.status, errorText);
      throw new Error(`LLM API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('LLMレスポンス:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('無効なLLMレスポンス形式');
    }
    
    const content = data.choices[0].message.content.trim();
    
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
        // 種目名を修正・検証（カスタム種目も含めて）
        const correctedName = correctExerciseName(exercise.name, customExercises);
        
        // 無効な種目名の場合はnullを返す（後でフィルタリング）
        if (!correctedName) {
          console.log(`無効な種目名を除外: "${exercise.name}"`);
          return null;
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
    
    // すべての種目が無効だった場合はエラーを投げる
    if (result.exercises.length === 0) {
      console.log('有効な筋トレ種目が見つかりませんでした');
      throw new Error('筋トレに関連する種目が見つかりませんでした');
    }

    return result;
  } catch (error) {
    console.error('LLM処理エラー:', error);
    
    // フォールバック: 簡単な解析を試行
    return fallbackParse(text, customExercises);
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
    }
  }

  return {
    exercises,
    confidence: 0.3,
    fallback: true
  };
};