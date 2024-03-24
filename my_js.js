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
    to: {default: '3 3 3', type: 'vec3'}  
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

AFRAME.registerComponent('text-sequence', {
  schema: {
    text: {type: 'string'},
    font: {type: 'selector'},
    delay: {type: 'number', default: 500} // 每个字符之间的延迟，以毫秒为单位
  },
  init: function() {
    const data = this.data;
    const el = this.el;

    // 拆分文本为单个字符
    const characters = data.text.split('');

    // 逐个字符创建实体并设置动画
    characters.forEach((char, index) => {
      const textEl = document.createElement('a-entity');

      textEl.setAttribute('text-geometry', {
        value: char,
        font: data.font.getAttribute('src')
      });

      textEl.setAttribute('material', {color: '#FFF'}); // 设置文本颜色

      textEl.object3D.position.x = index * 0.5; // 设置每个字符的位置，根据需要调整

      textEl.setAttribute('animation', {
        property: 'position',
        dir: 'alternate',
        dur: 2000,
        delay: data.delay * index, // 使每个字符依次出现
        to: `${index * 0.5} 1 -5` // 动画结束位置，根据需要调整
      });

      el.appendChild(textEl);
    });
  }
});