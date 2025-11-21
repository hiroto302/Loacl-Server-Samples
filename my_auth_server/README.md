# 初期セットアップ手順  (既存のものを使用する場合はskp)
##  適当なフォルダーを作成
```
mkdir my_auth_server
cd my_auth_server
```

## 初期化
```
npm init -y
```

## 必要なパッケージをインストール
```
npm install express jsonwebtoken body-parser
```

## サーバー側の実装
server.jsを実装

# 初期セットアップ済み以降
## サーバ起動
```
node server.js
```