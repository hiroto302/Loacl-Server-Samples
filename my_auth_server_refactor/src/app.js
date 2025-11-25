// アプリケーション統合クラス
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// body-parserの代わりに標準機能を使用
app.use(express.json());

// ルーティングのマウント
app.use('/', authRoutes);      // /login, /basic-auth
app.use('/user', userRoutes);  // /user/protected, /user/profile

export default app;