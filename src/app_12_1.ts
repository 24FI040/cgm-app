//24FI040 木原穂乃花
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

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
        camera.lookAt(0, 0, 0);

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render 
        // // reqestAnimationFrame により次フレームを呼ぶ
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
    private createScene() {
        this.scene = new THREE.Scene();

        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        world.defaultContactMaterial.friction = 0.03;//摩擦係数
        world.defaultContactMaterial.restitution = 0;

        const meshes: THREE.Mesh[] = [];
        const bodies: CANNON.Body[] = [];

        const geo = new THREE.BoxGeometry(0.4, 1.2, 0.15);
        const mat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

        const count = 24;
        const radius = 2.2;

        for (let i = 0; i < count; i++) {
            const t = i * Math.PI * 2 / count;
            const x = radius * Math.cos(t);
            const z = radius * Math.sin(t);

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 0.6, z);
            mesh.rotation.y = -t;
            this.scene.add(mesh);
            meshes.push(mesh);

            const body = new CANNON.Body({ mass: 0.05 });
            body.addShape(new CANNON.Box(new CANNON.Vec3(0.2, 0.4, 0.05)));
            body.position.set(x, 0.6, z);
            body.quaternion.setFromEuler(0, -t, 0);
            world.addBody(body);
            bodies.push(body);
        }

        bodies[0].quaternion.setFromEuler(THREE.MathUtils.degToRad(25), 0, 0);

        const planeMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(25, 25),
            new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
        );
        planeMesh.rotation.x = -Math.PI / 2;
        this.scene.add(planeMesh);

        const planeBody = new CANNON.Body({ mass: 0 });
        planeBody.addShape(new CANNON.Plane());
        planeBody.quaternion.copy(planeMesh.quaternion as any);
        world.addBody(planeBody);
        // グリッド表示
        this.scene.add(new THREE.GridHelper(10));
        // 軸表示
        this.scene.add(new THREE.AxesHelper(5));
        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(1, 1, 1);
        this.scene.add(this.light);
        // 毎フレームのupdateを呼んで，更新 
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            world.fixedStep();
            for (let i = 0; i < meshes.length; i++) {
                meshes[i].position.copy(bodies[i].position as any);
                meshes[i].quaternion.copy(bodies[i].quaternion as any);
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 5, 5));
    document.body.appendChild(viewport);
}