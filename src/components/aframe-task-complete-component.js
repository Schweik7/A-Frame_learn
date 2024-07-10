AFRAME.registerComponent('task-completed', {
    init: function () {
        // 模拟任务完成事件
        this.el.addEventListener('taskcompleted', () => {
            this.el.parentNode.removeChild(this.el);
            console.log('Entity removed after task completed');
        });
    }
});