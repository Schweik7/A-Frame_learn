import * as TWEEN from '@tweenjs/tween.js';
import { fetchData, quezData as localQuezData } from './utils/utils';
import { USE_LOCAL_DATA } from './config';
import { createText } from '.';
let quez_data = null;


export function eleventhSceneListenerInit() {
    let scene11 = document.getElementById('scene11');
    if (!scene11) {
        console.error('scene11 not found');
        return;
    }
    
    // 函数用于处理模型加载后的逻辑
    const handleModelLoaded = (model) => {
        // model.traverse((node) => {
        //     if (node.isMesh) {
        //         node.material.wireframe = true;
        //         console.log("为场景11中的模型添加了线框", node.name);
        //     }
        // });
        
        let pushButton = scene11.object3D.getObjectByName('电池外壳'); // 还有电池两端也可以
        if (pushButton) {
            pushButton.userData.clickable = true;
            interactionManager.registerObject(pushButton, async () => {
                pushButton.material.transparent = true;
                pushButton.material.opacity = 0.3;
                const animationMixer = scene11.components['animation-mixer'];
                if (animationMixer) {
                    animationMixer.data.timeScale = 1;
                    animationMixer.playAction();
                }
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(11);
                } else {
                    quez_data = localQuezData;
                }
                // createText(quez_data, scene11);
            }, 'high', { min_distance: 0, max_distance: 5 });
        } else {
            console.error('场景11中pushButton not found');
        }
    };

    // 检查模型是否已经加载，如加载则处理，否则监听事件
    const model = scene11.getObject3D('mesh');
    if (model) {
        handleModelLoaded(model);
    } else {
        scene11.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}

//用户可以点击或拖动任务条目，尝试重新安排时间或调整优先级
export function twelfthSceneListenerInit() { }
//用户前往未完工的桥梁部分，查看任务卡片，完成任务（如回答学习相关的问题或进行学习任务的模拟操作）。
export function thirteenthSceneListenerInit() { }
//手机屏幕上不断弹出点外卖、短视频和游戏邀请
export function fourteenthSceneListenerInit() { }
