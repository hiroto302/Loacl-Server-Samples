/* NOTE: 「JWTトークンの検証ロジック」をここに集約します。
  これで他のAPIを作る時も authenticateToken を足すだけで認証機能がつきます。*/


import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../config/env.js';

// Bearer認証（JWT検証）を行うミドルウェア
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // 検証成功時、リクエストオブジェクトにユーザー情報を追加
    req.user = decoded;
    // 次の処理（コントローラー）へ進む
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
