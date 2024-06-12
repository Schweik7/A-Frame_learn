import { initApplication } from "../index";
const hostname = window.location.hostname;
let backendhost = `http://${hostname}:8000`
let backendLoginUrl = `${backendhost}/auth/jwt/login`;
let backendQuezUrl = `${backendhost}/quez`;
export let frontendhost = `http://${hostname}:5500`
let hoveredAnswer = null;
export let quezData = {
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

export function isLogined() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        return true;
    } else {
        return false;
    }
}

export async function login(username, password = "DSTTest") {
    try {
        const response = await fetch(backendLoginUrl, {
            method: 'POST',
            headers: {
                "Accept": "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: `${username}@example.com`,
                password
            }).toString(),
            mode:'cors'
        });

        const data = await response.json();

        if (response.ok) {
            return data.access_token;
        } else {
            if (data.detail === "LOGIN_BAD_CREDENTIALS") {
                const success = await register(username, password);
                if (success) {
                    return await login(username, password);
                }
            } else {
                console.error('Login failed:', data.detail);
            }
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}
export async function logout() {
    const authToken = localStorage.getItem('authToken');
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Authorization": `Bearer ${authToken}`
    }
    let response = await fetch(`${backendhost}/auth/jwt/logout`, {
        method: "post",
        headers: headersList
    });
    console.log(response);
    if (response.ok) {
        localStorage.removeItem('authToken');
        return true;
    } else {
        console.error('Failed to logout:', response);
        return false;
    }
}

export async function fetchData(quezID = 1) {
    try {
        const authToken = localStorage.getItem('authToken');
        let headersList = {
            "Accept": "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            "Authorization": `Bearer ${authToken}`
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

export function initUserAuth() {
    const loginForm = document.getElementById('login-form');
    // const logoutButton = document.getElementById('logout-button');
    const asciiArt = document.getElementById('ascii-art');
    // const userInfo = document.getElementById('user-info');
    // const userEmail = document.getElementById('user-email');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const token = await login(username, password);
        if (token) {
            localStorage.setItem('authToken', token);
            loginForm.style.display = 'none'; // 登录成功后隐藏登录表单
            asciiArt.style.display = 'none';
            initApplication();
        }
    });
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        loginForm.style.display = 'none';
        asciiArt.style.display = 'none';
        initApplication();
    }
}

export async function register(username, password = "DSTTest") {
    try {
        const response = await fetch(`${backendhost}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: `${username}@example.com`,
                password,
                is_active: true,
                is_superuser: false,
                is_verified: false
            })
        });
        const data = await response.json();
        if (!response.ok) { //状态码在 200-299 范围内；创建成功将返回201
            console.error('Registration failed:', data.detail);
        }
        else {
            console.log('Registration success:', data);
            return true;
        }
    } catch (error) {
        console.error('Registration failed:', error.JSON);
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

export function changeColor(entityEl, params) {
    // console.log("changeColor", entityEl.id, params);
    const { eventName, targetColor } = params;
    if (targetColor == undefined) {
        if (eventName == 'mouseleave') targetColor = '#f00';
        else if (eventName == 'mouseenter') targetColor = '#ff0';
    }
    // hoveredAnswer = entityEl.id;
    const textGeometries = entityEl.textEl.querySelectorAll('[text-geometry]');
    textGeometries.forEach(textEl => {
        textEl.setAttribute('material', { color: targetColor, transparent: true, opacity: 50 });
    });
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function submitAnswer(quez_id, answer_id,score) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('No auth token found');
        throw new Error('No auth token found');
    }

    try {
        const response = await fetch(`http://localhost:8000/choice/${quez_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`
            },
            body: new URLSearchParams({
                answer_id: answer_id,
                score: score // 假设这里的score是0，你可以根据需求更改
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Answer submitted successfully:', data);
            return data;
        } else {
            const errorData = await response.json();
            console.error('Failed to submit answer:', errorData);
            throw new Error(errorData.detail);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        throw error;
    }
}