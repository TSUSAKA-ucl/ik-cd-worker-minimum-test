# robot-loaderとik-cd-workerでロボットアームを動かす最低限のHTML
このパッケージにはJavaScriptのソースファイルもNext.jsもReactもありません。
単に[`index.html`](./index.html)にHTMLがベタ書きしてあるだけです。

## ロボット定義のコピー
まず `./public/gen3-lite/`ディレクトリの下にURDFから作成したロボット定義をコピーします。
ロボット定義を作成したディレクトリを仮に`~/Robots/Kortex`とします。
```
ThisDir=`pwd P`
cd ~/Robots/Kortex
./copy-assets.sh . "$ThisDir"/public/gen3-lite
cd -
```
これでコピーできました。`ls -l ./public/gen3-lite/`などでコピーされたファイルの
種類・サイズ等を確認してください。

## 外部パッケージのインストールとバンドルとdevサーバー起動
### `npm`の場合
1. インストール  
   ```
   npm install
   ```
2. workerのコピー
   ```
   npx copy-assets
   ```
3. ビルド・バンドル
   ```
   npm run build
   ```
4. サーバーによる公開
   ```
   cd dist && python3 -m http.server
   ```
   devサーバーで偽証明書でhttps公開
   ```
   npm run dev
   ```
   devサーバーを使わない場合は、`@vitejs/plugin-basic-ssl`パッケージと
   `vite.config.js`ファイルは不要です

### `pnpm`の場合
```
pnpm install && npx copy-assets
pnpm build && pnpm dev
```

## VRロボットの動かし方と説明

1. ブラウザで`https://localhost:5173/`あるいは、このマシンのIPでアクセスする
2. VRモードに移行して右コントローラーのトリガーを引いて動かす

以下のAFrameコンポーネントは、VRコントローラーでロボットを操作するために用意されているもの
ユーザーインターフェースを開発・変更したい場合は取り替えれば良い。
* `arm-motion-ui` さらに以下のものは`arm-motion-ui`のために用意されている
* `robot-registry`
* `thumbstick-menu`
* `target-selector`
* `event-distributor`

以下のAFrameコンポーネントはロボットのモデルを読み込み絵を描き手先位置姿勢モード
あるいは関節角モードで動かすために必要なAFrameコンポーネントで、ロボット定義ファイルと
ペアで使用されるロボット座標変換のコア
* `robot-loader`
* `ik-worker`
* `reflect-worker-joints`

さらにロボットの動きのモードや表示をモディファイするために以下のコンポーネントも利用している
* `exact_solution`
* `reflect-joint-limit`

他はAFRameに元々組み込まれているコンポーネントである

## 注意事項
[`ik-cd-worker`](https://github.com/TSUSAKA-ucl/ik-cd-worker.git)と
[`robot-loader`](https://github.com/TSUSAKA-ucl/robot-loader.git)のバージョンが
[`package.json`](./package.json)記述のもの以上であることを確認してください。
古いバージョンでは不具合が発生することがあります(発生しない組合せもあります)。

gitリポジトリからは敢えて`package-lock.json`と`pnpm-lock.yaml`は抜いてあります
