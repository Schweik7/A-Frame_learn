const LoopMode = {
  once: THREE.LoopOnce,  // 只播放一次
  repeat: THREE.LoopRepeat,  // 循环播放
  pingpong: THREE.LoopPingPong  // 往返播放
};

/**
 * animation-mixer
 *
 * 动画片段播放器。旨在兼容任何支持骨骼或形态动画的模型格式，使用THREE.AnimationMixer。
 * 参考: https://threejs.org/docs/?q=animation#Reference/Animation/AnimationMixer
 */
AFRAME.registerComponent('animation-mixer', {
  schema: {
    clip: { default: '*' },  // 要播放的动画片段
    useRegExp: {default: false},  // 是否使用正则表达式
    duration: { default: 0 },  // 动画持续时间
    clampWhenFinished: { default: false, type: 'boolean' },  // 动画结束后是否停止在最后一帧
    crossFadeDuration: { default: 0 },  // 动画交叉淡入淡出时间
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },  // 循环模式
    repetitions: { default: Infinity, min: 0 },  // 循环次数
    timeScale: { default: 1 },  // 时间缩放比例
    startAt: { default: 0 }  // 动画开始时间
  },

  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;  // 模型
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;  // 动画混合器
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];  // 活动动画动作数组

    const model = this.el.getObject3D('mesh');  // 获取模型的3D对象

    if (model) {
      this.load(model);  // 如果模型已加载，直接调用load方法
      // console.log(this.el.name, "模型:",model);
    } else {
      this.el.addEventListener('model-loaded', (e) => {
        this.load(e.detail.model);  // 如果模型尚未加载，监听model-loaded事件后调用load方法
        // console.log(this.el.name, "模型:", e.detail.model);
      });
    }
  },

  load: function (model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);  // 创建动画混合器
    this.mixer.addEventListener('loop', (e) => {
      // console.log("动画单次循环完毕");
      el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });  // 动画循环事件
    });
    this.mixer.addEventListener('finished', (e) => {
      // console.log("动画播放结束");
      el.emit('animation-finished', { action: e.action, direction: e.direction });  // 动画结束事件
    });
    if (this.data.clip) this.update({});  // 如果有动画片段，更新动画状态
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();  // 停止所有动画动作
  },

  update: function (prevData) {
    if (!prevData) return;

    const data = this.data;
    const changes = AFRAME.utils.diff(prevData, data);  // 获取数据变化，注意，根据AFRAME源码，changes返回的主要是第二个对象的不同值
    // console.log("changes: ", changes);
    
    // 如果选择的片段发生变化，重新开始动画
    if ('clip' in changes) {
      this.stopAction();
      if (data.clip) this.playAction();
      return;
    }

    // 否则，修改正在运行的动作
    this.activeActions.forEach((action) => {
      if ('duration' in changes && data.duration) {
        action.setDuration(data.duration);  // 设置动画持续时间
      }
      if ('clampWhenFinished' in changes) {
        action.clampWhenFinished = data.clampWhenFinished;  // 设置动画结束时是否保持最后一帧
      }
      if ('loop' in changes || 'repetitions' in changes) {
        action.setLoop(LoopMode[data.loop], data.repetitions);  // 设置循环模式和次数
      }
      if ('timeScale' in changes) {
        action.setEffectiveTimeScale(data.timeScale);  // 设置时间缩放比例
      }
    });
  },

  stopAction: function () {
    const data = this.data;
    for (let i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)  // 淡出动画
        : this.activeActions[i].stop();  // 停止动画
    }
    this.activeActions.length = 0;  // 清空活动动作数组
  },

  playAction: function () {
    if (!this.mixer) return;

    const model = this.model,
      data = this.data,
      clips = model.animations || (model.geometry || {}).animations || [];  // 获取动画片段
    // 注意model其实是THREE.SkinnedMesh或THREE.Mesh，所以可以直接访问animations属性。
    if (!clips.length) return;
    else{
      console.log("动画：",clips);
    }

    const re = data.useRegExp ? data.clip : wildcardToRegExp(data.clip);  // 判断是否使用正则表达式

    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);  // 获取动画动作

        action.enabled = true;
        action.clampWhenFinished = data.clampWhenFinished;
        if (data.duration) action.setDuration(data.duration);
        if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
        // animation-mixer.startAt 和 AnimationAction.startAt 有非常不同的含义。
        // animation-mixer.startAt 指定动画从第几帧开始播放，以毫秒为单位。
        // AnimationAction.startAt 指定动画在全局混合器时间（以秒为单位）中的何时开始播放（从第一帧开始）。
        action.startAt(this.mixer.time - data.startAt / 1000);
        action
          .setLoop(LoopMode[data.loop], data.repetitions)
          .fadeIn(data.crossFadeDuration)
          .play();  // 播放动画
        this.activeActions.push(action);  // 将动作添加到活动动作数组中
      }
    }
    
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);  // 更新动画混合器
  }
});

/**
 * 创建一个正则表达式，将给定字符串中的星号转换为 .* 表达式，并转义所有其他字符。
 */
function wildcardToRegExp(s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * 转义给定字符串中的所有字符，使其适用于正则表达式。
 */
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
