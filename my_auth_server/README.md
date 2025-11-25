# 概要
こちらは、HTTP Methodの検証を作成するための、Server側の実装を行います。
簡易的な最初のサンプルです。
こちらで学べる内容については、同ディレクトリの[LEARNING_SUMMARY](https://github.com/hiroto302/Loacl-Server-Samples/blob/main/my_auth_server/LEARNING_SUMMARY.md)を参照してください。

## 関連プロジェクト
- **Client側実装**: [Unity HTTP Sample](https://github.com/hiroto302/Unity_LTS2021_3D/tree/master/Assets/Scripts/UnityWebRequest) を参照してください
  - このサーバーと連携して動作するUnityクライアントの実装例
    - UnityWebRequest Scene
    - Sample_4_BasicAuth.cs & Sample_5_BearAuth.cs


## 初期セットアップ手順
###  適当なフォルダーを作成
```
mkdir my_auth_server
cd my_auth_server
```

### 初期化
プロジェクトを初期化してpackage.jsonを作成。
デフォルト設定で作成。
```
npm init -y
```

### 必要なパッケージをインストール
```
npm install express jsonwebtoken body-parser
```
### サーバー側の実装
server.jsを実装


## 初期セットアップ済み以降
### サーバ起動
```
node server.js
```


# 今回使用する node module について

### express
Webサーバーを簡単に作るためのフレームワークです。HTTPリクエストを受け取って、レスポンスを返す処理を簡潔に書けます。

ルーティングを定義例（どのURLにアクセスされたら何を返すかの定義例）
```javascript:
app.get('/basic-auth', (req, res) => { ... })
```
使用例
```javascript:
const express = require('express');

const app = express();
// ルート（エンドポイント）を定義
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.listen(3000);
```

### jsonwebtoken
JWT(JSON Web Token)という認証トークンを生成・検証するためのライブラリです。Bearer認証で使うトークンを作成・チェックします。
```javascript:
const token = jwt.sign({ userId: 1 }, SECRET_KEY, { expiresIn: '1h' });
```
使用例
```javascript:
const jwt = require('jsonwebtoken');

// トークン生成
const token = jwt.sign({ userId: 123 }, 'secret-key', { expiresIn: '1h' });

// トークン検証
const decoded = jwt.verify(token, 'secret-key');
```

### body-parser
HTTPリクエストのボディ（本文）を解析してくれるミドルウェアです。JSONデータを受け取る時に使います。req.bodyからJSONデータを取得できたします。
```javascript:
app.use(bodyParser.json());
```
使用例
```javascript:
const bodyParser = require('body-parser');
app.use(bodyParser.json());  // これがないとreq.bodyが使えない

app.post('/login', (req, res) => {
    console.log(req.body);  // { username: "testuser", password: "testpass" }
});
```
補足: 最近のExpressでは、express.json()で代替できるため、body-parserは省略可能です。

