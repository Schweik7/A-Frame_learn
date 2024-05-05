function return2Original(entityEl, duration = 500) {
    if (entityEl.isAnimating) return;
    else {
        entityEl.isAnimating=true;
        const textGeometries = entityEl.querySelectorAll('[text-geometry]');
        textGeometries.forEach(textEl => {
            const originalPosition = originalPositions[textEl.getAttribute('id')];
            textEl.setAttribute('animation', `property: position; to: ${originalPosition.x} ${originalPosition.y} ${originalPosition.z}; dur: ${duration}`);
        });
        setTimeout(() => {
            entityEl.isAnimating = false; // 清除标志，允许再次触发事件
        }, duration);
    }
}

function close2Center(entityEl, targetZ = -3.5, duration = 500) {
    if (entityEl.isAnimating) return;
    else {
        entityEl.isAnimating=true;
        const textGeometries = entityEl.querySelectorAll('[text-geometry]');
        textGeometries.forEach(textEl => {
            const currentPosition = textEl.getAttribute('position');
            if (currentPosition.z < targetZ) {
                textEl.setAttribute('animation', `property: position; to: ${currentPosition.x} ${currentPosition.y} ${targetZ}; dur: ${duration}`);
            }
        });
        setTimeout(() => {
            entityEl.isAnimating = false; // 清除标志，允许再次触发事件
        }, duration);
    }
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}