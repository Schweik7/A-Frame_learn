AFRAME.registerComponent('focus-on-click', {
    schema: {
      moveRelativeTo: { type: 'string', default: 'camera' } // 'camera' 或 'z-axis'
    },
  
    init: function () {
      const el = this.el;
      const data = this.data;
      
      interactionManager.registerObject(el.object3D, () => {
        let finalRotation = null;
        const cameraEl = document.querySelector('#camera') || document.querySelector('[camera]');
        const cameraObj = cameraEl.object3D;
        const cameraPos = cameraObj.position;
        const targetPos = el.object3D.position;
        const distance = cameraPos.distanceTo(targetPos);
        console.log(`Distance: ${distance}, Target: ${targetPos.x}, ${targetPos.y}, ${targetPos.z}, cameraPos: ${cameraPos.x}, ${cameraPos.y}, ${cameraPos.z}`);
        let newTargetPos;
        if (data.moveRelativeTo === 'camera') {
          // 根据相机当前角度计算目标位置
          const direction = new THREE.Vector3();
          cameraObj.getWorldDirection(direction);
        //   console.log('direction', direction,"length",direction.length());
          newTargetPos = new THREE.Vector3().copy(cameraPos).sub(direction.multiplyScalar(3.5));
        //   console.log('newTargetPos', newTargetPos);
        } else {
          // 根据 Z 轴计算目标位置
          newTargetPos = new THREE.Vector3(cameraPos.x, cameraPos.y, cameraPos.z - 3.5);
        }
        const duration = distance * 180; // 持续时间与距离成比例
        // 设置目标对象位置动画
        el.setAttribute('animation__position', {
          property: 'position',
          to: `${newTargetPos.x} ${newTargetPos.y} ${newTargetPos.z}`,
          dur: duration,
          easing: 'easeInOutCubic'
        });
  
        // 使用 look-at 属性确保目标在移动过程中始终对准相机
        el.setAttribute('look-at', `[camera]`);
  
        // 在动画完成后解除 look-at 并应用保存的旋转角度
        setTimeout(() => {
          const targetObj = el.object3D;
          finalRotation = new THREE.Euler().copy(targetObj.rotation); // 保存当前的旋转角度
        //   console.log('final rotation', finalRotation);
  
          // 移除 look-at 属性
          el.removeAttribute('look-at');
  
          // 手动应用保存的旋转角度
          targetObj.rotation.set(finalRotation.x, finalRotation.y, finalRotation.z);
          targetObj.updateMatrixWorld();
          window.finalRotation = finalRotation;
          
        }, duration);
      },'normal',{min_distance: 4, max_distance: 100});
    }
  });
  