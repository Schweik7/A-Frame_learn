AFRAME.registerComponent('focus-on-click', {
    init: function () {
        const el = this.el;
        el.addEventListener('click', () => {
            const cameraEl = document.querySelector('#camera');
            window.cameraEl=cameraEl;
            let  finalRotation = null;
            const cameraObj = cameraEl.object3D;
            const targetPos = el.object3D.position;
            const currentPos = cameraEl.object3D.position;
            const distance = currentPos.distanceTo(targetPos);
            console.log(`Distance: ${distance}, Target: ${targetPos.x}, ${targetPos.y}, ${targetPos.z}, currPos: ${currentPos.x}, ${currentPos.y}, ${currentPos.z}`);
            
            // 计算新的相机位置
            const newPosition = {
                x: targetPos.x,
                y: targetPos.y , // 调整高度以保持一致的视角高度
                z: targetPos.z + 5 // 调整距离以确保相机稍微靠前
            };
            const duration = distance * 100; // 持续时间与距离成比例

            // 设置位置动画
            cameraEl.setAttribute('animation__position', {
                property: 'position',
                to: `${newPosition.x} ${newPosition.y} ${newPosition.z}`,
                dur: duration,
                easing: 'easeInOutCubic'
            });
            console.log('original rotation', cameraEl.object3D.rotation);
            // 使用 look-at 属性确保相机在移动过程中始终对准目标
            // 注意当使用 look-at 时，需要指定目标的 id，如果使用坐标则只会在动画开始时指向该坐标
            cameraEl.setAttribute('look-at', `#model3`);
            // 在动画完成后解除look-at
            setTimeout(() => {
                // finalRotation = cameraObj.rotation.clone();
                finalRotation = new THREE.Euler().copy(cameraObj.rotation); // 保存当前的旋转角度
                // finalRotation=cameraEl.getAttribute('rotation');
                console.log('final rotation', finalRotation);
                // 移除look-at属性
                cameraEl.removeAttribute('look-at');
                cameraObj.rotation.set(finalRotation.x, finalRotation.y, finalRotation.z);
                cameraObj.updateMatrixWorld();
                window.finalRotation = finalRotation;
                // cameraEl.setAttribute('rotation', finalRotation);
                // 应用保存的旋转角度
                // cameraObj.rotation.copy(finalRotation);
            }, duration);
            // cameraEl.setAttribute('rotation', finalRotation);
            // cameraObj.rotation.copy(finalRotation);

            // cameraEl.object3D.lookAt(targetPos.x, targetPos.y, targetPos.z);
        });
    }
});
// document.querySelector('#camera').object3D.lookAt(0, 0, 0); // 初始相机位置