import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private cloudBlue!: THREE.Points;
    private cloudGreen!: THREE.Points;
    private cloudPink!: THREE.Points;
    private timer!: THREE.Timer;

    constructor() {
        this.timer = new THREE.Timer();
    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.shadowMap.enabled = true;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        this.createScene();
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
        const generateSprite = (coreColor: string, edgeColor: string) => {
            const canvas = document.createElement("canvas");
            canvas.width = 16;
            canvas.height = 16;

            const context = canvas.getContext("2d")!;
            let gradient = context.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            gradient.addColorStop(0, "rgba(255,255,255,1)");
            gradient.addColorStop(0.3, coreColor);
            gradient.addColorStop(0.6, edgeColor);
            gradient.addColorStop(1, "rgba(0,0,0,1)");

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
        const createPoints = (geom: THREE.BufferGeometry, texture: THREE.Texture) => {
            const material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.25,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                map: texture
            });
            return new THREE.Points(geom, material);
        }
        const geoBlue = new THREE.TorusGeometry(3.0, 0.4, 12, 48);
        const geoGreen = new THREE.TorusGeometry(2.2, 0.3, 10, 40);
        const geoPink = new THREE.TorusGeometry(1.4, 0.2, 8, 32);

        this.cloudBlue = createPoints(geoBlue, generateSprite("rgba(0,150,255,1)", "rgba(0,0,128,1)"));
        this.cloudGreen = createPoints(geoGreen, generateSprite("rgba(50,255,50,1)", "rgba(0,100,0,1)"));
        this.cloudPink = createPoints(geoPink, generateSprite("rgba(255,50,150,1)", "rgba(100,0,50,1)"));

        this.scene.add(this.cloudBlue);
        this.scene.add(this.cloudGreen);
        this.scene.add(this.cloudPink);

        // ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        const update: FrameRequestCallback = (_time) => {
            this.timer.update();
            const deltaTime = this.timer.getDelta();
            //blue
            const speedBlue = 0.4;
            this.cloudBlue.rotation.z += speedBlue * deltaTime;
            //green
            const speedGreen = -0.7;
            this.cloudGreen.rotation.y += speedGreen * deltaTime;
            //pink
            const speedPinkX = 0.5;
            const speedPinkZ = 0.3;
            this.cloudPink.rotation.x += speedPinkX * deltaTime;
            this.cloudPink.rotation.z += speedPinkZ * deltaTime;
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 4, 8));
    document.body.appendChild(viewport);
}