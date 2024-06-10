export class InteractionManager {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.interactiveObjects = [];

      window.addEventListener('click', this.onClick.bind(this));
    }

    registerObject(object, callback,priority) {
      object.userData.priority = priority || 'normal';
      this.interactiveObjects.push({ object, callback });
    }

    unregisterObject(object) {
      const index = this.interactiveObjects.findIndex(item => item.object === object);
      if (index >= 0) {
        this.interactiveObjects.splice(index, 1);
      }
    }
    // 在 Three.js 中，可以直接设置 material 的 raycast 属性来控制 Raycaster 是否检测物体：
    onClick(event) {
      // 计算鼠标在标准化设备坐标中的位置
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 更新 raycaster 位置
      const cameraEl = document.querySelector('#camera') || document.querySelector('a-camera');
      window.cameraEl = cameraEl;
      this.raycaster.setFromCamera(this.mouse, cameraEl.sceneEl.camera);
      // 检查每个注册对象的交集，通过调整 Raycaster 的检测顺序，确保较小的按钮在透明物体之前被检测到：
      for (let item of this.interactiveObjects) {
        if (item.object.userData.priority === 'high') {
          const intersects = this.raycaster.intersectObject(item.object, true);
          if (intersects.length > 0) {
            item.callback();
            return;
          }
        }
      }

      // 再检测其他物体
      for (let item of this.interactiveObjects) {
        if (item.object.userData.priority !== 'high') {
          const intersects = this.raycaster.intersectObject(item.object, true);
          if (intersects.length > 0) {
            item.callback();
            return;
          }
        }
      }
    }
  }

  // 创建全局交互管理器实例
//   const interactionManager = new InteractionManager();
//   window.interactionManager = interactionManager;