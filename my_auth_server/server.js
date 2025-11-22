import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// シークレットキー（本番では環境変数に保存）
const SECRET_KEY = 'my-secret-key-12345';

// ユーザーデータ（本来はデータベース）
const users = [
    { id: 1, username: 'testuser', password: 'testpass' },
    { id: 2, username: 'admin', password: 'admin123' }
];

// ===== Basic認証のエンドポイント =====
app.get('/basic-auth', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="My API"');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Basic認証のデコード
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // ユーザー検証
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
});

// ===== ログインエンドポイント（トークン発行） =====
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // ユーザー検証
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // JWTトークン生成（有効期限1時間）
    const token = jwt.sign(
        { userId: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
    
    res.json({ 
        token: token,
        user: {
            id: user.id,
            username: user.username
        },
        message: 'ログイン成功！トークンを発行しました'
    });
});

// ===== Bearer認証のエンドポイント =====
app.get('/protected', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // トークン検証
        const decoded = jwt.verify(token, SECRET_KEY);
        
        res.json({ 
            authenticated: true,
            user: decoded,
            message: 'Bearer認証成功！保護されたデータにアクセスできました',
            secretData: 'これは認証されたユーザーだけが見れるデータです'
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// ===== ユーザー情報取得（Bearer認証必要） =====
app.get('/user/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = users.find(u => u.id === decoded.userId);
        
        res.json({ 
            id: user.id,
            username: user.username,
            email: `${user.username}@example.com`,
            createdAt: '2024-01-01'
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
    console.log('\n利用可能なエンドポイント:');
    console.log('- GET  http://localhost:3000/basic-auth (Basic認証)');
    console.log('- POST http://localhost:3000/login (ログイン・トークン取得)');
    console.log('- GET  http://localhost:3000/protected (Bearer認証)');
    console.log('- GET  http://localhost:3000/user/profile (Bearer認証)');
});