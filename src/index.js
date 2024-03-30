// import AFRAME from './components/aframe';
import './components/aframe';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';
import './components/aframe-keyboard-controll-controller';
import './components/text-geometry/index';
import './components/text-sequence';
// "@types/aframe": "^1.2.6",
console.log("my code is starting");
AFRAME.registerComponent('modify-materials', {
  init: function () {
    // Wait for model to load.
    this.el.addEventListener('model-loaded', () => {
      // Grab the mesh / scene.
      const obj = this.el.getObject3D('mesh');
      // Go over the submeshes and modify materials we want.
      obj.traverse(node => {
        if (node.name.indexOf('ship') !== -1) {
          node.material.color.set('red');
        }
      });
    });
  }
});

var sceneEl = document.querySelector('a-scene');

AFRAME.registerComponent('scale-on-mouseenter', {
  schema: {
    to: { default: { x: 3, y: 3, z: 3 }, type: 'vec3' }
  },

  init: function () {
    var data = this.data;
    console.log(data);
    var el = this.el;
    var old_scale = el.object3D.scale.clone();
    this.el.addEventListener('mouseenter', function () {
      el.object3D.scale.copy(data.to);// 提升性能
    });
    this.el.addEventListener('mouseleave', function () {
      el.object3D.scale.copy(old_scale);
    });
  }
});

function textAnimation(textEl, index, position, data) {
  const baseDelay = 500; // 基础延迟
  setTimeout(() => {
    textEl.setAttribute('animation', {
      property: 'material.opacity',
      to: 1,
      dur: 500
    });
  }, index * 200 + baseDelay); // 延迟确保逐字显示的效果
}
console.log("my code is running");