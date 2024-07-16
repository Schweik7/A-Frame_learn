import * as TWEEN from '@tweenjs/tween.js';
import { fetchData, quezData as localQuezData } from './utils/utils';
import { USE_LOCAL_DATA } from './config';
import { createText } from '.';
let quez_data = null;

export function secondSceneListenerInit() {
    let scene2 = document.getElementById('scene2');
    if (!scene2) {
        console.log('没有找到场景2');
        return;
    }
    function handleModelLoaded(model) {
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
    }
    const model = scene2.getObject3D('mesh');
    if (model) {
        handleModelLoaded(model);
    } else {
        scene11.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}
export function thirdSceneListenerInit() {
    let scene3 = document.getElementById('scene3');
    if (!scene3) {
        console.log('没有找到场景3');
        return;
    }
    function handleModelLoaded(model) {
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
            }, 'high', { min_distance: 0, max_distance: 5 });
        }
    }

    const model = scene3.getObject3D('mesh');
    if (model) {
        handleModelLoaded(model);
    } else {
        scene11.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}
export function forthSceneListenerInit() {
    let scene4 = document.getElementById('scene4');
    if (!scene4) {
        console.log('没有找到场景4');
        return;
    }
    function handleModelLoaded(model) {
        let centerPhoto = scene4.object3D.getObjectByName('交互4');
        if (centerPhoto) {
            centerPhoto.userData.clickable = true;
            interactionManager.registerObject(centerPhoto, async () => {
                console.log('按钮交互4被点击');
                // 006左下，008右下，007中下，
                const photos = ['立方体', '立方体001', '立方体004', '立方体005', '立方体008', '立方体007', '立方体006', '立方体003', '交互4',];
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
    }
    const model = scene4.getObject3D('mesh');
    if (model) {
        handleModelLoaded(model);
    } else {
        scene11.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}

export function fifthSceneListenerInit() {
    let scene5 = document.getElementById('scene5');
    if (!scene5) {
        console.log('没有找到场景5');
        return;
    }
    function handleModelLoaded(model) {
        let interactLine = scene5.object3D.getObjectByName('交互5_6');
        if (interactLine) {
            interactLine.userData.clickable = true;
            interactionManager.registerObject(interactLine, async () => {
                console.log('按钮交互5被点击');
                scene5.object3D.getObjectByName('球体5_6').visible = false;
                // 让scene5产生向上移动的动画

                scene5.setAttribute('material', { opacity: 1, transparent: true });
                let position = scene5.getAttribute('position');
                scene5.setAttribute('animation__position', {
                    property: 'position',
                    to: `${position.x} ${position.y + 10} ${position.z}`,
                    dur: 12000,
                    easing: 'linear'
                });
                scene5.setAttribute('animation__opacity', {
                    property: 'material.opacity',
                    to: 0,
                    dur: 12000,
                    easing: 'linear'
                });
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(5);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data, scene5);
            }, 'high', { min_distance: 0, max_distance: 5 });
        } else {
            console.log('没有找到交互5_6');
        }
    }
    const model = scene5.getObject3D('mesh');
    if (model) {
        console.log('场景5的模型已加载');
        handleModelLoaded(model);
    } else {
        console.log('场景5的模型未加载');
        scene5.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}
// 点击“交互7&8”，文字“风凉话”向“交互7&8”移动，移动完成出现题目
// TODO 待完善
export function seventhSceneListenerInit() {
    return;
    let scene7 = document.getElementById('scene7');
    if (!scene7) {
        console.log('没有找到场景7');
        return;
    }
    function handleModelLoaded(model) {
        let interactLine = scene7.object3D.getObjectByName('交互7_8');
        if (interactLine) {
            interactLine.userData.clickable = true;
            interactionManager.registerObject(interactLine, async () => {
                console.log('按钮交互7被点击');
                scene7.object3D.getObjectByName('球体7_8').visible = false;
                // 让scene7产生向上移动的动画
                scene7.setAttribute('material', { opacity: 1, transparent: true });
                let position = scene7.getAttribute('position');
                scene7.setAttribute('animation__position', {
                    property: 'position',
                    to: `${position.x} ${position.y + 10} ${position.z}`,
                    dur: 12000,
                    easing: 'linear'
                });
            }, 'high', { min_distance: 0, max_distance: 5 });
        } else {
            console.log('没有找到交互7_8');
        }
    }
    const model = scene7.getObject3D('mesh');
    if (model) {
        console.log('场景7的模型已加载');
        handleModelLoaded(model);
    } else {
        console.log('场景7的模型未加载');
        scene7.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}

//1.点击“交互9&101”，翻转
// 2.点击“交互9&102”，翻转
// 3.2个都翻转完毕出现测验题目

export function ninthSceneListenerInit() {
    let scene9 = document.getElementById('scene9');
    if (!scene9) {
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
            let paper = scene9.object3D.getObjectByName(name);
            if (paper) {
                paper.userData.clickable = true;
                interactionManager.registerObject(paper, async () => {
                    setTimeout(() => {
                        new TWEEN.Tween(paper.rotation)
                            .to({ y: paper.rotation.y + Math.PI }, 1000) // 旋转180度
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();
                    }, 300);

                    // 更新点击状态
                    clickState[name] = true;
                    if (checkAllClicked()){ // 检查并执行下一步操作
                        if (!USE_LOCAL_DATA) {
                            quez_data = await fetchData(9);
                        }
                        else {
                            quez_data = localQuezData;
                        }
                        createText(quez_data, scene9);
                    } 
                }, 'high', { min_distance: 0, max_distance: 5 });
            }
        });
    }

    const model = scene9.getObject3D('mesh');
    if (model) {
        console.log('场景9的模型已加载');
        handleModelLoaded(model);
    } else {
        console.log('场景9的模型未加载');
        scene9.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}
