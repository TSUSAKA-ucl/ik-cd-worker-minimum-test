# robot-loaderとik-cd-workerでロボットアームを動かす最低限のHTML
ロボット定義は[`index.html`](./index.html)にHTMLがベタ書き。
動画受信のWHEPでのシグナリングと動画とWebXRカメラとの相対位置の設定の短いJSは
パッケージルートに置いてある。

## 外部パッケージのインストールとバンドルとdevサーバー起動

### `pnpm`の場合
```
pnpm install && npx copy-assets
pnpm build && pnpm dev
```

### サーバー認証について
HTTPS サーバーのcertとkeyは、シグナリング(WHEP)を行っている**MediaMTXと
同じものを使用する必要**がある。`mkcert`で自前のCAを用いて作っている場合、
`~/.local/share/ssl/`の下に`*.pem`,`*-key.pem`という名前で置いてあれば
[`./localcerts/copy-certs.sh`](./localcerts/copy-certs.sh)が
`vite.config.js`が示す所定の位置にコピーしてきて`pnpm dev`だけで
適切な参照ができる
