//24FI040 木原穂乃花
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private cloud!: THREE.Points;
    // speedvector
    private particleVelocity!: THREE.Vector3[];
    private clock!: THREE.Clock; // 正確な時間測定のためにClockを追加

    constructor() {
        // コンストラクタで配列と時計を慎重に初期化
        this.particleVelocity = new Array<THREE.Vector3>();
        this.clock = new THREE.Clock();
    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        // background
        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.shadowMap.enabled = true; // シャドウマップを有効にする

        // カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // requestAnimationFrame により次フレームを呼ぶ
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
        const createParticles = () => {
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

            // paticle
            const particleNum = 10000;
            const positions = new Float32Array(particleNum * 3);
            let particleIndex = 0;
            this.particleVelocity = new Array<THREE.Vector3>();

            for (let x = 0; x < particleNum; x++) {
                positions[particleIndex++] = Math.random() * 10.0 - 5.0;
                positions[particleIndex++] = Math.random() * 10.0 - 5.0;
                positions[particleIndex++] = Math.random() * 10.0 - 5.0;

                this.particleVelocity.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * -3.0 - 1.0,
                    (Math.random() - 0.5) * 0.1
                ));
            }

            // GeoNiTouroku
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            this.cloud = new THREE.Points(geometry, material);
            this.scene.add(this.cloud);
        }
        
        createParticles();
        
        // ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        const update: FrameRequestCallback = (_time) => {
            const geom = this.cloud.geometry as THREE.BufferGeometry;
            const positions = geom.getAttribute('position') as THREE.BufferAttribute;
            
            const deltaTime = this.clock.getDelta();

            for (let i = 0; i < positions.count; i++) {
                const velocity = this.particleVelocity[i];

                let currentX = positions.getX(i) + velocity.x * deltaTime;
                let currentY = positions.getY(i) + velocity.y * deltaTime;
                let currentZ = positions.getZ(i) + velocity.z * deltaTime;

                if (currentY <= -5.0) {
                    currentX = Math.random() * 10.0 - 5.0;
                    currentY = 5.0;
                    currentZ = Math.random() * 10.0 - 5.0;
                }
                
                positions.setXYZ(i, currentX, currentY, currentZ);
            }

            positions.needsUpdate = true;
            requestAnimationFrame(update);
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