import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';// 能够通过_target参数实现事件代理
import './components/aframe-keyboard-controll-controller';
import './components/aframe-log-all-events';
import './components/aframe-look-at-component';
import './components/aframe-focus-on-click-component';
import './components/aframe-task-complete-component';
import * as TWEEN from '@tweenjs/tween.js';
// import './components/aframe-proxy-event-component'; // 这个组件的事件代理会emit一个customEvent，不利于代码编写
import { initRecordingAndLogout } from './utils/recording';
import { fetchData, submitAnswer, textAnimation, changeColor, quezData as localQuezData, isLogined, initUserAuth, shuffle } from './utils/utils';
import { InteractionManager } from './utils/interactionManager'
import { USE_LOCAL_DATA } from './config';
let quez_data = null; // 问题数据
let loadedScene = false;
let shuffledAnswers = null;
let answersLength = null;
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
    forthSceneListenerInit();
    textPanelListenerInit();
}

function textPanelListenerInit() {
    let panel = document.getElementById('text-panel');
    panel.addEventListener('textAnimationEnd', (event) => {
        const { nextPosition, nextEl } = event.detail;
        let textEl = document.getElementById(nextEl);

        if (textEl) {
            let parts = nextEl.split("answer");
            let index = parseInt(parts[1], 10) + 1;
            let text = shuffledAnswers[index - 1].answer; // shuffledAnswers是一个全局变量，每次获取题目都会更新
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

function getAnswerText(index) {
    return shuffledAnswers[index - 1].answer
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
            pushButton.userData.clickable = true;
            interactionManager.registerObject(pushButton, async () => {
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(2);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data, scene2);
            }, 'high', { min_distance: 0, max_distance: 5 });
        }
    });
}


function thirdSceneListenerInit() {
    let scene3 = document.getElementById('scene3');
    scene3.addEventListener('model-loaded', function () {
        let paper = scene3.object3D.getObjectByName('页2');
        if (paper) {
            paper.userData.clickable = true;
            interactionManager.registerObject(paper, async () => {
                paper.visible = false;
                scene3.object3D.getObjectByName('y校').visible = false;
                scene3.object3D.getObjectByName('目标').visible = false;
                console.log('按钮交互3被点击');
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(3);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data, scene3);
            }, 'high', { min_distance: 0, max_distance: 5 })
        } else {
            console.log('没有找到交互3按钮');
        }
    });
}

function forthSceneListenerInit() {
    let scene4 = document.getElementById('scene4');
    scene4.addEventListener('model-loaded', function () {
        let centerPhoto = scene4.object3D.getObjectByName('交互4');
        if (centerPhoto) {
            console.log("找到交互4按钮");
            centerPhoto.userData.clickable = true;
            interactionManager.registerObject(centerPhoto, async () => {
                console.log('按钮交互4被点击');
                // 006左下，008右下，007中下，
                const photos = ['立方体', '立方体001', '立方体004', '立方体005', '立方体008', '立方体007', '立方体006', '立方体003', '交互4',]
                photos.forEach((photoName, index) => {
                    const photoEl = scene4.object3D.getObjectByName(`${photoName}`);
                    if (photoEl) {
                      // 不是a-entity，无法使用setAttribute内置动画
                        setTimeout(() => {
                            new TWEEN.Tween(photoEl.rotation)
                            .to({ y: photoEl.rotation.y + Math.PI }, 1000) // 旋转180度
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();
                        }, index * 200);
                    }
                    else {
                        console.log(`没有找到${photoName}照片`);
                    }
                });
                function animate(time) {
                    requestAnimationFrame(animate);
                    TWEEN.update(time);
                  }
                animate();
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(4);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data, scene4);
            }, 'high', { min_distance: 0, max_distance: 5 });
        }
    });
}


function createText(quez_data, sourceEl) {
    const panel = document.getElementById('text-panel');
    answersLength = quez_data.answers.length;
    shuffledAnswers = shuffle(quez_data.answers.slice()); // 打乱答案顺序
    const questionText = document.createElement('a-entity');
    questionText.id = "question";
    questionText.setAttribute('text-animation', { text: quez_data.quez.question, charsPerLine: 20, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
    // questionText.setAttribute('log-all-events', { debug: false });
    panel.appendChild(questionText);
    shuffledAnswers.forEach((answer, index) => {
        const answerText = document.createElement('a-entity');
        answerText.id = "answer" + index;
        panel.appendChild(answerText);
        answerText.setAttribute("background", { color: "#000" });
        // 点击答案区域的话，发送选中答案给后端
        answerText.addEventListener('click', () => {
            console.log("点击了答案", answer.answer);
            submitAnswer(quez_data.quez.id, answer.id, answer.score).then((result) => {
                //  将text-panel的所有内部html都清空，也就是删除那些子组件
                sourceEl.emit('taskcompleted'); // 触发任务完成事件，将删除该组件
            });
        });
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

