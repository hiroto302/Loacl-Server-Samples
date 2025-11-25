import { users } from '../models/userModel.js';

// 保護されたデータへのアクセス
export const getProtectedData = (req, res) => {
    // ミドルウェアでセットされた req.user が使える
    res.json({
        authenticated: true,
        user: req.user,
        message: 'Bearer認証成功！保護されたデータです。',
        secretData: 'TOP SECRET DATA'
    });
};

// ユーザープロフィールの取得
export const getUserProfile = (req, res) => {
    // req.user.userId はミドルウェアがトークンから復元したもの
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: `${user.username}@example.com`,
        createdAt: '2025-01-01'
    });
};