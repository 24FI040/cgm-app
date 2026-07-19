//24FI040 木原穂乃花
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.DirectionalLight;//ここかえてshadow使う
    private camera!: THREE.PerspectiveCamera;
    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x1b1b2f));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラ
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

        this.camera.position.copy(cameraPos);
        this.camera.lookAt(0, 0, 0);
        const orbitControls = new OrbitControls(this.camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();
            this.camera.lookAt(0, 0, 0);
            renderer.render(this.scene, this.camera);
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
        //チェス盤
        const boardShape = new THREE.Shape();
        //大きさ
        boardShape.moveTo(-4, -4);
        boardShape.lineTo(4, -4);
        boardShape.lineTo(4, 4);
        boardShape.lineTo(-4, 4);
        boardShape.lineTo(-4, -4);
        const boardGeometry = new THREE.ExtrudeGeometry(boardShape, {
            depth: 0.4,
            bevelEnabled: false
        });
        const boardMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B5A2B
        });
        const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
        boardMesh.receiveShadow = true;
        //位置調整
        boardMesh.rotation.x = -Math.PI / 2;
        boardMesh.position.y = -0.2;
        this.scene.add(boardMesh);
        //模様
        const squareGeometry = new THREE.BoxGeometry(1, 0.05, 1);
        const whiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });
        const blackMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 150,
            specular: 0xffffff
        });
        //マス
        for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
                const material =
                    (x + z) % 2 === 0
                        ? whiteMaterial
                        : blackMaterial;
                const square = new THREE.Mesh(squareGeometry, material);
                //中心(0,0,0)
                square.position.set(
                    x - 3.5,
                    0.03 + 0.2,
                    z - 3.5
                );
                this.scene.add(square);
            }
        }

        //ポーン
        const whitePawns: THREE.Mesh[] = [];
        const blackPawns: THREE.Mesh[] = [];
        const pawnPoints: THREE.Vector2[] = [];
        //(半径,高さ)
        pawnPoints.push(new THREE.Vector2(0.0, 0.0));
        pawnPoints.push(new THREE.Vector2(0.45, 0.0));
        pawnPoints.push(new THREE.Vector2(0.50, 0.15));
        pawnPoints.push(new THREE.Vector2(0.35, 0.35));
        pawnPoints.push(new THREE.Vector2(0.28, 0.70));
        pawnPoints.push(new THREE.Vector2(0.20, 1.00));
        pawnPoints.push(new THREE.Vector2(0.25, 1.20));
        pawnPoints.push(new THREE.Vector2(0.15, 1.45));
        pawnPoints.push(new THREE.Vector2(0.25, 1.65));
        pawnPoints.push(new THREE.Vector2(0.00, 1.70));
        const pawnGeometry = new THREE.LatheGeometry(pawnPoints, 64);
        const pawn = new THREE.Mesh(pawnGeometry, whiteMaterial);
        pawn.castShadow = true;
        pawn.receiveShadow = true;
        pawn.scale.set(0.6, 0.6, 0.6);
        pawn.position.set(-3.5, 0.23, -2.5);
        //白
        for (let i = 0; i < 8; i++) {
            const pawn = new THREE.Mesh(pawnGeometry, whiteMaterial);
            pawn.scale.set(0.6, 0.6, 0.6);
            pawn.position.set(-3.5 + i, 0.23, -2.5);
            whitePawns.push(pawn);
            this.scene.add(pawn);
        }
        //黒
        for (let i = 0; i < 8; i++) {
            const pawn = new THREE.Mesh(pawnGeometry, blackMaterial);
            pawn.scale.set(0.6, 0.6, 0.6);
            pawn.position.set(-3.5 + i, 0.23, 2.5);
            blackPawns.push(pawn);
            this.scene.add(pawn);
        }
        //ルーク
        const rook = new THREE.Group();
        const rookmaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });
        const rookbase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.65, 0.2, 32),
            rookmaterial
        );
        rookbase.position.y = 0.1;
        rook.add(rookbase);
        const rookbelly = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 32, 32),
            rookmaterial
        );
        rookbelly.scale.y = 0.5;
        rookbelly.position.y = 0.35;
        rook.add(rookbelly);
        const rookbody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.34, 0.9, 32),
            rookmaterial
        );
        rookbody.position.y = 0.9;
        rook.add(rookbody);
        const rooktop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32),
            rookmaterial
        );
        rooktop.position.y = 1.45;
        rook.add(rooktop);
        const rookwallGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const rookwall1 = new THREE.Mesh(rookwallGeometry, rookmaterial);
        rookwall1.position.set(-0.30, 1.65, 0);
        const wall2 = rookwall1.clone();
        wall2.position.set(-0.10, 1.65, 0);
        const wall3 = rookwall1.clone();
        wall3.position.set(0.10, 1.65, 0);
        const wall4 = rookwall1.clone();
        wall4.position.set(0.30, 1.65, 0);
        rook.add(rookwall1);
        rook.add(wall2);
        rook.add(wall3);
        rook.add(wall4);
        rook.scale.set(0.6, 0.6, 0.6);
        rook.position.set(-3.5, 0.23, -3.5);
        rook.castShadow = true;
        rook.receiveShadow = true;
        this.scene.add(rook);
        const rook2 = rook.clone();
        rook2.position.set(3.5, 0.23, -3.5);
        rook2.castShadow = true;
        rook2.receiveShadow = true;
        this.scene.add(rook2);
        const rook3 = rook.clone();
        rook3.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        rook3.position.set(-3.5, 0.23, 3.5);
        rook3.castShadow = true;
        rook3.receiveShadow = true;
        this.scene.add(rook3);
        const rook4 = rook.clone();
        rook4.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        rook4.position.set(3.5, 0.23, 3.5);
        rook4.castShadow = true;
        rook4.receiveShadow = true;
        this.scene.add(rook4);

        //ビショップ
        const bishop = new THREE.Group();
        const bishopmaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });
        const bishopbase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.65, 0.2, 32),
            bishopmaterial
        );
        bishopbase.position.y = 0.1;
        bishop.add(bishopbase);
        const bishopbelly = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 32, 32),
            bishopmaterial
        );
        bishopbelly.scale.y = 0.5;
        bishopbelly.position.y = 0.35;
        bishop.add(bishopbelly);
        const bishopbody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.30, 0.9, 32),
            bishopmaterial
        );
        bishopbody.position.y = 0.9;
        bishop.add(bishopbody);
        const bishopneck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.20, 0.15, 32),
            bishopmaterial
        );
        bishopneck.position.y = 1.4;
        bishop.add(bishopneck);
        const bishophead = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 32, 32),
            bishopmaterial
        );
        bishophead.scale.y = 1.5;
        bishophead.position.y = 1.75;
        bishop.add(bishophead);
        const bishoptopBall = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 16, 16),
            bishopmaterial
        );
        bishoptopBall.position.y = 2.1;
        bishop.add(bishoptopBall);
        const bishopslit = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.35, 0.10),
            new THREE.MeshPhongMaterial({
                color: 0x222222,
                shininess: 120,
                specular: 0xaaaaaa
            })
        );
        bishopslit.rotation.z = THREE.MathUtils.degToRad(25);
        bishopslit.position.set(0.0, 1.75, 0.15);
        bishop.add(bishopslit);
        bishopslit.rotation.z = THREE.MathUtils.degToRad(25);
        bishopslit.position.set(0.0, 1.75, 0.15);
        bishop.add(bishopslit);
        bishop.scale.set(0.6, 0.6, 0.6);
        bishop.position.set(-1.5, 0.23, -3.5);
        bishop.castShadow = true;
        bishop.receiveShadow = true;
        this.scene.add(bishop);
        const bishop2 = bishop.clone();
        bishop2.position.set(1.5, 0.23, -3.5);
        bishop2.castShadow = true;
        bishop2.receiveShadow = true;
        this.scene.add(bishop2);
        const blackBishop = bishop.clone();
        ///黒ビショップ
        blackBishop.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        blackBishop.position.set(-1.5, 0.23, 3.5);
        blackBishop.castShadow = true;
        blackBishop.receiveShadow = true;
        this.scene.add(blackBishop);
        const blackBishop2 = blackBishop.clone();
        blackBishop2.position.set(1.5, 0.23, 3.5);
        blackBishop2.castShadow = true;
        blackBishop2.receiveShadow = true;
        this.scene.add(blackBishop2);

        //ナイト
        const knight = new THREE.Group();
        const knightmaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });
        const knightbase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.65, 0.2, 32),
            knightmaterial
        );
        knightbase.position.y = 0.1;
        knight.add(knightbase);
        const horseShape = new THREE.Shape();
        horseShape.moveTo(-0.25, 0.0);
        horseShape.lineTo(-0.30, 0.80);
        horseShape.lineTo(-0.18, 1.45);
        horseShape.lineTo(0.00, 1.75);
        horseShape.lineTo(0.18, 1.55);
        horseShape.lineTo(0.22, 1.20);
        horseShape.lineTo(0.10, 0.95);
        horseShape.lineTo(0.30, 0.70);
        horseShape.lineTo(0.28, 0.25);
        horseShape.lineTo(0.18, 0.00);
        horseShape.closePath();
        const horseGeometry = new THREE.ExtrudeGeometry(
            horseShape,
            {
                depth: 0.30,
                bevelEnabled: false
            }
        );
        const horse = new THREE.Mesh(
            horseGeometry,
            knightmaterial
        );
        horse.position.set(0, 0.2, -0.15);
        horse.rotation.y = THREE.MathUtils.degToRad(180);
        knight.add(horse);
        knight.scale.set(0.7, 0.7, 0.7);
        knight.position.set(-2.5, 0.23, -3.5);
        knight.castShadow = true;
        knight.receiveShadow = true;
        this.scene.add(knight);
        const knight2 = knight.clone();
        knight2.rotation.y = Math.PI;
        knight2.position.set(2.5, 0.23, -3.5);
        knight2.castShadow = true;
        knight2.receiveShadow = true;
        this.scene.add(knight2);
        //黒ナイト
        const blacknight = knight.clone();
        blacknight.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        blacknight.position.set(-2.5, 0.23, 3.5);
        blacknight.castShadow = true;
        blacknight.receiveShadow = true;
        this.scene.add(blacknight);
        const blacknight2 = blacknight.clone();
        blacknight2.rotation.y = Math.PI;
        blacknight2.position.set(2.5, 0.23, 3.5);
        blacknight2.castShadow = true;
        blacknight2.receiveShadow = true;
        this.scene.add(blacknight2);

        //キング
        const king = new THREE.Group();
        const KingbaseGeometry = new THREE.CylinderGeometry(0.55, 0.70, 0.22, 32);
        const Kingmaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });

        const Kingbase = new THREE.Mesh(KingbaseGeometry, Kingmaterial);
        Kingbase.position.y = 0.1;
        king.add(Kingbase);

        const kingbodyGeometry = new THREE.CylinderGeometry(0.22, 0.30, 1.0, 32);
        const kingbody = new THREE.Mesh(kingbodyGeometry, Kingmaterial);
        kingbody.position.y = 0.7;
        king.add(kingbody);

        const kingneckGeometry = new THREE.CylinderGeometry(0.16, 0.20, 0.2, 32);
        const kingneck = new THREE.Mesh(kingneckGeometry, Kingmaterial);
        kingneck.position.y = 1.3;
        king.add(kingneck);

        const kingheadGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const kinghead = new THREE.Mesh(kingheadGeometry, Kingmaterial);
        kinghead.position.y = 1.6;
        king.add(kinghead);
        const crossV = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.35, 0.08),
            Kingmaterial
        );

        crossV.position.y = 1.95;
        king.add(crossV);
        const crossH = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.08, 0.08),
            Kingmaterial
        );
        crossH.position.y = 1.95;
        king.add(crossH);

        king.scale.set(0.6, 0.6, 0.6);
        king.position.set(0.5, 0.23, -3.5);
        king.castShadow = true;
        king.receiveShadow = true;
        this.scene.add(king);
        const blackKing = king.clone();

        //黒キング
        blackKing.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        blackKing.position.set(0.5, 0.23, 3.5);
        blackKing.castShadow = true;
        blackKing.receiveShadow = true;
        this.scene.add(blackKing);

        //クイーン
        const queen = new THREE.Group();
        const queenbaseGeometry = new THREE.CylinderGeometry(0.45, 0.55, 0.2, 32);
        const queenMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            specular: 0xaaaaaa
        });

        const queenbase = new THREE.Mesh(queenbaseGeometry, queenMaterial);
        queenbase.position.y = 0.1;
        queen.add(queenbase);

        const queenbodyGeometry = new THREE.CylinderGeometry(0.20, 0.30, 0.9, 32);
        const queenbody = new THREE.Mesh(queenbodyGeometry, queenMaterial);
        queenbody.position.y = 0.65;
        queen.add(queenbody);

        const neckGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 32);
        const queenneck = new THREE.Mesh(neckGeometry, queenMaterial);
        queenneck.position.y = 1.2;
        queen.add(queenneck);

        const queenheadGeometry = new THREE.SphereGeometry(0.22, 32, 32);
        const queenhead = new THREE.Mesh(queenheadGeometry, queenMaterial);
        queenhead.position.y = 1.45;
        queen.add(queenhead);

        const crownGeometry = new THREE.TorusGeometry(0.22, 0.03, 16, 32);

        const crown = new THREE.Mesh(crownGeometry, queenMaterial);
        crown.rotation.x = Math.PI / 2;
        crown.position.y = 1.65;
        queen.add(crown);

        const jewelGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const jewel1 = new THREE.Mesh(jewelGeometry, queenMaterial);
        jewel1.position.set(0.22, 1.65, 0);
        const jewel2 = jewel1.clone();
        jewel2.position.set(-0.22, 1.65, 0);
        const jewel3 = jewel1.clone();
        jewel3.position.set(0, 1.65, 0.22);
        const jewel4 = jewel1.clone();
        jewel4.position.set(0, 1.65, -0.22);
        queen.add(jewel1);
        queen.add(jewel2);
        queen.add(jewel3);
        queen.add(jewel4);

        queen.scale.set(0.6, 0.6, 0.6);
        queen.position.set(-0.5, 0.23, -3.5);
        queen.castShadow = true;
        queen.receiveShadow = true;

        this.scene.add(queen);

        //黒クイーン
        const blackQueen = queen.clone();
        blackQueen.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    shininess: 150,
                    specular: 0xffffff
                });
            }
        });
        blackQueen.position.set(-0.5, 0.23, 3.5);
        blackQueen.castShadow = true;
        blackQueen.receiveShadow = true;
        this.scene.add(blackQueen);


        //ライトの設定
        this.light = new THREE.DirectionalLight(0xfff2d0, 1.5);
        const lvec = new THREE.Vector3(5, 8, 5);
        this.light.position.copy(lvec);

        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.left = -10;
        this.light.shadow.camera.right = 10;
        this.light.shadow.camera.top = 10;
        this.light.shadow.camera.bottom = -10;
        this.light.shadow.camera.near = 1;
        this.light.shadow.camera.far = 30;
        this.scene.add(this.light);
        //位から調整
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            0.35
        );
        this.scene.add(ambientLight);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            const lightAngle = _time * 0.0005;

            this.light.position.set(
                8 * Math.cos(lightAngle),
                10,
                8 * Math.sin(lightAngle)
            );
            const seconds = _time * 0.001;
            if (seconds > 2 && whitePawns.length > 4) {
                if (whitePawns[4].position.z < -1.5) {
                    whitePawns[4].position.z += 0.02;
                }
            }
            if (seconds > 4 && blackPawns.length > 4) {
                if (blackPawns[4].position.z > 1.5) {
                    blackPawns[4].position.z -= 0.02;
                }
            }
            if (seconds > 6) {
                if (knight.position.x < -1.5) {
                    knight.position.x += 0.015;
                } if (knight.position.z < -0.5) {
                    knight.position.z += 0.03;
                }
                knight.position.y =
                    0.6 + Math.sin((seconds - 6) * Math.PI) * 0.7;
            }
            if (knight.position.z >= -0.5) {
                knight.position.y = 0.23;
            }

            if (seconds < 10) {
                const t = _time * 0.0003;
                const r = 12;
                this.camera.position.set(
                    r * Math.cos(t),
                    8,
                    r * Math.sin(t)
                );
                this.camera.lookAt(0, 0, 0);
            } else {
                this.camera.position.lerp(
                    new THREE.Vector3(4, 4, 4),
                    0.01
                );
                this.camera.lookAt(king.position);
            }
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(9, 6, 9));
    document.body.appendChild(viewport);
}
