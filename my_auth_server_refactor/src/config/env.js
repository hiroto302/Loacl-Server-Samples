import dotenv from 'dotenv';

// .env ファイルから環境変数をロード
dotenv.config();

// 環境変数から必要な設定値を取得
export const PORT = process.env.PORT || 3000;
export const SECRET_KEY = process.env.SECRET_KEY || 'default_dev_secret_key';