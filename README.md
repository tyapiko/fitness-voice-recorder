# WorkoutVoice - 自重トレーニング記録アプリ

音声入力で自重トレーニング記録を簡単に管理できるWebアプリケーションです。

## 特徴

- 🎤 **音声入力**: Web Speech APIを使用した日本語音声認識
- 🤖 **AI構造化**: LLMによる自然言語の構造化データ変換
- 💾 **ローカル保存**: IndexedDBを使用したブラウザ内データ保存
- 📱 **レスポンシブUI**: モバイルファーストなWebインターフェース
- 📊 **進捗管理**: レベルシステムとチャート表示
- 📅 **履歴機能**: カレンダーベースの記録管理
- 🔧 **カスタム種目**: AI分析による独自トレーニング追加

## システム要件

### 開発環境
- **Docker Desktop** 4.0以上
- **ローカルLLM**: LM Studio (localhost:1234で稼働)
- **ブラウザ**: Chrome 100以上 / Firefox 100以上
- **メモリ**: 8GB以上推奨

### 本番環境
- **クラウド**: Google Cloud Platform (推奨)
- **LLM API**: OpenAI GPT-4/3.5-turbo、Google Gemini、またはClaude
- **HTTPS**: Web Speech API要件
- **ブラウザ**: Chrome/Firefox/Safari モダンブラウザ

## セットアップ

### 開発環境のセットアップ

#### 1. ローカルLLMの準備

1. [LM Studio](https://lmstudio.ai/)をダウンロード・インストール
2. 日本語対応モデルをダウンロード（推奨: Qwen2.5-7B-Instruct）
3. ローカルサーバーをポート1234で起動

#### 2. アプリケーションの起動

```bash
# リポジトリのクローン
git clone <repository-url>
cd steady_app

# Dockerコンテナの構築・起動
docker-compose up --build

# ブラウザでアクセス
open http://localhost:3000
```

### 本番環境へのデプロイ

#### 1. 環境変数の設定

```bash
# .env.productionファイルを作成
cp app/.env.example app/.env.production

# 環境変数を編集（OpenAI APIキーなど）
nano app/.env.production
```

#### 2. Google Cloud Platformでのデプロイ

```bash
# GCPプロジェクトIDを設定
export GCP_PROJECT_ID=your-project-id

# インタラクティブデプロイ
./deploy.sh

# または直接Cloud Runにデプロイ
gcloud builds submit --config=cloudbuild.yaml .
```

#### 3. 他のプラットフォームでのデプロイ

```bash
# 本番用Dockerイメージのローカルビルド
docker-compose -f docker-compose.prod.yml up --build

# 任意のコンテナプラットフォームにデプロイ可能
# (AWS ECS, Azure Container Instances, etc.)
```

## 使い方

1. **録音開始**: 🎤ボタンをクリックして音声入力開始
2. **音声入力**: 「腕立て伏せ20回3セット」「スクワット30回」のように話す
3. **保存**: 認識されたテキストを確認して「保存」ボタンをクリック
4. **記録確認**: 保存された記録が自動的に一覧表示される

### 音声入力例（自重トレーニング）

```
- "腕立て伏せ20回3セット"
- "スクワット30回2セット" 
- "腹筋50回"
- "プランク60秒"
- "懸垂5回"
- "8月24日にランニング30分"
```

### 主な機能

#### 📊 Record Tab（記録）
- 音声入力でのトレーニング記録
- 今日の進捗表示
- リアルタイム音声認識

#### 📈 Progress Tab（進捗）
- 体部位別レベルシステム（初心者→レジェンド）
- 週間チャート表示
- 継続ストリーク機能

#### 📅 History Tab（履歴）
- カレンダー形式での記録閲覧
- 過去の記録編集・削除
- 月間統計表示

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

### 開発コマンド
```bash
# 開発モード起動
docker-compose up

# ログの確認
docker-compose logs -f app

# コンテナの再構築
docker-compose down
docker-compose up --build
```

### 本番確認
```bash
# 本番用ビルドのローカルテスト
docker-compose -f docker-compose.prod.yml up --build

# 本番用環境変数での動作確認
docker-compose -f docker-compose.prod.yml --env-file app/.env.production up
```

### デプロイメント
```bash
# GCPへのデプロイ（インタラクティブ）
./deploy.sh

# Cloud Runへの直接デプロイ
gcloud builds submit --config=cloudbuild.yaml .

# App Engineへのデプロイ
gcloud app deploy app.yaml
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。