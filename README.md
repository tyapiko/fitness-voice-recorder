# WorkoutVoice - 筋トレ記録アプリ

音声入力で筋トレ記録を簡単に管理できるWebアプリケーションです。

## 特徴

- 🎤 **音声入力**: Web Speech APIを使用した日本語音声認識
- 🤖 **AI構造化**: ローカルLLMによる自然言語の構造化データ変換
- 💾 **ローカル保存**: IndexedDBを使用したブラウザ内データ保存
- 📱 **レスポンシブUI**: モダンなWebインターフェース

## システム要件

- **Docker Desktop** 4.0以上
- **ローカルLLM**: LM Studio (localhost:1234で稼働)
- **ブラウザ**: Chrome 100以上 / Firefox 100以上
- **メモリ**: 8GB以上推奨

## セットアップ

### 1. ローカルLLMの準備

1. [LM Studio](https://lmstudio.ai/)をダウンロード・インストール
2. 日本語対応モデルをダウンロード（推奨: Qwen2.5-7B-Instruct）
3. ローカルサーバーをポート1234で起動

### 2. アプリケーションの起動

```bash
# リポジトリのクローン
git clone <repository-url>
cd steady_app

# Dockerコンテナの構築・起動
docker-compose up --build

# ブラウザでアクセス
open http://localhost:3000
```

## 使い方

1. **録音開始**: 🎤ボタンをクリックして音声入力開始
2. **音声入力**: 「ベンチプレス60キロ10回3セット」のように話す
3. **保存**: 認識されたテキストを確認して「保存」ボタンをクリック
4. **記録確認**: 保存された記録が自動的に一覧表示される

### 音声入力例

```
- "ベンチプレス60kg10回3セット"
- "スクワット80キロ8レップス4セット" 
- "腕立て伏せ20回を3セット"
- "デッドリフト100kg5回5セット"
```

## プロジェクト構造

```
steady_app/
├── docker-compose.yml          # Docker設定
├── README.md                   # このファイル
└── app/                        # Reactアプリケーション
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # エントリーポイント
        ├── App.jsx             # メインコンポーネント
        ├── index.css           # グローバルスタイル
        ├── components/         # Reactコンポーネント
        │   ├── VoiceRecorder.jsx
        │   ├── RecordList.jsx
        │   └── RecordItem.jsx
        ├── hooks/              # カスタムフック
        │   ├── useSpeechRecognition.js
        │   ├── useLLM.js
        │   └── useIndexedDB.js
        └── utils/              # ユーティリティ
            ├── llmClient.js
            └── dbSchema.js
```

## データ形式

### 記録データ構造
```javascript
{
  id: "uuid",
  timestamp: "2024-12-18T10:30:00Z",
  raw_input: "ベンチプレス60kg10回3セット",
  exercises: [
    {
      name: "ベンチプレス",
      weight: 60,
      weight_unit: "kg", 
      reps: 10,
      sets: 3,
      volume: 1800
    }
  ],
  created_at: "2024-12-18T10:30:00Z",
  updated_at: "2024-12-18T10:30:00Z"
}
```

## トラブルシューティング

### 音声認識が動作しない
- ブラウザがマイクへのアクセスを許可しているか確認
- Chrome/Firefoxの最新版を使用
- HTTPSまたはlocalhostでアクセス

### LLM接続エラー
- LM Studioが起動してポート1234でサーバーが稼働しているか確認
- CORSエラーの場合、LM Studioの設定でCORSを有効化

### データが保存されない  
- ブラウザでIndexedDBが有効になっているか確認
- プライベートモードでは動作しない場合があります

## 開発

### 開発モード起動
```bash
docker-compose up
```

### ログの確認
```bash
docker-compose logs -f app
```

### コンテナの再構築
```bash
docker-compose down
docker-compose up --build
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。