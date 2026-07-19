import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import *as TWEEN from "@tweenjs/tween.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();

        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();

        //素体設定
        const geomatery = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const cube = new THREE.Mesh(geomatery, material);
        this.scene.add(cube);

        //アニメーション
        const tweeninfo = { positionX: 0.0, positionY: 5.0 };//初期位置設定
        const updatePosition = () => {
            cube.position.x = tweeninfo.positionX;
            cube.position.y = tweeninfo.positionY;
        }
        const tween1 = new TWEEN.Tween(tweeninfo).to({ positionX: 5.0, positionY: 0.0 }, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updatePosition);//伸びる    
        const tween2 = new TWEEN.Tween(tweeninfo).to({ positionX: 0.0, positionY: -5.0 }, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updatePosition)
        const tween3 = new TWEEN.Tween(tweeninfo).to({ positionX: -5.0, positionY: 0.0 }, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updatePosition)
        const tween4 = new TWEEN.Tween(tweeninfo).to({ positionX: 0.0, positionY: 5.0 }, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updatePosition)
        tween1.chain(tween2);
        tween2.chain(tween3);
        tween3.chain(tween4);
        tween4.chain(tween1);
        const group = new TWEEN.Group();
        group.add(tween1);
        group.add(tween2);
        group.add(tween3)
        group.add(tween4);
        tween1.start();

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            requestAnimationFrame(update);
            group.update(_time);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 10));
    document.body.appendChild(viewport);
}
