export class InteractionManager {
  constructor(debug = true) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.debug = debug;
    window.addEventListener('click', this.onClick.bind(this));
  }

  registerObject(object, callback, priority = "normal") {
    // Assign numerical priority values
    const priorityValues = {
      'high': 5,
      'normal': 3,
      'low': 1
    };
    object.userData.priority = priorityValues[priority] || priority || 3; // Default to 'normal' priority if not specified
    this.interactiveObjects.push({ object, callback });

    // Log object registration if debug mode is enabled
    if (this.debug) {
      console.log(`Registered object: ${object.name} with priority: ${priority}`);
    }
  }

  unregisterObject(object) {
    const index = this.interactiveObjects.findIndex(item => item.object === object);
    if (index >= 0) {
      this.interactiveObjects.splice(index, 1);
      if (this.debug) {
        console.log(`Unregistered object: ${object.name}`);
      }
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
    this.raycaster.setFromCamera(this.mouse, cameraEl.sceneEl.camera); // 发出射线

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects.map(item => item.object), true);
    if (intersects.length > 0) {
      if (this.debug)
        console.log("Intersected objects:", intersects.map(intersect => intersect.object.name));
      // 根据优先级排序
      intersects.sort((a, b) => b.object.userData.priority - a.object.userData.priority);
      const highestPriorityObject = intersects[0].object;
      // Find the corresponding callback and execute it
      const item = this.interactiveObjects.find(item => item.object === highestPriorityObject);
      if (item) {
        item.callback();
        // Log object interaction if debug mode is enabled
        if (this.debug) {
          console.log(`Interacted with object: ${highestPriorityObject.name} with priority: ${highestPriorityObject.userData.priority}`);
        }
      }
    }
  }
}

//  raycaster = new THREE.Raycaster();
//
// scene3 = document.getElementById('scene3');object3 = scene3.object3D.getObjectByName('交互3');
//
// raycaster=interactionManager.raycaster;intersect=raycaster.intersectObject(object3, true);
// console.log(intersect);

// ball=scene3.object3D.getObjectByName("球体3");
// console.log(ball);
// ball.setAttribute('visible',false);
// intersect=raycaster.intersectObject(ball, true);