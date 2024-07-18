import './components/aframe-v1.6.0';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';// 能够通过_target参数实现事件代理
import './components/aframe-keyboard-controll-controller';
import './components/aframe-log-all-events';
import './components/aframe-look-at-component';
import './components/aframe-focus-on-click-component';
import './components/aframe-task-complete-component';
import './components/animation-mixer.js';
// import './components/aframe-proxy-event-component'; // 这个组件的事件代理会emit一个customEvent，不利于代码编写
import { initRecordingAndLogout } from './utils/recording';
import { submitAnswer, textAnimation, changeColor, isLogined, initUserAuth, shuffle } from './utils/utils';
import { InteractionManager } from './utils/interactionManager'
import { secondSceneListenerInit, thirdSceneListenerInit, forthSceneListenerInit,fifthSceneListenerInit,ninthSceneListenerInit,seventhSceneListenerInit} from './depressionType1';
import { eleventhSceneListenerInit, twelfthSceneListenerInit, thirteenthSceneListenerInit, fourteenthSceneListenerInit } from './depressionType2';

let loadedScene = false;
let shuffledAnswers = null;
let answersLength = null;
window.originalPositions = {};
window.textAnimation = textAnimation;
const sceneShown=[4,5,6,7,8,9,10] //控制哪些场景需要被展示 

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
            interactionManager.registerObject(boat_flag, allScenesVisible);
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
    fifthSceneListenerInit();
    seventhSceneListenerInit();
    ninthSceneListenerInit();
    
    eleventhSceneListenerInit();
    twelfthSceneListenerInit();
    thirteenthSceneListenerInit();
    fourteenthSceneListenerInit();

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

function allScenesVisible() {
    main_scene.setAttribute('visible', 'false');
    let curScene = null;

    // const typeShownFlag=[false,true,false,false,false,false];
    // const scenesIndex=[[1,2,3,4,5,6,7,8,9,10],[11,12,13,14],[15,16,17,18,19],[20,21,22,23,24,25,26,27,28],[29,30,31,32,33,34],[35,36,37,38,39,40]]; //一共有六种 1-10,11-14,15-19,20-28,29-34,35-40
    // for (let i = 0; i < scenesIndex.length; i++) {
    //     if (!typeShownFlag[i]) continue;
    //     let sceneIndex = scenesIndex[i];
    //     for (let j = 0; j < sceneIndex.length; j++) {
    //         let index = sceneIndex[j];
    //         curScene = document.getElementById(`scene${index}`);
    //         if (curScene) {
    //             curScene.setAttribute('visible', 'true');
    //         }
    //     }
    // }


    for (let i = 0; i < sceneShown.length; i++) {
        let index = sceneShown[i];
        curScene = document.getElementById(`scene${index}`);
        if (curScene) {
            curScene.setAttribute('visible', 'true');
        }
    }

    let boat_flag = main_scene.object3D.getObjectByName('旗帜');
    interactionManager.unregisterObject(boat_flag)
}


export function createText(quez_data, sourceEl) {
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
        // answerText.setAttribute("background", { color: "#000" });
        // 在Aframe1.6中，Component `background` can only be applied to <a-scene>
        // 点击答案区域的话，发送选中答案给后端
        answerText.addEventListener('click', () => {
            console.log("点击了答案", answer.answer);
            submitAnswer(quez_data.quez.id, answer.id, answer.score).then((result) => {
                //  将text-panel的所有内部html都清空，也就是删除那些子组件
                if(sourceEl) // 有可能这个模型已经被删除了
                    sourceEl.emit('taskcompleted'); // 触发任务完成事件，将删除该组件
                panel.innerHTML = "";
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

