#!/bin/bash

# WorkoutVoice GCPデプロイスクリプト

set -e

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プロジェクト設定の確認
if [ -z "$GCP_PROJECT_ID" ]; then
    log_error "GCP_PROJECT_ID環境変数が設定されていません"
    echo "使用方法: GCP_PROJECT_ID=your-project-id ./deploy.sh"
    exit 1
fi

log_info "GCPプロジェクト: $GCP_PROJECT_ID"

# Google Cloud SDKの認証確認
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    log_error "Google Cloud SDKにログインしていません"
    echo "実行してください: gcloud auth login"
    exit 1
fi

# プロジェクトの設定
log_info "プロジェクトを設定中..."
gcloud config set project $GCP_PROJECT_ID

# APIの有効化
log_info "必要なAPIを有効化中..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 環境変数ファイルの確認
if [ ! -f "app/.env.production" ]; then
    log_warn ".env.productionファイルが見つかりません"
    log_info "app/.env.exampleを参考に作成してください"
fi

# デプロイ方法の選択
echo ""
log_info "デプロイ方法を選択してください:"
echo "1) Cloud Run (推奨)"
echo "2) App Engine"
echo "3) Compute Engine + Docker Compose"
read -p "選択 (1-3): " deploy_choice

case $deploy_choice in
    1)
        log_info "Cloud Runにデプロイ中..."
        gcloud builds submit --config=cloudbuild.yaml .
        
        # デプロイされたURLを表示
        SERVICE_URL=$(gcloud run services describe workout-voice --region=asia-northeast1 --format="value(status.url)")
        log_info "デプロイ完了！"
        log_info "アプリURL: $SERVICE_URL"
        ;;
    2)
        log_info "App Engineにデプロイ中..."
        gcloud app deploy app.yaml --quiet
        
        # デプロイされたURLを表示
        SERVICE_URL=$(gcloud app describe --format="value(defaultHostname)")
        log_info "デプロイ完了！"
        log_info "アプリURL: https://$SERVICE_URL"
        ;;
    3)
        log_info "Compute Engineでのデプロイはmanual setupが必要です"
        log_info "詳細はREADME.mdを参照してください"
        ;;
    *)
        log_error "無効な選択です"
        exit 1
        ;;
esac

echo ""
log_info "デプロイが完了しました！"
log_warn "LLM APIキーの設定を忘れずに行ってください"