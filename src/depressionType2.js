import * as TWEEN from '@tweenjs/tween.js';
import {initializeSceneListener} from './utils/utils';


export function eleventhSceneListenerInit() {
    function handleEleventhInteraction(pushButton, curScene) {
        pushButton.material.transparent = true;
        pushButton.material.opacity = 0.3;
        const animationMixer = curScene.components['animation-mixer'];
        if (animationMixer) {
            animationMixer.data.timeScale = 1;
            animationMixer.playAction();
        }
    }

    initializeSceneListener('scene11', '电池外壳', handleEleventhInteraction);
}
//用户可以点击或拖动任务条目，尝试重新安排时间或调整优先级
export function twelfthSceneListenerInit() { }
//用户前往未完工的桥梁部分，查看任务卡片，完成任务（如回答学习相关的问题或进行学习任务的模拟操作）。
export function thirteenthSceneListenerInit() { }
//手机屏幕上不断弹出点外卖、短视频和游戏邀请
export function fourteenthSceneListenerInit() { }
