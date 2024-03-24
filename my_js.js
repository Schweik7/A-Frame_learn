function log(componentInstance) {
    console.log("Hello World from log");
}

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
    to: {default: {x:3,y:3,z:3}, type: 'vec3'}  
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
  // 设置初始位置
  textEl.object3D.position.set(position.x, position.y, position.z);
  var delay= data.delay? data.delay : 10;
  // 设置动画
  textEl.setAttribute('animation', {
    property: 'material.opacity',
    to: 1,
    // dur: 7000,
    delay: delay * index*20
  });
}