AFRAME.registerComponent('focus-on-click', {
    init: function () {
        const el = this.el;
        // interactionManager.registerInteraction(el);
        el.addEventListener('click', () => {
            const cameraEl = document.querySelector('#camera');
            window.cameraEl = cameraEl;
            let finalRotation = null;
            const cameraObj = cameraEl.object3D;
            const cameraPos = cameraObj.position;
            const targetPos = el.object3D.position;
            const distance = cameraPos.distanceTo(targetPos);
            console.log(`Distance: ${distance}, Target: ${targetPos.x}, ${targetPos.y}, ${targetPos.z}, cameraPos: ${cameraPos.x}, ${cameraPos.y}, ${cameraPos.z}`);
            
            // 计算目标对象的新位置，使其移动到相机前方一定距离的位置
            const direction = new THREE.Vector3().subVectors(targetPos, cameraPos).normalize();
            const newTargetPos = new THREE.Vector3().copy(cameraPos).add(direction.multiplyScalar(3.5)); // 5 表示目标对象距离相机的距离

            const duration = distance * 180; // 持续时间与距离成比例

            // 设置目标对象位置动画
            el.setAttribute('animation__position', {
                property: 'position',
                to: `${newTargetPos.x} ${newTargetPos.y} ${newTargetPos.z}`,
                dur: duration,
                easing: 'easeInOutCubic'
            });

            // 使用 look-at 属性确保目标在移动过程中始终对准相机
            el.setAttribute('look-at', `#camera`);

            // 在动画完成后解除 look-at 并应用保存的旋转角度
            setTimeout(() => {
                const targetObj = el.object3D;
                finalRotation = new THREE.Euler().copy(targetObj.rotation); // 保存当前的旋转角度
                console.log('final rotation', finalRotation);

                // 移除 look-at 属性
                el.removeAttribute('look-at');

                // 手动应用保存的旋转角度
                targetObj.rotation.set(finalRotation.x, finalRotation.y, finalRotation.z);
                targetObj.updateMatrixWorld();
                window.finalRotation = finalRotation;
            }, duration);
        });
    }
});

// 初始化相机位置
// document.querySelector('#camera').object3D.lookAt(0, 0, 0);
