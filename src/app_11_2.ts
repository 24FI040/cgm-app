import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from "@tweenjs/tween.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() { }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.shadowMap.enabled = true; // シャドウマップを有効にする

        // カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        const geometry = this.createScene();

        // 毎フレームのupdateを呼んで，render
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();
            TWEEN.update();
            if (geometry) {
                const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
                positions.needsUpdate = true;
            }

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = (): THREE.BufferGeometry => {
        this.scene = new THREE.Scene();

        // geo
        const geometry = new THREE.BufferGeometry();
        // texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('./src/raindrop.png');

        // mate
        const material = new THREE.PointsMaterial({
            size: 1,
            map: texture,
            blending: THREE.AdditiveBlending,
            color: 0xFFFFFF,
            depthWrite: false,
            transparent: true,
            opacity: 0.5
        });

        // particle
        const particleNum = 1000;
        const positions = new Float32Array(particleNum * 3);

        for (let i = 0; i < particleNum * 3; i++) {
            positions[i] = 0.0;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const cloud = new THREE.Points(geometry, material);
        this.scene.add(cloud);

        const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < particleNum; ++i) {
            const tweeninfo = { x: 0.0, y: 0.0, z: 0.0 };
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const radius = 4.0;
            const targetX = radius * Math.sin(phi) * Math.cos(theta);
            const targetY = radius * Math.sin(phi) * Math.sin(theta);
            const targetZ = radius * Math.cos(phi);

            const updateParticlePosition = () => {
                positionAttribute.setXYZ(i, tweeninfo.x, tweeninfo.y, tweeninfo.z);
            };

            // 球体
            const expandTween = new TWEEN.Tween(tweeninfo)
                .to({ x: targetX, y: targetY, z: targetZ }, 2000 + Math.random() * 1000)
                .easing(TWEEN.Easing.Cubic.Out)
                .onUpdate(updateParticlePosition);

            // 中心
            const shrinkTween = new TWEEN.Tween(tweeninfo).to({ x: 0.0, y: 0.0, z: 0.0 }, 1500 + Math.random() * 1000).easing(TWEEN.Easing.Cubic.In).onUpdate(updateParticlePosition);
            expandTween.chain(shrinkTween);
            shrinkTween.chain(expandTween);
            expandTween.start();
        }

        // ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        return geometry;
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 10));
    document.body.appendChild(viewport);
}