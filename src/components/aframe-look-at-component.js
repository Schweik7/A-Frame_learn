// coordinates=AFRAME.utils.coordinates;
AFRAME.registerComponent('look-at', {
    schema: {
      default: '0 0 0',

      parse: function (value) {
        // 一个静态的目标位置
        if (AFRAME.utils.coordinates.isCoordinates(value) || typeof value === 'object') {
          return AFRAME.utils.coordinates.parse(value);
        }
        // 一个指向目标实体的选择器
        return value;
      },

      stringify: function (data) {
        if (typeof data === 'object') {
          return AFRAME.utils.coordinates.stringify(data);
        }
        return data;
      }
    },

    init: function () {
      this.target3D = null;
      this.vector = new THREE.Vector3();
      this.cameraListener = AFRAME.utils.bind(this.cameraListener, this);
      this.el.addEventListener('componentinitialized', this.cameraListener);
      this.el.addEventListener('componentremoved', this.cameraListener);
    },

    /**
     * 如果跟踪对象，这将在每个tick上调用。
     * 如果查看的是一个位置向量，这只会被调用一次（直到进一步更新）。
     */
    update: function () {
      var self = this;
      var target = self.data;
      var targetEl;

      // 不再查看任何东西（例如，look-at=""）。
      if (!target || (typeof target === 'object' && !Object.keys(target).length)) {
        return self.remove();
      }

      // 查看一个位置。
      if (typeof target === 'object') {
        return this.lookAt(new THREE.Vector3(target.x, target.y, target.z));
      }

      // 假设目标是一个字符串。
      // 查询元素，获取其object3D，然后在场景上注册一个行为，在每个tick上跟踪目标。
      targetEl = self.el.sceneEl.querySelector(target);
      if (!targetEl) {
        console.warn('"' + target + '" does not指向一个有效的实体以查看');
        return;
      }
      if (!targetEl.hasLoaded) {
        return targetEl.addEventListener('loaded', function () {
          self.beginTracking(targetEl);
        });
      }
      return self.beginTracking(targetEl);
    },

    tick: (function () {
      var vec3 = new THREE.Vector3();

      return function (t) {
        // 跟踪目标对象的位置。依赖于父对象保持全局变换与updateMatrixWorld()同步。实际上，这是由渲染器处理的。
        var target3D = this.target3D;
        if (target3D) {
          target3D.getWorldPosition(vec3);
          this.lookAt(vec3);
        }
      }
    })(),

    remove: function () {
      this.el.removeEventListener('componentinitialized', this.cameraListener);
      this.el.removeEventListener('componentremoved', this.cameraListener);
    },

    beginTracking: function (targetEl) {
      this.target3D = targetEl.object3D;
    },

    cameraListener: function (e) {
      if (e.detail && e.detail.name === 'camera') {
        // console.log('camera changed, updating look-at');
        this.update();
      }
    },

    lookAt: function (position) {
      var vector = this.vector;
      var object3D = this.el.object3D;

      if (this.el.getObject3D('camera')) {
        // 对于相机实体，翻转向量到-z，背离目标。当使用
        // THREE camera对象的lookat时，这会自动为你应用，但是由于相机嵌入到Object3D中，我们需要手动应用这个。
        vector.subVectors(object3D.position, position).add(object3D.position);
      } else {
        vector.copy(position);
      }
      object3D.lookAt(vector);
    }
  });
