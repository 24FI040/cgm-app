import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
        const points: THREE.Vector2[] = [];
        const pointNum = 30;

        // 半円（右半分）の輪郭を作る
        for (let i = 0; i <= pointNum; i++) {
            const theta = Math.PI * i / pointNum - Math.PI / 2;

            points.push(
                new THREE.Vector2(
                    Math.cos(theta),
                    Math.sin(theta)
                )
            );
        }

        // 回転体を作成
        const latheGeometry = new THREE.LatheGeometry(points, 64);
        const latheMaterial = new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
        });
        const latheMesh = new THREE.Mesh(latheGeometry, latheMaterial);
        this.scene.add(latheMesh);

        // 輪郭点を表示（確認用）
        const sphereGeometry = new THREE.SphereGeometry(0.03);
        const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        for (let i = 0; i < points.length; i++) {
            const mesh = new THREE.Mesh(sphereGeometry, redMaterial);
            mesh.position.set(points[i].x, points[i].y, 0);
            this.scene.add(mesh);
        }
        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 3));
    document.body.appendChild(viewport);
}
