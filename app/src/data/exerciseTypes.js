// 筋トレメニューの固定型定義
export const EXERCISE_TYPES = {
  // 上半身
  PUSH_UP: {
    id: 'push_up',
    name: '腕立て伏せ',
    category: '上半身',
    targetMuscle: '胸・腕',
    defaultWeight: 0,
    unit: '回',
    icon: '💪',
    keywords: ['腕立て', 'プッシュアップ', '住宅伏せ', 'プッシュ']
  },
  PULL_UP: {
    id: 'pull_up',
    name: '懸垂',
    category: '上半身',
    targetMuscle: '背中・腕',
    defaultWeight: 0,
    unit: '回',
    icon: '🏋️',
    keywords: ['懸垂', '研修', '献血', '賢治', '検証', 'けんすい']
  },
  DIPS: {
    id: 'dips',
    name: 'ディップス',
    category: '上半身',
    targetMuscle: '胸・腕',
    defaultWeight: 0,
    unit: '回',
    icon: '💺',
    keywords: ['ディップス', 'ディップ']
  },
  
  // 体幹・腹筋
  SIT_UP: {
    id: 'sit_up',
    name: '腹筋',
    category: '体幹',
    targetMuscle: '腹筋',
    defaultWeight: 0,
    unit: '回',
    icon: '🤸',
    keywords: ['腹筋', '腹金', 'ふっきん', 'シットアップ', 'クランチ']
  },
  PLANK: {
    id: 'plank',
    name: 'プランク',
    category: '体幹',
    targetMuscle: '体幹全体',
    defaultWeight: 0,
    unit: '秒',
    icon: '⏱️',
    keywords: ['プランク', 'プラン']
  },
  LEG_RAISE: {
    id: 'leg_raise',
    name: 'レッグレイズ',
    category: '体幹',
    targetMuscle: '下腹',
    defaultWeight: 0,
    unit: '回',
    icon: '🦵',
    keywords: ['レッグレイズ', '足上げ']
  },
  
  // 下半身
  SQUAT: {
    id: 'squat',
    name: 'スクワット',
    category: '下半身',
    targetMuscle: '太もも・お尻',
    defaultWeight: 0,
    unit: '回',
    icon: '🏃',
    keywords: ['スクワット', 'スカート', 'スクワ']
  },
  LUNGE: {
    id: 'lunge',
    name: 'ランジ',
    category: '下半身',
    targetMuscle: '太もも・お尻',
    defaultWeight: 0,
    unit: '回',
    icon: '🚶',
    keywords: ['ランジ']
  },
  CALF_RAISE: {
    id: 'calf_raise',
    name: 'カーフレイズ',
    category: '下半身',
    targetMuscle: 'ふくらはぎ',
    defaultWeight: 0,
    unit: '回',
    icon: '🦵',
    keywords: ['カーフレイズ', 'つま先立ち']
  },
  
  // 全身・有酸素
  BURPEE: {
    id: 'burpee',
    name: 'バーピー',
    category: '全身',
    targetMuscle: '全身',
    defaultWeight: 0,
    unit: '回',
    icon: '🤸‍♂️',
    keywords: ['バーピー', 'バービー']
  },
  MOUNTAIN_CLIMBER: {
    id: 'mountain_climber',
    name: 'マウンテンクライマー',
    category: '全身',
    targetMuscle: '全身・有酸素',
    defaultWeight: 0,
    unit: '回',
    icon: '⛰️',
    keywords: ['マウンテンクライマー', '登山']
  },
  JUMPING_SQUAT: {
    id: 'jumping_squat',
    name: 'ジャンピングスクワット',
    category: '全身',
    targetMuscle: '下半身・有酸素',
    defaultWeight: 0,
    unit: '回',
    icon: '🦘',
    keywords: ['ジャンピングスクワット', 'ジャンプスクワット']
  },
  
  // ストレッチ・その他
  STRETCH: {
    id: 'stretch',
    name: 'ストレッチ',
    category: 'その他',
    targetMuscle: '全身',
    defaultWeight: 0,
    unit: '分',
    icon: '🧘',
    keywords: ['ストレッチ', '柔軟', 'じゅうなん']
  },
  WALKING: {
    id: 'walking',
    name: 'ウォーキング',
    category: '有酸素',
    targetMuscle: '下半身・心肺',
    defaultWeight: 0,
    unit: '分',
    icon: '🚶‍♂️',
    keywords: ['ウォーキング', '散歩', '歩く']
  },
  RUNNING: {
    id: 'running',
    name: 'ランニング',
    category: '有酸素',
    targetMuscle: '全身・心肺',
    defaultWeight: 0,
    unit: '分',
    icon: '🏃‍♂️',
    keywords: ['ランニング', 'ジョギング', '走る']
  }
};

// カテゴリ別グループ化
export const EXERCISE_CATEGORIES = {
  '上半身': ['PUSH_UP', 'PULL_UP', 'DIPS'],
  '体幹': ['SIT_UP', 'PLANK', 'LEG_RAISE'],
  '下半身': ['SQUAT', 'LUNGE', 'CALF_RAISE'],
  '全身': ['BURPEE', 'MOUNTAIN_CLIMBER', 'JUMPING_SQUAT'],
  '有酸素': ['WALKING', 'RUNNING'],
  'その他': ['STRETCH']
};

