import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';
import './components/aframe-keyboard-controll-controller';

function textAnimation(textEl, index, position, data) {
  const baseDelay = 500; // 基础延迟
  setTimeout(() => {
    textEl.setAttribute('animation', {
      property: 'material.opacity',
      to: 1,
      dur: 500
    });
  }, index * 200 + baseDelay); // 延迟确保逐字显示的效果
}
window.textAnimation = textAnimation;

document.addEventListener('DOMContentLoaded', () => {
  fetch('aframe-scene.html')
      .then(response => response.text())
      .then(data => {
          document.body.innerHTML += data;
      })
      .catch(error => console.error('Error loading the A-Frame scene:', error));
});
let backendhost='http://localhost:8000';
let backendUrl = `${backendhost}/quez/`;

// 对backendUrl发起ajax请求，获取数据


// {
//   "quez": {
//       "question": "田田的学习能力不错，但最近发现自己一学习就感到烦躁、无聊和疲惫，没有学习的动力。\n如果你遇到和田田一样的情况，在面对学习任务时，你最可能有以下哪种行为？",
//       "question_type": "身心倦怠型抑郁",
//       "id": 2
//   },
//   "answers": [
//       {
//           "answer": "寻找一些有趣的学习资料，认真完成学习任务",
//           "id": 6,
//           "score": 0,
//           "quez_id": 2
//       },...
//   ]
// }