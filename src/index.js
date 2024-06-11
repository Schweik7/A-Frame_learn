import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';// 能够通过_target参数实现事件代理
import './components/aframe-keyboard-controll-controller';
import './components/aframe-log-all-events';
import './components/aframe-look-at-component';
import './components/aframe-focus-on-click-component';
// import './components/aframe-proxy-event-component'; // 这个组件的事件代理会emit一个customEvent，不利于代码编写
import { initRecordingAndLogout } from './utils/recording';
import { fetchData, textAnimation, changeColor, quezData as localQuezData, isLogined, initUserAuth, login } from './utils/utils';
import { InteractionManager } from './utils/interactionManager'
let USE_LOCAL_DATA = false; // 是否使用本地数据
// let USE_LOCAL_DATA = true;
let quez_data = null; // 问题数据

window.originalPositions = {};
window.textAnimation = textAnimation;


export async function initApplication() {
    const response = await fetch('aframe-scene.html');
    const data = await response.text();
    document.body.innerHTML += data;
    initRecordingAndLogout();
    // 创建全局交互管理器实例
    const interactionManager = new InteractionManager();
    window.interactionManager = interactionManager;
    // 创建场景
    if (isLogined()) firstScene();
    // import('./utils/recording').then().catch();

}

function firstScene() {
    let model2 = document.getElementById('model2');
    let model3 = document.getElementById('model3');
    model2.addEventListener('model-loaded', function () {
        let boat = model2.object3D.getObjectByName('旗帜');
        if (boat) {
            boat.userData.clickable = true;
            interactionManager.registerObject(boat, () => {
                // 隐藏 model2 并显示 model3
                model2.setAttribute('visible', 'false');
                model3.setAttribute('visible', 'true');
                let pushButton = model3.object3D.getObjectByName('按压');
                if (pushButton) {
                    // console.log('找到按压按钮');
                    pushButton.userData.clickable = true;
                    interactionManager.registerObject(pushButton, async () => {
                        console.log('按压按钮被点击');
                        if (!USE_LOCAL_DATA) {
                            quez_data = await fetchData(2);
                        }
                        else {
                            quez_data = localQuezData;
                        }
                        createText(quez_data);
                    }, 'high');
                } else {
                    console.log('没有找到按压按钮');
                }
            });
        }
    });
}

function createText(quez_data) {
    const panel = document.getElementById('text-panel');
    const answersLength = quez_data.answers.length;
    console.log("answersLength", answersLength);
    const questionText = document.createElement('a-entity');
    questionText.id = "question";
    questionText.setAttribute('text-animation', { text: quez_data.quez.question, charsPerLine: 20, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
    // questionText.setAttribute('log-all-events', { debug: false });
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
        else return;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initUserAuth();
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