// 配列形式でエクスポート（UIで使いやすくするため）
export const EXERCISE_LIST = Object.values(EXERCISE_TYPES);

// 体の部位レベルシステム
export const BODY_PART_LEVELS = {
  1: { threshold: 0, name: '初心者', color: '#94a3b8' },
  2: { threshold: 100, name: '見習い', color: '#3b82f6' },
  3: { threshold: 300, name: '中級者', color: '#10b981' },
  4: { threshold: 600, name: '上級者', color: '#f59e0b' },
  5: { threshold: 1000, name: 'エキスパート', color: '#ef4444' },
  6: { threshold: 1500, name: 'マスター', color: '#8b5cf6' },
  7: { threshold: 2500, name: 'レジェンド', color: '#ec4899' }
};

// 部位別の種目マッピング
export const BODY_PART_MAPPING = {
  '上半身': ['push_up', 'pull_up', 'dips'],
  '体幹': ['sit_up', 'plank', 'leg_raise'],
  '下半身': ['squat', 'lunge', 'calf_raise'],
  '全身': ['burpee', 'mountain_climber', 'jumping_squat'],
  '有酸素': ['walking', 'running'],
  'その他': ['stretch']
};

// 総回数からレベルを計算
export const calculateLevel = (totalReps) => {
  const levels = Object.entries(BODY_PART_LEVELS).reverse();
  for (const [level, data] of levels) {
    if (totalReps >= data.threshold) {
      return {
        level: parseInt(level),
        ...data,
        progress: totalReps,
        nextThreshold: levels[levels.length - parseInt(level)] ? 
          levels[levels.length - parseInt(level)][1].threshold : null
      };
    }
  }
  return {
    level: 1,
    ...BODY_PART_LEVELS[1],
    progress: totalReps,
    nextThreshold: BODY_PART_LEVELS[2].threshold
  };
};

// 部位別の総回数を計算
export const calculateBodyPartStats = (records) => {
  const bodyPartStats = {
    '上半身': 0,
    '体幹': 0, 
    '下半身': 0,
    '全身': 0,
    '有酸素': 0,
    'その他': 0
  };

  records.forEach(record => {
    record.exercises.forEach(exercise => {
      const exerciseData = EXERCISE_LIST.find(ex => ex.name === exercise.name);
      if (exerciseData) {
        const category = exerciseData.category;
        bodyPartStats[category] += exercise.reps || 0;
      }
    });
  });

  // 各部位のレベル情報を追加
  Object.keys(bodyPartStats).forEach(bodyPart => {
    const totalReps = bodyPartStats[bodyPart];
    bodyPartStats[bodyPart] = {
      totalReps,
      ...calculateLevel(totalReps)
    };
  });

  return bodyPartStats;
};

// キーワードから種目を検索
export const findExerciseByKeyword = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  
  for (const exercise of EXERCISE_LIST) {
    if (exercise.keywords.some(k => k.includes(lowerKeyword) || lowerKeyword.includes(k))) {
      return exercise;
    }
  }
  
  return null;
};

// IDから種目を取得
export const getExerciseById = (id) => {
  return EXERCISE_LIST.find(exercise => exercise.id === id);
};

// 名前から種目を取得
export const getExerciseByName = (name) => {
  return EXERCISE_LIST.find(exercise => exercise.name === name);
};

// カスタム種目を追加する関数
export const addCustomExercise = async (exerciseName) => {
  try {
    // LLMに種目の分析を依頼
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          {
            role: "system",
            content: `あなたは筋力トレーニングの専門家です。与えられた運動名から以下の情報をJSON形式で返してください：
{
  "bodyPart": "上半身" | "下半身" | "体幹" | "全身" | "有酸素" | "その他",
  "targetMuscle": "主要な筋肉部位",
  "icon": "適切な絵文字",
  "unit": "回" | "分" | "秒"
}

体の部位の分類：
- 上半身：腕立て伏せ、懸垂、腕の運動など
- 下半身：スクワット、ランジ、脚の運動など  
- 体幹：プランク、腹筋、背筋など
- 全身：バーピー、マウンテンクライマーなど
- 有酸素：ランニング、ジョギングなど
- その他：ストレッチ、その他の運動`
          },
          {
            role: "user",
            content: `運動名: ${exerciseName}`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error('AI分析に失敗しました');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // JSONを抽出
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI分析結果の解析に失敗しました');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // 新しい種目オブジェクトを作成
    const customExercise = {
      id: `custom_${Date.now()}`,
      name: exerciseName,
      category: analysis.bodyPart,
      targetMuscle: analysis.targetMuscle,
      defaultWeight: 0,
      unit: analysis.unit,
      icon: analysis.icon,
      isCustom: true,
      keywords: [exerciseName] // カスタム種目は名前のみをキーワードに
    };
    
    return customExercise;
    
  } catch (error) {
    console.error('カスタム種目の分析エラー:', error);
    // フォールバック：デフォルト値で作成
    return {
      id: `custom_${Date.now()}`,
      name: exerciseName,
      category: '上半身',
      targetMuscle: '全身',
      defaultWeight: 0,
      unit: '回',
      icon: '🏃‍♂️',
      isCustom: true,
      keywords: [exerciseName]
    };
  }
};