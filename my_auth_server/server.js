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
// * HTTP GET method と Endpoint: /basic-auth を実装.
// request と response を引数に取り、それを扱ったコールバック関数を定義していく.
app.get('/basic-auth', (req, res) => {

    /* Authorization Header (認証ヘッダー) の取得
    * client が送信した Authorization ヘッダーを取得する.
      - client 側 Unity の設定 :
        request.SetRequestHeader("Authorization", "Basic " + encodedAuth);
      - server 側 Node.js の設定 :
        const authHeader = req.headers.authorization;
        受け取った値の例:
          req.headers.authorization = "Basic dGVzdHVzZXI6dGVzdHBhc3M="
    */
    const authHeader = req.headers.authorization;

    //  * status(401) : Authorization ヘッダーが存在しない、または Basic で始まらない場合は認証エラーを返す.
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        // エラーレスポンスに WWW-Authenticate ヘッダーを追加. ブラウザに「Basic認証が必要ですよ」と伝える特別なヘッダー??
        res.setHeader('WWW-Authenticate', 'Basic realm="My API"');
        // エラーメッセージをJSON形式で返す
        return res.status(401).json({ error: 'Authentication required' });
    }

    /*  Basic認証のデコード
    * 全体の流れの理解
      1. Unity側: username + password を Base64エンコードして送信
      2. Server側: 受け取ったBase64文字列をデコードして、username と password を取り出す
      3. 検証: 取り出した値でユーザー認証を行う

    [Unity側(エンコード)]
      string auth = username + ":" + password;           // "testuser:testpass"
          ↓ Encoding.UTF8.GetBytes(auth)
      byte[] bytes = [0x74, 0x65, 0x73, 0x74, ...]       // バイト配列
          ↓ Convert.ToBase64String(bytes)
      string encodedAuth = "dGVzdHVzZXI6dGVzdHBhc3M="    // Base64文字列
          ↓ "Basic " + encodedAuth
      "Basic dGVzdHVzZXI6dGVzdHBhc3M="                   // 送信

    [Server側(デコード)]
      "Basic dGVzdHVzZXI6dGVzdHBhc3M="                   // 受信
          ↓ .split(' ')[1]
      "dGVzdHVzZXI6dGVzdHBhc3M="                         // Base64部分抽出
          ↓ Buffer.from(..., 'base64')
      [0x74, 0x65, 0x73, 0x74, ...]                      // バイト配列
          ↓ .toString('utf-8')
      "testuser:testpass"                                // UTF-8文字列
          ↓ .split(':')
      ["testuser", "testpass"]                           // 配列
          ↓ 分割代入
      username = "testuser", password = "testpass"       // 個別変数

    * HTTP の制約 と Base64エンコードの必要性
    HTTP通信では、データを送る際に「ボディ(Body)」と「ヘッダー(Header)」の2つの方法がある。
      - ボディ(Body)の場合
        バイナリデータ(バイト配列)をそのまま送れる
        画像、音声、任意のバイナリデータOK

      - ヘッダー(Header)の場合
        テキスト(ASCII文字)しか送れない
        バイナリデータを直接入れると壊れる

    なので、ヘッダーでバイナリデータを送る場合は、Base64エンコードして
    ASCII文字列に変換してから送る必要がある！

    * Base64とは何か?
    「バイナリデータをテキスト(文字)として表現する方式」
    バイナリデータを64種類の安全な文字(A-Za-z0-9+/)だけで表現する方式です。
    HTTPヘッダーやURL、メールなど「印刷可能なASCII文字しか扱えない場所」でバイナリを送るために使われます。
    例: "testuser:testpass" をUTF-8でバイト配列に変換後、Base64エンコードすると "dGVzdHVzZXI6dGVzdHBhc3M=" になる

    「UTF-8でエンコードすることで、英語も日本語もバイト配列に変換できる。
      ただし日本語部分はASCII範囲外のバイト値(0x80以上)になる。
      そのバイト配列をBase64でエンコードすることで、すべて印刷可能なASCII文字だけで表現でき、
      HTTPヘッダーで安全に送れるようになる」

    * 印刷可能(Printable)とは?
      「画面に表示できる、目に見える文字」という意味。

  * バイト配列とは？ ASCIIとは？ UTF-8とは？
    参照: https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1441922874

    コンピュータは文字を直接扱えないため、文字を数値(バイト)に変換して扱います。

    * ASCII(アスキー)
      英数字や記号など、基本的な文字を7ビット(128文字、0x00〜0x7F)で表現する文字コード体系です。
      例: 'A' は 65 (0x41)、'B' は 66 (0x42)、'0' は 48 (0x30)
      * ASCII文字の分類
        ASCII文字(0x00〜0x7F)は、大きく2つに分類されます:
        1. 制御文字(Control Characters) - 印刷不可能な文字
          コード: 0x00〜0x1F、0x7F
          目に見えない、画面に表示されない
          特殊な制御を行う文字
          例: 改行 (0x0A)、タブ (0x09)、キャリッジリターン (0x0D)
        2. 印刷可能文字(Printable Characters) - 画面に表示される文字
          コード: 0x20〜0x7E
          目に見える、画面に表示される
          英数字、記号、スペースなど
          例: 'A' (0x41)、'a' (0x61)、'0' (0x30)、スペース (0x20)、記号 (0x21〜0x2F)

    * UTF-8(ユーティーエフエイト)
      世界中のすべての文字(日本語、中国語、絵文字など)を扱うための可変長エンコーディング方式です。
      1文字を1〜4バイトで表現します。
      - ASCII範囲の文字(0x00〜0x7F)は1バイトで、ASCIIと完全に同じ
      - 日本語などはマルチバイト(2〜4バイト)で表現
      例: 'A' は 0x41 (1バイト、ASCIIと同じ)、日本語の「あ」は 0xE3 0x81 0x82 (3バイト)

    * バイト配列
      文字列をバイト(数値)の配列として表現したものです。
      例: "ABC" を UTF-8 でバイト配列にすると [0x41, 0x42, 0x43]

    まとめ:
      - バイト配列: 文字を数値(バイト)の配列として表現したもの
      - ASCIIとUTF-8: 文字とバイトの対応関係を定義したルール(文字エンコーディング)
      - ASCIIは128文字のみ、UTF-8はASCIIを含むすべての文字に対応
      - UTF-8のASCII範囲(0x00〜0x7F)はASCIIと完全互換
      - Base64: 任意のバイト配列を、印刷可能なASCII文字(A-Za-z0-9+/=)だけで表現する方式

    HTTPヘッダーとの関係:
      - HTTPヘッダーは印刷可能なASCII文字(0x20〜0x7E)のみ使用可能
      - バイナリデータや0x7F以上のバイトは直接送れない
      - そのため、バイナリや特殊文字をヘッダーで送る場合はBase64エンコードが必要

    * Base64デコードの具体的な処理
      * 1. authHeader.split(' ')[1] : Base64部分を抽出！
          authHeaderの中身 → "Basic dGVzdHVzZXI6dGVzdHBhc3M="

          split(' ') → スペースで分割 → ["Basic", "dGVzdHVzZXI6dGVzdHBhc3M="] 配列になる

          Base64部分を抽出
          [1] → 配列の2番目(インデックス1)を取得。つまり、
          "Basic dGVzdHVzZXI6dGVzdHBhc3M=" から "dGVzdHVzZXI6dGVzdHBhc3M=" 部分を取得

          base64Credentials = "dGVzdHVzZXI6dGVzdHBhc3M=" となる。

      * 2. Buffer.from(..., 'base64').toString('utf-8') : Base64デコード + UTF-8変換
          Base64文字列をデコードして "testuser:testpass" の形式に変換

        2-1: Base64 → バイト配列
          Buffer.from(base64Credentials, 'base64') :
            "dGVzdHVzZXI6dGVzdHBhc3M=" をBase64からバイト配列に変換

        2-2: バイト配列 → UTF-8文字列
          .toString('utf-8')  :
            バイト配列をUTF-8エンコードされた文字列に変換して

      *  3.  split(':')
          username と password の分割
          "testuser:testpass" を ':' で分割して、username と password を取得
    */

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