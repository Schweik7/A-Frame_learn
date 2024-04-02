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

function textAnimation(textEl, index, curPosition, data, charLineIndex, currentLine, oriPosition) {
    const baseDelay = 500; // 基础延迟
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
                        _event:"mouseenter",_function:"close2Center"
                    })
                    // answerText.setAttribute('event-set__move', {
                    //     _event:"mouseenter",_function:"close2Center"
                    // })
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
                            text: text, color: '#F00', font: '#myFont', charsPerLine: 15, indent: 0, _function: 'textAnimation', signalTarget: nextTarget, 'position': nextPosition
                        });
                    }
                    else return
                });

                const questionText = document.createElement('a-entity');
                questionText.setAttribute('text-animation', { text: quez_data.quez.question_type + ': ' + quez_data.quez.question, charsPerLine: 15, color: '#FFF', font: '#myFont', _function: 'textAnimation', signalTarget: "answer0" });// 当问题展示完毕后，发送信号给第一个答案
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
const answer1_entity=document.getElementById('answer0');
function close2Center(entityEl) {
    console.log(entityEl);
    const textGeometries = entityEl.querySelectorAll('[text-geometry]');
    textGeometries.forEach(textEl => {
        const currentPosition = textEl.getAttribute('position');
        const targetZ = currentPosition.z + 1; // 假设我们想将Z值减小1
        const animationAttr = `property: position; to: ${currentPosition.x} ${currentPosition.y} ${targetZ}; dur: 1000`; // 持续时间为1000ms
        textEl.setAttribute('animation', animationAttr);
    });
}
window.close2Center=close2Center;




