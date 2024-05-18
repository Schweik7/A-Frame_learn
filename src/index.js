import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';// 能够通过_target参数实现事件代理
import './components/aframe-keyboard-controll-controller';
// import './components/aframe-proxy-event-component'; // 这个组件的事件代理会emit一个customEvent，不利于代码编写
import { initRecording } from './utils/recording';
import { fetchData, textAnimation, changeColor, quezData } from './utils/utils';

// let USE_LOCAL_DATA = false; // 是否使用本地数据
let USE_LOCAL_DATA = true;
let quez_data = null;

window.originalPositions = {};

window.textAnimation = textAnimation;

async function initApplication() {
    const response = await fetch('aframe-scene.html');
    const data = await response.text();
    document.body.innerHTML += data;
    createText(quez_data);  // 此函数现在不需要传入data参数
    // import('./utils/recording').then().catch();
    initRecording();
}
function createText(quez_data) {
    const panel = document.getElementById('text-panel');
    const answersLength = quez_data.answers.length;
    console.log("answersLength", answersLength);
    const questionText = document.createElement('a-entity');
    questionText.id = "question";
    questionText.setAttribute('text-animation', { text: quez_data.quez.question, charsPerLine: 20, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
    panel.appendChild(questionText);
    quez_data.answers.forEach((answer, index) => {
        const answerText = document.createElement('a-entity');
        answerText.id = "answer" + index;
        panel.appendChild(answerText);
        // answerText.isAnimating = false;  
        answerText.setAttribute("background", { color: "#000" });
    });

    panel.addEventListener('textAnimationEnd', (event) => {
        const { nextPosition, nextEl } = event.detail;
        let textEl = document.getElementById(nextEl);

        if (textEl) {
            let parts = nextEl.split("answer");
            let index = parseInt(parts[1], 10) + 1;
            let text = quez_data.answers[index - 1].answer;
            let nextTarget = ""; // 下一个目标
            if (index < answersLength) nextTarget = "answer" + index;
            textEl.setAttribute('text-animation', {
                text: text, color: '#F00', font: '#myFont', charsPerLine: 20, indent: 0, _function: 'textAnimation', signalTarget: nextTarget, 'position': nextPosition, childID: `answer${index}Char`
            });
            mouseEventListen(textEl);
        }
        else return
    });

}

document.addEventListener('DOMContentLoaded', () => {
    if (USE_LOCAL_DATA) {
        quez_data = quezData;
        initApplication();
    }
    else {
        fetchData(2).then(data => {
            quez_data = data;
            initApplication();
        }).catch(error => {
            console.error('Failed to fetch data:', error);
        });
    }
});
window.changeColor = changeColor;

function mouseEventListen(textEl) {
    textEl.panelEl.setAttribute('event-set__enter', {
        _event: "mouseenter", _function: "changeColor", _params: { eventName: "mouseenter", targetColor: "#FF0" }
    });
    textEl.panelEl.setAttribute('event-set__leave', {
        _event: "mouseleave", _function: "changeColor", _params: { eventName: "mouseenter", targetColor: "#F00" }
    });
    textEl.setAttribute('event-set__enter', {
        _event: "mouseenter", _function: "changeColor", _params: { eventName: "mouseenter", targetColor: "#FF0" }, _target: `#${textEl.panelEl.id}`
    });
    textEl.setAttribute('event-set__leave', {
        _event: "mouseleave", _function: "changeColor", _params: { eventName: "mouseenter", targetColor: "#F00" }, _target: `#${textEl.panelEl.id}`
    });
}

