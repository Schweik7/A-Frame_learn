let backendhost = 'http://localhost:8000';
let backendLoginUrl=`${backendhost}/auth/login`;
let backendQuezUrl = `${backendhost}/quez`;
let hoveredAnswer = null;
export let quezData={
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
export async function fetchData(quezID = 1) {
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

export function textAnimation(textEl, index, curPosition, data, charLineIndex, currentLine, oriPosition) {
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

export function changeColor(entityEl, targetColor) {
    hoveredAnswer = entityEl.id;
    const textGeometries = entityEl.querySelectorAll('[text-geometry]');
    textGeometries.forEach(textEl => {
        textEl.setAttribute('material', { color: targetColor, transparent: true, opacity: 50 });
    });
}
