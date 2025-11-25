# Refactored Authentication Server

Node.js (Express) を使用した認証サーバーのリファクタリング版です。
HTTP通信の基礎、Basic認証、Bearer認証 (JWT) の仕組みを学習しつつ、実務的な設計思想（責務の分離、環境変数の管理など）を取り入れた実装になっています。

## 📖 プロジェクト概要

以前作成した学習用サーバー (`my_auth_server`) をベースに、保守性と拡張性を高めるためのリファクタリングを行いました。
Unityなどのクライアントアプリケーションに対して、以下の認証機能を提供します。

* **Basic認証**: 標準的なHTTPヘッダーによる認証
* **Bearer認証 (JWT)**: JSON Web Token を用いたトークンベース認証
* **API保護**: ミドルウェアによるアクセス制御

## 📂 ディレクトリ構成

MVCモデルに近い構成で、役割ごとにファイルを分割しています。

```text
my_auth_server_refactor/
├── .env                      # 環境変数（秘密鍵やポート番号などの機密情報）
├── package.json              # プロジェクト設定と依存パッケージ
├── server.js                 # サーバー起動のエントリーポイント
└── src/
    ├── app.js                # Express設定とルーティングの統合
    ├── config/
    │   └── env.js            # 環境変数の読み込み設定
    ├── controllers/          # ビジネスロジック（リクエスト処理の実体）
    │   ├── authController.js
    │   └── userController.js
    ├── middlewares/          #  認証チェックなどの共通処理
    │   └── authMiddleware.js
    ├── models/               # データモデル（現在はメモリ上の配列データ）
    │   └── userModel.js
    └── routes/               # APIエンドポイントの定義
        ├── authRoutes.js
        └── userRoutes.js
```
<br></br>

# 🚀 セットアップ手順
### 1. 前提条件
Node.js がインストールされていること

### 2. インストール
プロジェクトのルートディレクトリで以下のコマンドを実行し、必要なパッケージをインストールします。
```Bash:
npm install
```

### 3. 環境変数の設定
ルートディレクトリに .env ファイルを作成し、以下の内容を記述してください。 ※ .env は .gitignore に含まれるため、リポジトリにはコミットしません。

```:.env
PORT=3000
SECRET_KEY=your-secret-key-change-this
```

### 4. サーバー起動
以下のコマンドでサーバーを起動します。

```Bash:
node server.js
```
起動に成功すると、コンソールにアクセス可能なURL一覧が表示されます。
<br></br>

# 🛠️ リファクタリング内容
学習用のモノリシックなコード（1つのファイルへの記述）から、以下の改善を行いました。

### 1. 責務の分離 (Separation of Concerns)
Before: server.js に全ての処理（設定、ルーティング、ロジック、データ）が記述されていた。

After: routes（URL定義）、controllers（処理）、models（データ）に分割。コードの見通しが良くなり、修正箇所が明確になった。

### 2. セキュリティの向上 (Environment Variables)
Before: コード内に SECRET_KEY や PORT が直書きされていた。

After: dotenv を導入し、.env ファイルで管理するように変更。機密情報がコードベースから排除された。

### 3. ミドルウェアの活用 (DRY原則)
Before: 各APIエンドポイント内で都度トークン検証を行っていた。

After: authMiddleware.js を作成し、検証ロジックを共通化。ルート定義に挟むだけで認証を適用できるようになった。

### 4. コードの近代化
Before: body-parser ライブラリを使用。

After: Express標準のパーサー (express.json()) に置き換え、依存関係を削減。ES Modules (import/export) 形式で統一。
<br></br>

# 📡 API エンドポイント一覧

### 🔓 公開エンドポイント (認証不要)

#### `GET /basic-auth`
- **説明**: Basic認証の動作確認用

#### `POST /login`
- **説明**: ログインしてJWTトークンを取得

### 🔒 保護されたエンドポイント (Bearer認証が必要)

ヘッダーに `Authorization: Bearer <token>` が必要です。

#### `GET /user/protected`
- **説明**: 認証済みユーザー専用のデータを取得

#### `GET /user/profile`
- **説明**: ユーザー自身のプロフィール情報を取得

<br></br>

# ⚠️ クライアント実装時の注意点
リファクタリングに伴い、一部のURL構造が変更されています。Unity側の UnityWebRequest のURL指定を以下のように修正してください。

旧: http://localhost:3000/protected

新: http://localhost:3000/user/protected

旧: http://localhost:3000/user/profile

新: http://localhost:3000/user/profile (変更なし、構成上 /user 配下に配置)

<br></br>

# サーバー処理フロー解説 (Server Process Flow)

`node server.js` コマンド実行後のサーバー内部の挙動と、リクエスト処理の流れ（メンタルモデル）についての解説です。

## 🔄 処理の詳細フロー

### 1. 起動シーケンス (Startup Sequence)
コマンド `node server.js` を実行した直後の処理です。

1.  **Bootstrap**: Node.js が `server.js` を読み込む。
2.  **Configuration**: 環境変数 (`.env`) を読み込み、設定値を確定させる。
3.  **Initialization**: `app.js` が読み込まれ、ミドルウェア設定とルーティング定義（`routes`）がメモリ上に展開される。
4.  **Listening**: `app.listen()` が実行され、指定ポートで HTTP リクエストの待受状態（イベントループ）に入る。
    * *これ以降、サーバーは終了せず、リクエストが来るたびに反応します。*

### 2. 保護リソースへのアクセス (Protected Resource Flow) の例
**URL**: `GET /user/protected` (要 Bearer Token)
```mermaid
  User (Client)
    │
    │ Request + Token
    ▼
  App (app.js)
    │
    │ Route Match
    ▼
  UserRoute (userRoutes.js)
    │
    │ Check!
    ▼
  Guard (authMiddleware) ─── Invalid? ──▶ [ 403 Forbidden ]
    │
    │ Valid?
    ▼
  OK (Next)
    │
    │ Call
    ▼
  UserCtrl (userController.getProtectedData)
    │
    │ Response
    ▼
  User (Client)
```