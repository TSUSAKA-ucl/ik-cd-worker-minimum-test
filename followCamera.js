// AFrameのカスタムコンポーネント, entityのカメラからの相対位置姿勢を固定する
// schemaで相対位置姿勢を与える

// import AFRAME from 'aframe';
const THREE = window.AFRAME.THREE;

// *****************
// isometry multiplication function isoMultiply(a, b) 
// a = [p, q] where p: THREE.Vector3, q: THREE.Quaternion
function isoMultiply(a, b) {
  const p = a[0];
  const q = a[1];
  const r = b[0];
  const s = b[1];
  const p2 = new THREE.Vector3();
  p2.copy(r);
  p2.applyQuaternion(q);
  p2.add(p);
  const q2 = new THREE.Quaternion();
  q2.copy(q);
  q2.multiply(s);
  return [p2, q2];
}

AFRAME.registerComponent('follow-camera', {
  schema: {
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    rotation: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    quaternion: { type: 'vec4', default: { x: 0, y: 0, z: 0, w: 1 } },
  },

  init: function () {
    const onload = () => {
      this.camera = this.el.sceneEl?.camera.el; // カメラのエンティティを取得
      if (!this.camera) {
	console.warn('Camera entity not found');
      }
    };
    if (this.el.sceneEl?.hasLoaded) {
      onload();
    } else {
      this.el.sceneEl?.addEventListener('loaded', onload);
    }
  },
  update: function () {
    // schemaの値を取得
    if (this.data.position) {
      this.position = new THREE.Vector3(this.data.position.x,
					this.data.position.y,
					this.data.position.z);
    } else {
      this.position = new THREE.Vector3(0, 0, 0);
    }
    if (this.data.quaternion) {
      this.quaternion = new THREE.Quaternion(this.data.quaternion.x,
					     this.data.quaternion.y,
					     this.data.quaternion.z,
					     this.data.quaternion.w);
    } else if (this.data.rotation) {
      const rot = new THREE.Euler(this.data.rotation.x,
				  this.data.rotation.y,
				  this.data.rotation.z);
      this.quaternion = new THREE.Quaternion();
      this.quaternion.setFromEuler(rot);
    } else {
      this.quaternion = new THREE.Quaternion(0, 0, 0, 1);
    }
  },
  tick: function () {
    if (!this.camera) return;
    // カメラの位置姿勢を取得
    const cameraPosition = new THREE.Vector3();
    const cameraQuaternion = new THREE.Quaternion();
    this.camera.object3D.getWorldPosition(cameraPosition);
    this.camera.object3D.getWorldQuaternion(cameraQuaternion);
    // カメラの位置姿勢と相対位置姿勢を掛け合わせる
    const [newPosition, newQuaternion] = isoMultiply(
      [cameraPosition, cameraQuaternion],
      [this.position, this.quaternion]
    );
    // entityの位置姿勢を更新
    this.el.object3D.position.copy(newPosition);
    this.el.object3D.quaternion.copy(newQuaternion);
  }
});
