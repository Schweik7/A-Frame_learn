import './components/aframe';
import './components/text-geometry';
import './components/aframe-text-animation-component';
import './components/aframe-event-set-component';
import './components/aframe-keyboard-controll-controller';
import axios from 'axios';
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
window.originalPositions = {}; // 用于存储原始位置的对象
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

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('aframe-scene.html')
        .then(response => response.text())
        .then(data => {
            document.body.innerHTML += data;
            // const box=document.getElementById('interactive-box');box.emit('textAnimationEnd',{},true);
            // monitorEvents(element, 'myCustomEvent');
            function createText(data) {
                const panel = document.getElementById('text-panel');
                const answersLength = quez_data.answers.length;
                quez_data.answers.forEach((answer, index) => {
                    const answerText = document.createElement('a-entity');
                    answerText.id = "answer" + index;
                    panel.appendChild(answerText);
                    answerText.setAttribute('event-set__enter', {
                        _event: "mouseenter", _function: "close2Center"
                    });
                    answerText.setAttribute('event-set__leave', {
                        _event: "mouseleave", _function: "return2Original"
                    });
                    answerText.isAnimating = false;
                    answerText.setAttribute("background", { color: "#000"});
                });

                panel.addEventListener('textAnimationEnd', (event) => {
                    const { nextPosition, nextEl } = event.detail;
                    let textEl = document.getElementById(nextEl);

                    if (textEl) {
                        let parts = nextEl.split("answer");
                        let index = parseInt(parts[1], 10) + 1;
                        let text = quez_data.answers[index - 1].answer;
                        let nextTarget = "";
                        if (index < answersLength) nextTarget = "answer" + index;
                        textEl.setAttribute('text-animation', {
                            text: text, color: '#F00', font: '#myFont', charsPerLine: 15, indent: 0, _function: 'textAnimation', signalTarget: nextTarget, 'position': nextPosition, childID: `answer${index}Char`
                        });// todo：这里未来要考虑多个问题的情况

                    }
                    else return
                });
                const questionText = document.createElement('a-entity');
                questionText.id = "question";
                questionText.setAttribute('text-animation', { text: quez_data.quez.question_type + ': ' + quez_data.quez.question, charsPerLine: 15, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0", childID: "questionChar" });// 当问题展示完毕后，发送信号给第一个答案
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




const answer1_entity = document.getElementById('answer0');
function close2Center(entityEl, targetZ = -3.5, duration = 500) {
    if (entityEl.isAnimating) return;
    else {
        entityEl.isAnimating=true;
        const textGeometries = entityEl.querySelectorAll('[text-geometry]');
        textGeometries.forEach(textEl => {
            const currentPosition = textEl.getAttribute('position');
            if (currentPosition.z < targetZ) {
                textEl.setAttribute('animation', `property: position; to: ${currentPosition.x} ${currentPosition.y} ${targetZ}; dur: ${duration}`);
            }
        });
        setTimeout(() => {
            entityEl.isAnimating = false; // 清除标志，允许再次触发事件
        }, duration);
    }
}
window.close2Center = close2Center;

function return2Original(entityEl, duration = 500) {
    if (entityEl.isAnimating) return;
    else {
        entityEl.isAnimating=true;
        const textGeometries = entityEl.querySelectorAll('[text-geometry]');
        textGeometries.forEach(textEl => {
            const originalPosition = originalPositions[textEl.getAttribute('id')];
            textEl.setAttribute('animation', `property: position; to: ${originalPosition.x} ${originalPosition.y} ${originalPosition.z}; dur: ${duration}`);
        });
        setTimeout(() => {
            entityEl.isAnimating = false; // 清除标志，允许再次触发事件
        }, duration);
    }
}
window.return2Original = return2Original;
window.axios=axios;

// // register
// axios.post('http://localhost:8000/auth/register', {
//     email: 'king.arthur@camelot.bt',
//     password: 'guinevere',
// })
// .then((response) => console.log(response))
// .catch((error) => console.log(error));

// // login 
// const formData = new FormData();
// formData.set('username', 'king.arthur@camelot.bt');
// formData.set('password', 'guinevere');
// axios.post(
//     'http://localhost:8000/auth/jwt/login',
//     formData,
//     {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     },
// )
// .then((response) => console.log(response))
// .catch((error) => console.log(error));

// // get profile
// const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiNGZkMzQ3N2ItZWNjZi00ZWUzLThmN2QtNjhhZDcyMjYxNDc2IiwiYXVkIjoiZmFzdGFwaS11c2VyczphdXRoIiwiZXhwIjoxNTg3ODE4NDI5fQ.anO3JR8-WYCozZ4_2-PQ2Ov9O38RaLP2RAzQIiZhteM';
// axios.get(
//     'http://localhost:8000/users/me', {
//     headers: {
//         'Authorization': `Bearer ${TOKEN}`,
//     },
// })
// .then((response) => console.log(response))
// .catch((error) => console.log(error));

// https://fastapi-users.github.io/fastapi-users/10.1/usage/flow/?h=axios
