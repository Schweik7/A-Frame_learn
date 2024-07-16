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
        } else {
            console.log('没有找到交互3按钮');
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
                
                if (!USE_LOCAL_DATA) {
                    quez_data = await fetchData(5);
                }
                else {
                    quez_data = localQuezData;
                }
                createText(quez_data, scene5);
            }, 'high', { min_distance: 0, max_distance: 5 });
        }
    }
    const model = scene5.getObject3D('mesh');
    if (model) {
        handleModelLoaded(model);
    } else {
        scene11.addEventListener('model-loaded', function (e) {
            handleModelLoaded(e.detail.model);
        });
    }
}