import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from 'lil-gui';
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
class ThreeJSContainer {
    private scene!: THREE.Scene;
    private geometry!: THREE.BufferGeometry;
    private material!: THREE.Material;
    private cube!: THREE.Mesh;
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
        const gui = new GUI(); // GUI用のインスタンスの生成
        const guiObj = { rotationSpeedX: 0.01, rotationSpeedY: 0.01 };
        gui.add(guiObj, "rotationSpeedX", 0.0, 0.2);
        gui.add(guiObj, "rotationSpeedY", 0.0, 0.2);  // GUIのパラメータ
        gui.add(guiObj, "rotationSpeedX", 0.0, 0.2); //GUIの設定
        const guiObj2 = { color: '#ffffff' };
        gui.addColor(guiObj2, "color");
        const guiObj3 = { visible: true };
        gui.add(guiObj3, "visible");
        const guiObj4 = { size: 1 }
        gui.add(guiObj4, 'size', { Small: 0.5, Medium: 1, large: 2 });
        const guiObj5 = { mode: "Wave" };
        gui.add(guiObj5, "mode", ["Wave", "Klein"]).onChange((value: string) => {
            this.scene.remove(group);

            if (value === "Wave") {
                group = createParamMesh(waveFunc);
            } else {
                group = createParamMesh(kleinFunc);
            }
            this.scene.add(group);
        });

        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshLambertMaterial({ color: 0x55ff00 });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.castShadow = true;
        //this.scene.add(this.cube);

        //以下球体のmyPlane
        // const myPlane = (u: number, v: number, target: THREE.Vector3) => {
        //     const r = 10;
        //     u *= 2 * Math.PI;
        //     v = v * Math.PI - Math.PI / 2;
        //     const x = r * Math.cos(u) * Math.cos(v);
        //     const y = r * Math.sin(u) * Math.cos(v);
        //     const z = r * Math.sin(v)
        //     target.set(x, y, z);
        // }

        // Wave
        const waveFunc = (u: number, v: number, target: THREE.Vector3) => {
            const r = 30;
            const x = u * r - r / 2;
            const z = v * r - r / 2;
            const y = Math.sin(Math.sqrt(x * x + z * z));
            target.set(x, y, z);
        };

        // Klein
        const kleinFunc = (u: number, v: number, target: THREE.Vector3) => {
            u *= 2 * Math.PI;
            v *= 2 * Math.PI;
            const r = 4 - 2 * Math.cos(u);
            let x, y, z;
            if (u < Math.PI) {
                x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
                y = 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
            } else {
                x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
                y = 16 * Math.sin(u);
            }
            z = r * Math.sin(v);
            target.set(x, y, z);
        };
        const createParamMesh = (func: any) => {
            const geo = new ParametricGeometry(func, 30, 30);
            const mesh = new THREE.Mesh(
                geo,
                new THREE.MeshPhongMaterial({ color: 0x00ffff, side: THREE.DoubleSide, flatShading: true })
            );
            const wire = new THREE.LineSegments(
                geo,
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
            );
            const group = new THREE.Group();
            group.add(mesh);
            group.add(wire);
            return group;
        };
        let group = createParamMesh(waveFunc);
        this.scene.add(group);


        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);

        this.scene.add(this.light);
        this.scene.add(group);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            this.cube.rotateX(guiObj.rotationSpeedX);
            this.cube.rotateY(guiObj.rotationSpeedY);
            this.light.color.set(guiObj2.color);
            this.cube.visible = guiObj3.visible;
            this.cube.scale.set(guiObj4.size, guiObj4.size, guiObj4.size);
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(-3, 3, 3));
    document.body.appendChild(viewport);
}
