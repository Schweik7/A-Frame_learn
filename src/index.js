import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';
import './components/aframe-keyboard-controll-controller';
// import axios from 'axios';
// import { v4 as uuid4 } from 'uuid';
let backendhost = 'http://localhost:8000';
let backendLoginUrl=`${backendhost}/auth/login`;
let backendQuezUrl = `${backendhost}/quez`;
let USE_LOCAL_DATA = false; // 是否使用本地数据
let quez_data = null;
let hoveredAnswer = null;
window.originalPositions = {};
function textAnimation(textEl, index, curPosition, data, charLineIndex, currentLine, oriPosition) {
    const baseDelay = 500; // 基础延迟
    originalPositions[textEl.getAttribute('id')] = curPosition;
    setTimeout(() => {
        textEl.setAttribute('animation', {
            property: 'material.opacity',
            to: 1,
            dur: 500
        });
        if (index == data.text.length) {
            const { curPosition: cPos, charIndex, currentLine: cLine } = calcPosition(charLineIndex, data, currentLine, index, data.text, oriPosition);
            let nextEl = data.signalTarget || "";
            let detail = { nextPosition: cPos, nextEl: nextEl };
            // console.log("Emit textAnimationEnd signal detail", detail);
            textEl.emit("textAnimationEnd", detail, true);
        }

    }, index * 4 + baseDelay); // 延迟确保逐字显示的效果
}
window.textAnimation = textAnimation;

async function initApplication() {
    const response = await fetch('aframe-scene.html');
    const data = await response.text();
    document.body.innerHTML += data;
    createText();  // 此函数现在不需要传入data参数
}
function createText(data) {
    const panel = document.getElementById('text-panel');
    const answersLength = quez_data.answers.length;
    console.log("answersLength", answersLength);
    quez_data.answers.forEach((answer, index) => {
        const answerText = document.createElement('a-entity');
        answerText.id = "answer" + index;
        panel.appendChild(answerText);
        answerText.setAttribute('event-set__enter', {
            _event: "mouseenter", _function: "changeColor", _params: "#FF0"
        });
        answerText.setAttribute('event-set__leave', {
            _event: "mouseleave", _function: "changeColor", _params: "#F00"
        });
        // TODO但是字体的区域不是很准，可以考虑加一个pannel来框住文字区域
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
            });// todo：这里未来要考虑多个问题的情况
        }
        else return
    });
    const questionText = document.createElement('a-entity');
    questionText.id = "question";
    questionText.setAttribute('text-animation', { text: quez_data.quez.question, charsPerLine: 20, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
    panel.appendChild(questionText);
}
// 我想要实现动态加载，却发现下面的代码现在无法执行
document.addEventListener('DOMContentLoaded', () => {
    if (USE_LOCAL_DATA) {
        quez_data = {
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

async function fetchData(quezID = 1) {
    try {
        let headersList = {
            "Accept": "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTY2MmE4ZC02MWMwLTRkMDAtYThlYy1hMDg0ZjVkODIwN2YiLCJhdWQiOlsiZmFzdGFwaS11c2VyczphdXRoIl19.t_fCuAKL-XRd7O6195KpWW_Ix07dJ3L2uqFL-dyJ230"
        }

        let response = await fetch(`${backendQuezUrl}/${quezID}`, {
            method: "GET",
            headers: headersList
        });

        let data = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}


const answer1_entity = document.getElementById('answer0');
function changeColor(entityEl, targetColor) {
    hoveredAnswer = entityEl.id;
    const textGeometries = entityEl.querySelectorAll('[text-geometry]');
    textGeometries.forEach(textEl => {
        textEl.setAttribute('material', { color: targetColor, transparent: true, opacity: 50 });
    });
}
window.changeColor = changeColor;
