// 実際の処理（ロジック）を書く場所です。ルーティング定義と分離する

import jwt from 'jsonwebtoken';
import { users } from '../models/userModel.js';
import { SECRET_KEY } from '../config/env.js';

// Basic認証の確認用エンドポイント
export const checkBasicAuth = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="My API"');
        return res.status(401).json({ error: 'Authentication required' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({
            authenticated: true,
            user: username,
            message: 'Basic認証成功！'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

// ログイン処理（JWT発行）
export const login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({
        token,
        user: { id: user.id, username: user.username },
        message: 'Login successful'
    });
};