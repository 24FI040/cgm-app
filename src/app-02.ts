//24FI040　木原穂乃花
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private core!: THREE.Mesh;
    private floatingPieces: THREE.Mesh[] = [];//浮いてるコマ


    constructor() { }

    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x111122)); //紺の背景

        let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        let orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();

        let render: FrameRequestCallback = (_time) => {
            orbitControls.update();

            //エフェクトもどき回転
            if (this.core) {
                this.core.rotation.y += 0.01;
            }

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };

    private createScene = () => {
        this.scene = new THREE.Scene();

        //盤
        const boardSize = 8;
        const boardGeometry = new THREE.BoxGeometry(boardSize, 0.2, boardSize);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x003300,
            metalness: 0.3,
            roughness: 0.6
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.y = -0.1;
        this.scene.add(board);

        //グリッド
        const gridHelper = new THREE.GridHelper(boardSize, boardSize, 0x00ffff, 0x00ffff);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        //ネオン風加工
        const addOthelloPiece = (gridX: number, gridZ: number, isWhite: boolean) => {
            const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 32);
            const material = new THREE.MeshStandardMaterial({
                color: isWhite ? 0xffffff : 0x111111,//条件分岐時指定
                emissive: isWhite ? 0x222222 : 0x000000,
                metalness: 0.6,
                roughness: 0.3
            });
            const piece = new THREE.Mesh(geometry, material);
            piece.position.set(gridX - 3.5, 0.1, gridZ - 3.5);
            if (!isWhite) piece.rotation.x = Math.PI;
            this.scene.add(piece);
        };

        //初期配置
        addOthelloPiece(3, 3, true);
        addOthelloPiece(4, 4, true);
        addOthelloPiece(3, 4, false);
        addOthelloPiece(4, 3, false);

        //ランダム駒
        for (let i = 0; i < 40; i++) {
            const x = Math.floor(Math.random() * 8);
            const z = Math.floor(Math.random() * 8);
            const isWhite = Math.random() > 0.5;
            addOthelloPiece(x, z, isWhite);
        }

        //エフェクトもどき
        const coreGeo = new THREE.TorusKnotGeometry(15, 0.25, 150, 200);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x0088ff,
            metalness: 0.9,
            roughness: 0.1
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.core.position.set(0, 0.6, 0);
        this.scene.add(this.core);

        //青のでか円
        const ringGeo = new THREE.TorusGeometry(5.7, 0.05, 40, 200);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x0044ff,
            metalness: 0.9,
            roughness: 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; // 横向きにする
        ring.position.y = 0.02;
        this.scene.add(ring);

        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 32);
            const material = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0xffffff : 0x111111,
                emissive: 0x222244,
                metalness: 0.8,
                roughness: 0.2
            });

            const piece = new THREE.Mesh(geometry, material);

            //盤にコマ配置
            const radius = 6 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;

            piece.position.set(
                Math.cos(angle) * radius,
                1.2 + Math.random() * 1.0,//ちょっと浮かす
                Math.sin(angle) * radius
            );

            piece.rotation.y = Math.random() * Math.PI;

            this.scene.add(piece);
            this.floatingPieces.push(piece);
        }

        //ライト
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(5, 10, 7);
        this.scene.add(this.light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    };
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 8, 8));
    document.body.appendChild(viewport);
}
