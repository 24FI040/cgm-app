//24FI040 木原穂乃花
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from 'cannon-es';

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
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        world.defaultContactMaterial.restitution = 0.8;
        world.defaultContactMaterial.friction = 1.0;

        //見た目
        const boxGeometry = new THREE.BoxGeometry(8, 1, 4);
        const boxMaterial = new THREE.MeshNormalMaterial();
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        this.scene.add(boxMesh);
        //物理
        const carBody = new CANNON.Body({ mass: 5 });
        const carBodyShape = new CANNON.Box(new CANNON.Vec3(4, 0.5, 2));
        carBody.addShape(carBodyShape);
        carBody.position.y = 1.0;
        const vehicle = new CANNON.RigidVehicle({ chassisBody: carBody });
        //物理
        const wheelShape = new CANNON.Sphere(1);
        const frontLeftWheelBody = new CANNON.Body({ mass: 1 });
        const frontRightWheelBody = new CANNON.Body({ mass: 1 });
        const rearLeftWheelBody = new CANNON.Body({ mass: 1 });
        const rearRightWheelBody = new CANNON.Body({ mass: 1 });

        frontLeftWheelBody.addShape(wheelShape);
        frontLeftWheelBody.angularDamping = 0.4;
        frontRightWheelBody.addShape(wheelShape);
        frontRightWheelBody.angularDamping = 0.4;
        rearLeftWheelBody.addShape(wheelShape);
        rearLeftWheelBody.angularDamping = 0.4;
        rearRightWheelBody.addShape(wheelShape);
        rearRightWheelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: frontLeftWheelBody,
            position: new CANNON.Vec3(-2, 0, 2.5)
        });
        vehicle.addWheel({
            body: frontRightWheelBody,
            position: new CANNON.Vec3(-2, 0, -2.5)
        });
        vehicle.addWheel({
            body: rearLeftWheelBody,
            position: new CANNON.Vec3(2, 0, 2.5)
        });
        vehicle.addWheel({
            body: rearRightWheelBody,
            position: new CANNON.Vec3(2, 0, -2.5)
        });
        vehicle.addToWorld(world);
        let wheelForce = 0;
        let steeringValue = 0;
        //見た目
        const wheelGeometry = new THREE.SphereGeometry(1);
        const wheelMaterial = new THREE.MeshNormalMaterial();

        const frontLeftMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(frontLeftMesh);
        const frontRightMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(frontRightMesh);
        const rearLeftMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(rearLeftMesh);
        const rearRightMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(rearRightMesh);

        //shapeが見た目、bodyが物理演算かかってるやつ

        //地面
        const phongMaterial = new THREE.MeshPhongMaterial();
        const planeGeometry = new THREE.PlaneGeometry(25, 25);
        const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial);
        planeMesh.material.side = THREE.DoubleSide; // 両面
        planeMesh.rotateX(-Math.PI / 2);
        this.scene.add(planeMesh)
        const planeShape = new CANNON.Plane()

        //物理地面
        const planeBody = new CANNON.Body({ mass: 0 })
        planeBody.addShape(planeShape)
        planeBody.position.set(planeMesh.position.x, planeMesh.position.y, planeMesh.position.z);
        planeBody.quaternion.set(planeMesh.quaternion.x, planeMesh.quaternion.y, planeMesh.quaternion.z, planeMesh.quaternion.w);
        world.addBody(planeBody)

        // グリッド表示
        const gridHelper = new THREE.GridHelper(10,);
        this.scene.add(gridHelper);

        // 軸表示
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        //イベント設定
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowUp":
                    wheelForce = 100;
                    break;

                case "ArrowDown":
                    wheelForce = -100;
                    break;

                case "ArrowLeft":
                    steeringValue = THREE.MathUtils.degToRad(30);
                    break;

                case "ArrowRight":
                    steeringValue = THREE.MathUtils.degToRad(-30);
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "ArrowDown":
                    wheelForce = 0;
                    break;

                case "ArrowLeft":
                case "ArrowRight":
                    steeringValue = 0;
                    break;
            }
        });

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            world.fixedStep();
            //加速

            //車
            boxMesh.position.set(carBody.position.x, carBody.position.y, carBody.position.z);
            boxMesh.quaternion.set(carBody.quaternion.x, carBody.quaternion.y, carBody.quaternion.z, carBody.quaternion.w);
            //タイヤ
            frontLeftMesh.position.set(frontLeftWheelBody.position.x, frontLeftWheelBody.position.y, frontLeftWheelBody.position.z);
            frontLeftMesh.quaternion.set(frontLeftWheelBody.quaternion.x, frontLeftWheelBody.quaternion.y, frontLeftWheelBody.quaternion.z, frontLeftWheelBody.quaternion.w);
            frontRightMesh.position.set(frontRightWheelBody.position.x, frontRightWheelBody.position.y, frontRightWheelBody.position.z);
            frontRightMesh.quaternion.set(frontRightWheelBody.quaternion.x, frontRightWheelBody.quaternion.y, frontRightWheelBody.quaternion.z, frontRightWheelBody.quaternion.w);
            rearLeftMesh.position.set(rearLeftWheelBody.position.x, rearLeftWheelBody.position.y, rearLeftWheelBody.position.z);
            rearLeftMesh.quaternion.set(rearLeftWheelBody.quaternion.x, rearLeftWheelBody.quaternion.y, rearLeftWheelBody.quaternion.z, rearLeftWheelBody.quaternion.w);
            rearRightMesh.position.set(rearRightWheelBody.position.x, rearRightWheelBody.position.y, rearRightWheelBody.position.z);
            rearRightMesh.quaternion.set(rearRightWheelBody.quaternion.x, rearRightWheelBody.quaternion.y, rearRightWheelBody.quaternion.z, rearRightWheelBody.quaternion.w);
            vehicle.setWheelForce(wheelForce, 0);
            vehicle.setWheelForce(wheelForce, 1);
            vehicle.setSteeringValue(steeringValue, 0);
            vehicle.setSteeringValue(steeringValue, 1);
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 5, 5));
    document.body.appendChild(viewport);
}
