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
import { fetchData, submitAnswer, textAnimation, changeColor, quezData as localQuezData, isLogined, initUserAuth, shuffle } from './utils/utils';
import { InteractionManager } from './utils/interactionManager'
import { USE_LOCAL_DATA } from './config';
// let USE_LOCAL_DATA = true;
let quez_data = null; // 问题数据
let loadedScene = false;
window.originalPositions = {};
window.textAnimation = textAnimation;


export async function initApplication() {
    if (!loadedScene) {
        const response = await fetch('aframe-scene.html');
        const data = await response.text();
        document.body.innerHTML += data;
        initRecordingAndLogout();
        // 创建全局交互管理器实例
        const interactionManager = new InteractionManager();
        window.interactionManager = interactionManager;
        loadedScene = true;
    }
    // 创建场景
    if (isLogined()) {
        initSceneListener();
    }
}

function initSceneListener() {
    let main_scene = document.getElementById('main_scene');
    main_scene.addEventListener('model-loaded', function () {
        console.log('model loaded');
        let boat_flag = main_scene.object3D.getObjectByName('旗帜');
        if (boat_flag) {
            boat_flag.userData.clickable = true;
            interactionManager.registerObject(boat_flag, allScenesEnter);
            allScenesClickListenerInit();
        } else {
            console.log('没有找到boat flag');
        }
    });
}

function allScenesClickListenerInit() {
    secondSceneListenerInit();
    thirdSceneListenerInit();
}

function allScenesEnter() {
    main_scene.setAttribute('visible', 'false');

    let curScene = null;
    for (let i = 2; i <= 10; i++) {
        curScene = document.getElementById(`scene${i}`);
        if (curScene) {
            curScene.setAttribute('visible', 'true');
        }
    }

    let boat_flag = main_scene.object3D.getObjectByName('旗帜');
    interactionManager.unregisterObject(boat_flag)
}


function secondSceneListenerInit() {
    let scene2 = document.getElementById('scene2');
    scene2.addEventListener('model-loaded', function () {
        let pushButton = scene2.object3D.getObjectByName('交互2');
        if (pushButton) {
            // console.log("找到交互2按钮")
            pushButton.userData.clickable = true;
            interactionManager.registerObject(pushButton, async () => {
                // console.log('按钮交互2被点击');
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(2);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data);
            }, 'high', { min_distance: 0, max_distance: 5 });
        }
    });
}


function thirdSceneListenerInit() {
    let scene3 = document.getElementById('scene3');
    // console.log('场景3 加载完成');
    scene3.addEventListener('model-loaded', function () {
        let paper = scene3.object3D.getObjectByName('y校');
        if (paper) {
            console.log('存在交互3 物体：y校')
            paper.userData.clickable = true;
            // TODO 考虑实现“撕”这个动作
            interactionManager.registerObject(paper, async () => {
                paper.setAttribute('visible', 'false');
                console.log('按钮交互3被点击');
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(3);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data);
            }, 'high', { min_distance: 0, max_distance: 5 })
        } else {
            console.log('没有找到交互3按钮');
        }
    });
}

function createText(quez_data) {
    const panel = document.getElementById('text-panel');
    const answersLength = quez_data.answers.length;
    console.log("answersLength", answersLength);
    const shuffledAnswers = shuffle(quez_data.answers.slice()); // 打乱答案顺序
    console.log("shuffledAnswers", shuffledAnswers);
    const questionText = document.createElement('a-entity');
    questionText.id = "question";
    questionText.setAttribute('text-animation', { text: quez_data.quez.question, charsPerLine: 20, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
    // questionText.setAttribute('log-all-events', { debug: false });
    panel.appendChild(questionText);
    shuffledAnswers.forEach((answer, index) => {
        const answerText = document.createElement('a-entity');
        answerText.id = "answer" + index;
        panel.appendChild(answerText);
        // answerText.isAnimating = false;  
        answerText.setAttribute("background", { color: "#000" });
        // 点击答案区域的话，发送选中答案给后端
        answerText.addEventListener('click', () => {
            submitAnswer(quez_data.quez.id, answer.id, answer.score).then((result) => {
                // console.log("提交答案成功", result);
                // questionText.setAttribute('visible', 'false');
                panel.setAttribute('visible', 'false');
            });
        });
    });

    panel.addEventListener('textAnimationEnd', (event) => {
        const { nextPosition, nextEl } = event.detail;
        let textEl = document.getElementById(nextEl);

        if (textEl) {
            let parts = nextEl.split("answer");
            let index = parseInt(parts[1], 10) + 1;
            let text = shuffledAnswers[index - 1].answer;
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

