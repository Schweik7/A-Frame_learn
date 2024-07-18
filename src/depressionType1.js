import * as TWEEN from '@tweenjs/tween.js';
import { fetchData, quezData as localQuezData,initializeSceneListener} from './utils/utils';
import { USE_LOCAL_DATA } from './config';
import { createText } from '.';
let quez_data = null;

export function secondSceneListenerInit() {
    initializeSceneListener('scene2', '交互2', (interactionObject, curScene) => {});
}
export function thirdSceneListenerInit() {
    initializeSceneListener('scene3', '页2', (interactionObject, curScene) => {
        interactionObject.visible = false;
        curScene.object3D.getObjectByName('y校').visible = false;
        curScene.object3D.getObjectByName('目标').visible = false;
        console.log('按钮交互3被点击');
    });
}
export function forthSceneListenerInit() {
    initializeSceneListener('scene4', '交互4', (interactionObject, curScene) => {
        console.log('按钮交互4被点击');
        const photos = ['立方体', '立方体001', '立方体004', '立方体005', '立方体008', '立方体007', '立方体006', '立方体003', '交互4',];
        photos.forEach((photoName, index) => {
            const photoEl = curScene.object3D.getObjectByName(`${photoName}`);
            if (photoEl) {
                setTimeout(() => {
                    new TWEEN.Tween(photoEl.rotation)
                        .to({ y: photoEl.rotation.y + Math.PI }, 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                }, index * 200);
            } else {
                console.log(`没有找到${photoName}照片`);
            }
        });
        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
        }
        animate();
    });
}

export function fifthSceneListenerInit() {
    initializeSceneListener('scene5', '交互5_6', (interactionObject, curScene) => {
        console.log('按钮交互5被点击');
        curScene.object3D.getObjectByName('球体5_6').visible = false;
        curScene.setAttribute('material', { opacity: 1, transparent: true });
        let position = curScene.getAttribute('position');
        curScene.setAttribute('animation__position', {
            property: 'position',
            to: `${position.x} ${position.y + 10} ${position.z}`,
            dur: 12000,
            easing: 'linear'
        });
        curScene.setAttribute('animation__opacity', {
            property: 'material.opacity',
            to: 0,
            dur: 12000,
            easing: 'linear'
        });
    });
}
// 点击“交互7&8”，文字“风凉话”向“交互7&8”移动，移动完成出现题目
// TODO 待完善
export function seventhSceneListenerInit() {
    initializeSceneListener('scene7', '交互7_8', (interactionObject, curScene) => {
        console.log('按钮交互7被点击');
    });
}

//1.点击“交互9&101”，翻转
// 2.点击“交互9&102”，翻转
// 3.2个都翻转完毕出现测验题目

export function ninthSceneListenerInit() {
    let curScene = document.getElementById('scene9');
    if (!curScene) {
        console.log('没有找到场景9');
        return;
    }

    // 状态管理器
    const clickState = {
        'a成绩单': false,
        '非a成绩单': false
    };

    function checkAllClicked() {
        // 检查所有交互对象是否都已被点击
        if (clickState['a成绩单'] && clickState['非a成绩单']) {
            // 触发下一步操作
            console.log('两个对象都被点击，进行下一步操作');
            return true;
        }
        return false;
    }

    function handleModelLoaded(model) {
        const names = ['a成绩单', '非a成绩单'];
        names.forEach(name => {
            let paper = curScene.object3D.getObjectByName(name);
            if (paper) {
                paper.userData.clickable = true;
                interactionManager.registerObject(paper, async () => {
                    setTimeout(() => {
                        // 为什么这里同样是绕y轴旋转，但是改的是z的rotation?
                        new TWEEN.Tween(paper.rotation)
                            .to({ z: paper.rotation.z+ Math.PI }, 1000) // 旋转180度
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();
                    }, 300);

                    // 更新点击状态
                    clickState[name] = true;
                    if (checkAllClicked()) { // 检查并执行下一步操作
                        if (!USE_LOCAL_DATA) {
                            quez_data = await fetchData(9);
                        }
                        else {
                            quez_data = localQuezData;
                        }
                        createText(quez_data, curScene);
                    }
                }, 'high', { min_distance: 0, max_distance: 5 });
            }
        });
        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
        }
        animate();
    }

    const model = curScene.getObject3D('mesh');
    if (model) {
        console.log('场景9的模型已加载');
        handleModelLoaded(model);
    } else {
        console.log('场景9的模型未加载');
        curScene.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}
