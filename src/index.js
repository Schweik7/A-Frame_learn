import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';
import './components/aframe-keyboard-controll-controller';
// import { v4 as uuid4 } from 'uuid';
let quez_data = {
  "quez": {
    "question": "田田的学习能力不错，但最近发现自己一学习就感到烦躁、无聊和疲惫，没有学习的动力。如果你遇到和田田一样的情况，在面对学习任务时，你最可能有以下哪种行为？",
    "question_type": "身心倦怠型抑郁",
    "id": 2
  },
  "answers": [
    {
      "answer": "寻找一些有趣的学习资料，认真完成学习任务",
      "id": 6,
      "score": 0,
      "quez_id": 2
    },
    {
      "answer": "学习注意力不够集中，但尽力完成学习任务",
      "id": 7,
      "score": 1,
      "quez_id": 2
    }
  ]
}

function textAnimation(textEl, index, position, data) {
  const baseDelay = 500; // 基础延迟
  setTimeout(() => {
    textEl.setAttribute('animation', {
      property: 'material.opacity',
      to: 1,
      dur: 500
    });
  }, index * 10 + baseDelay); // 延迟确保逐字显示的效果
}
window.textAnimation = textAnimation;

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('aframe-scene.html')
    .then(response => response.text())
    .then(data => {
      document.body.innerHTML += data;

      function createText(data) {
        const panel = document.getElementById('text-panel');
        quez_data.answers.forEach((answer, index) => {
          const answerText = document.createElement('a-entity');
          answerText.id = "answer" + index;
          panel.appendChild(answerText);
          panel.addEventListener('textAnimationEnd', (event) => {});
          answerText.addEventListener('textAnimationEnd', (event) => {
            console.log("listened!", answerText.id);
            const { nextPosition, nextEl } = event.detail;
            console.log("nextEl", nextEl,"this id", this.id);
            if(answerText.id ==nextEl){
              let nextEl = "answer" + (index+1);
              // 使用计算好的下一个位置，发送信号给将下一个答案的id
              textEl.setAttribute('text-animation', { text: answer.answer, color: '#F00', font: '#myFont', _function: 'textAnimation', signalTarget: nextEl, 'position': nextPosition });
            }
          });
        });

        const questionText = document.createElement('a-entity');
        questionText.setAttribute('text-animation', { text: quez_data.quez.question_type + ': ' + quez_data.quez.question, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0" });// 当问题展示完毕后，发送信号给第一个答案
        panel.appendChild(questionText);
      }
      createText(data);
    }
    )
    .catch(error => console.error('Error: ', error));
});
let backendhost = 'http://localhost:8000';
let backendUrl = `${backendhost}/quez/`;

async function fetchData() {
  try {
    const response = await fetch(backendUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}








