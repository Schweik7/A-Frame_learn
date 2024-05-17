export function initRecording() {
  // 创建按钮容器
  const buttonContainer = document.getElementById('buttonContainer');

  // 观察者对象
  const observer = new MutationObserver((mutationsList, observer) => {
    const enterVrContainer = document.querySelector('.a-enter-vr.fullscreen');
    if (enterVrContainer) {
      // 将按钮容器插入到enterVrContainer中
      enterVrContainer.appendChild(buttonContainer);
      // enterVrContainer.style.
      buttonContainer.style.display = 'flex';
      // 停止观察
      observer.disconnect();
    }
  });

  // 开始观察body的子节点变化
  observer.observe(document.body, { childList: true, subtree: true });
  let mediaRecorder;
  let recordedChunks = [];
  let eventLogs = [];

  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', () => {
    recordedChunks = [];
    eventLogs = [];
    startRecording();
    startButton.style.display = 'none';
    stopButton.style.display = 'inline';
  });

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
    // saveEventLogs();
  });

  function startRecording() {
    const canvas = document.querySelector('a-scene').canvas;
    const stream = canvas.captureStream();
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9',videoBitsPerSecond: 0.25 * 1024 * 1024 });

    mediaRecorder.ondataavailable = function(event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function() {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    mediaRecorder.start();
  }

  function saveEventLogs() {
    const blob = new Blob([JSON.stringify(eventLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'eventLogs.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  AFRAME.registerComponent('log-events', {
    init: function () {
      const el = this.el;
      
      // 监听点击事件
      el.addEventListener('click', function (event) {
        const log = {type: 'click', detail: event.detail.intersection.point, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Click event:', log);
      });

      // 监听拖动事件
      el.addEventListener('dragstart', function (event) {
        const log = {type: 'dragstart', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Drag start:', log);
      });

      el.addEventListener('dragend', function (event) {
        const log = {type: 'dragend', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Drag end:', log);
      });

      // 监听旋转事件
      el.addEventListener('rotationstart', function (event) {
        const log = {type: 'rotationstart', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Rotation start:', log);
      });

      el.addEventListener('rotationend', function (event) {
        const log = {type: 'rotationend', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Rotation end:', log);
      });

      // 监听移动事件
      el.addEventListener('movestart', function (event) {
        const log = {type: 'movestart', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Move start:', log);
      });

      el.addEventListener('moveend', function (event) {
        const log = {type: 'moveend', detail: event.detail, timestamp: Date.now()};
        eventLogs.push(log);
        console.log('Move end:', log);
      });
    }
  });
};