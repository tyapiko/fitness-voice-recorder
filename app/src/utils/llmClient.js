const LLM_ENDPOINT = 'http://localhost:1234/v1/chat/completions';

const GYM_SYSTEM_PROMPT = `あなたはジムでの筋トレ記録を解析するアシスタントです。
日本語の自然な表現から、以下の情報を抽出してJSON形式で返してください：

- 種目名（name）
- 重量（weight）※必須、単位も識別
- 回数（reps）
- セット数（sets）

計算ルール：
- volume = weight * reps * sets

例:
入力: "ベンチプレス60kg10回3セット"
出力: {
  "exercises": [
    {
      "name": "ベンチプレス",
      "weight": 60,
      "weight_unit": "kg",
      "reps": 10,
      "sets": 3,
      "volume": 1800
    }
  ],
  "confidence": 0.95
}`;

const HOME_SYSTEM_PROMPT = `あなたは自宅での筋トレ記録を解析するアシスタントです。
日本語の自然な表現から、以下の情報を抽出してJSON形式で返してください：

- 種目名（name）
- 回数（reps）※自重トレーニングなので回数重視
- セット数（sets）

自重トレーニングなので重量は0に設定してください。
計算ルール：
- volume = reps * sets (重量なしの場合)

例:
入力: "腹筋30回3セット"
出力: {
  "exercises": [
    {
      "name": "腹筋",
      "weight": 0,
      "weight_unit": "kg",
      "reps": 30,
      "sets": 3,
      "volume": 90
    }
  ],
  "confidence": 0.95
}`;

export const processWithLLM = async (text, workoutMode = 'gym') => {
  try {
    console.log('LLM処理開始:', text, 'モード:', workoutMode);
    
    const systemPrompt = workoutMode === 'gym' ? GYM_SYSTEM_PROMPT : HOME_SYSTEM_PROMPT;
    
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

    // デフォルト値の設定
    result.exercises = result.exercises.map(exercise => ({
      name: exercise.name || '不明な種目',
      weight: exercise.weight || 0,
      weight_unit: exercise.weight_unit || 'kg',
      reps: exercise.reps || 0,
      sets: exercise.sets || 0,
      volume: exercise.volume || (exercise.weight * exercise.reps * exercise.sets)
    }));

    return result;
  } catch (error) {
    console.error('LLM処理エラー:', error);
    
    // フォールバック: 簡単な解析を試行
    return fallbackParse(text);
  }
};

// フォールバック機能: LLMが使用できない場合の簡単な解析
const fallbackParse = (text) => {
  const exercises = [];
  
  // 基本的なパターンマッチング
  const patterns = [
    /(\w+)\s*(\d+)kg\s*(\d+)回\s*(\d+)セット/g,
    /(\w+)\s*(\d+)キロ\s*(\d+)回\s*(\d+)セット/g,
    /(\w+)\s*(\d+)kg\s*(\d+)rep\s*(\d+)set/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, name, weight, reps, sets] = match;
      exercises.push({
        name: name,
        weight: parseInt(weight),
        weight_unit: 'kg',
        reps: parseInt(reps),
        sets: parseInt(sets),
        volume: parseInt(weight) * parseInt(reps) * parseInt(sets)
      });
    }
  });

  // パターンが一致しない場合のデフォルト
  if (exercises.length === 0) {
    exercises.push({
      name: text,
      weight: 0,
      weight_unit: 'kg',
      reps: 0,
      sets: 0,
      volume: 0
    });
  }

  return {
    exercises,
    confidence: 0.3,
    fallback: true
  };
};