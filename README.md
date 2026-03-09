# robot-loaderとik-cd-workerでロボットアームを動かす最低限のHTML
このパッケージにはJavaScriptのソースファイルもNext.jsもReactもありません。
単に[`index.html`](./index.html)にHTMLがベタ書きしてあるだけです。

## ロボット定義のコピー
まず `./public/gen3-lite/`ディレクトリの下にURDFから作成したロボット定義をコピーします。
ロボット定義を作成したディレクトリを仮に`~/Robots/Kortex`とします。
```
pushd ~/Robots/Kortex
cd ./gen3lite6DOF
../copy-assets.sh . ~/Test/Release/testKinova4/public/gen3-lite
cd ../gen3liteGripperL/
../copy-assets.sh . ~/Test/Release/testKinova4/public/gen3-lite-gripper-l
cd ../gen3liteGripperR/
../copy-assets.sh . ~/Test/Release/testKinova4/public/gen3-lite-gripper-r
popd
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

# Creating the arm and gripper models as separate robots
アームとグリッパーを別々のロボットとして作成する手順

0. まずURDFからロボット定義を作成するためのディレクトリを作成します。仮に`~/Robots/Kortex`とします。
   ```
   ThisDir=`pwd`
   cd ~/Robots/Kortex
   ./clone.sh
   xacro `ros2 pkg prefix kortex_description`/share/kortex_description/robots/kinova.urdf.xacro \
     name:=kinova arm:=gen3_lite dof:=6 gripper:=gen3_lite_2f > \
	 kinova-gen3-lite-jazzy.urdf
   ./a/splitUrdfTree.sh kinova-gen3-lite-jazzy.urdf 
   ```
   今回は、`gripper_base_link`をアームとグリッパーの分割点とします。
   `gripper_base_link`のgltfファイルはアーム側とグリッパー側の両方にコピーされますが、
   重複していても問題ありません。グリッパー側を消せば重複はなくなります。
1. アームのロボット定義を作成します。
   ```
   mkdir -p ./gen3lite6DOF && cd gen3lite6DOF
   ../a/extract-joint-and-link-tag.sh ../chain_2.urdf
   ../a/cut-joint-map.sh urdfmap.json --to gripper_base_link
   ../a/extract-joint-and-link-tag.sh ../chain_2.urdf -j urdfmap_cut.json 
   mkdir meshes && cd meshes
   ../../resolve_ros2_paths.sh ../linkmap.json |sort -u |sed -e 's|^file://||' |\
     while read p ; do ln -s "$p"; done
   ../../a/convert-to-gltf.sh *.STL
   cd .. && ../copy-assets.sh . "$ThisDir"/public/gen3-lite
   cd ..
   ```
2. グリッパーLのロボット定義を作成します。
   ```
   mkdir -p ./gen3liteGripperL && cd gen3liteGripperL
   ../a/extract-joint-and-link-tag.sh ../chain_2.urdf
   ../a/cut-joint-map.sh urdfmap.json --from gripper_base_link
   ../a/extract-joint-and-link-tag.sh ../chain_2.urdf -j urdfmap_cut.json 
   mkdir meshes && cd meshes
   ../../resolve_ros2_paths.sh ../linkmap.json |sort -u |sed -e 's|^file://||' |\
     while read p ; do ln -s "$p"; done
   ../../a/convert-to-gltf.sh *.STL
   cd .. && ../copy-assets.sh . "$ThisDir"/public/gen3-lite-gripper-l
   cd ..
   ```
3. グリッパーRのロボット定義を作成します。
   ```
   mkdir -p ./gen3liteGripperR && cd gen3liteGripperR
   ../a/extract-joint-and-link-tag.sh ../chain_1.urdf
   ../a/cut-joint-map.sh urdfmap.json --from gripper_base_link
   ../a/extract-joint-and-link-tag.sh ../chain_1.urdf -j urdfmap_cut.json 
   mkdir meshes && cd meshes
   ../../resolve_ros2_paths.sh ../linkmap.json |sort -u |sed -e 's|^file://||' |\
	 while read p ; do ln -s "$p"; done
   ../../a/convert-to-gltf.sh *.STL
   cd .. && ../copy-assets.sh . "$ThisDir"/public/gen3-lite-gripper-r
   cd ..
   ```
以上でアームとグリッパーを別々のロボットとして作成できました。
[`index.html`](./index.html)に書いてあるように、グリッパーをアームの
子entityとして配置し、グリッパーに`attach-to-another`コンポーネントを
追加すれば、アームの先端(あるいは任意のリンク)にグリッパーを取り付ける
ことができます。さらに`robot-loader`ver.1.1.3以降
(`npm install robot-loader@1.1.3`で更新してください)
では、グリッパーの
ロボット定義に`finger-closer`コンポーネントを追加しておけば、
グリッパーを開閉することもできます。グリッパー開閉のイベントはschemaで
任意に定義できますがデフォルトはB,Aボタンです
