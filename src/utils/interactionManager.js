export class InteractionManager {
  constructor(debug = true) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.debug = debug;
    window.addEventListener('click', this.onClick.bind(this));
  }

  registerObject(object, callback, priority = "normal", interactionRange = { min_distance: 0, max_distance: Infinity }) {
    // Assign numerical priority values
    const priorityValues = {
      'high': 5,
      'normal': 3,
      'low': 1
    };
    object.userData.priority = priorityValues[priority] || priority || 3; // Default to 'normal' priority if not specified
    object.userData.interactionRange = interactionRange;
    this.interactiveObjects.push({ object, callback });

    // Log object registration if debug mode is enabled
    if (this.debug) {
      console.log(`Registered object: ${object.name} with priority: ${priority} and interaction range: ${JSON.stringify(interactionRange)}`);
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

  onClick(event) {
    // 计算鼠标在标准化设备坐标中的位置
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 更新 raycaster 位置
    const cameraEl = document.querySelector('#camera') || document.querySelector('a-camera');
    this.raycaster.setFromCamera(this.mouse, cameraEl.sceneEl.camera); // 发出射线

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects.map(item => item.object), true);
    if (intersects.length > 0) {
      if (this.debug) {
        console.log("Intersected objects:", intersects.map(intersect => intersect.object.name),intersects);
      }
      
      // 根据优先级排序
      intersects.sort((a, b) => b.object.userData.priority - a.object.userData.priority);
      
      for (let intersect of intersects) {
        let highestPriorityObject = intersect.object;
        const distance = intersect.distance;
        while (!highestPriorityObject.userData.interactionRange && highestPriorityObject.parent) {
          highestPriorityObject = highestPriorityObject.parent;
        }
        // 检查距离是否在交互范围内
        const interactionRange = highestPriorityObject.userData.interactionRange;
        let withinRange = false;

        if (typeof interactionRange === 'function') {
          withinRange = interactionRange(distance);
        } else if (typeof interactionRange === 'object' && interactionRange !== null) {
          const { min_distance, max_distance } = interactionRange;
          withinRange = (distance >= (min_distance || 0)) && (distance <= (max_distance || Infinity));
          if (this.debug) {
            console.log(`Distance to object: ${distance}, within range: ${withinRange},range: ${JSON.stringify(interactionRange)}`);
          }
        }

        if (withinRange) {
          const item = this.interactiveObjects.find(item => item.object === highestPriorityObject);
          if (item) {
            item.callback();
            // Log object interaction if debug mode is enabled
            if (this.debug) {
              console.log(`Interacted with object: ${highestPriorityObject.name} with priority: ${highestPriorityObject.userData.priority} within interaction range: ${JSON.stringify(interactionRange)}`);
            }
            return; // 只与第一个符合条件的对象交互
          }
        }
      }
    }
  }
}
