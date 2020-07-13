import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CurveExtras } from "three/examples/js/curves/CurveExtras";

const style = {
  height: 250,
  width: 550, // we can control scene size by setting container dimensions
};

class StarShape extends THREE.Shape {
  constructor(sides, innerRadius, outerRadius) {
    super();

    let theta = 0;
    const inc = ((2 * Math.PI) / sides) * 0.5;

    this.moveTo(Math.cos(theta) * outerRadius, Math.sin(theta) * outerRadius);

    for (let i = 0; i < sides; i++) {
      theta += inc;
      this.lineTo(Math.cos(theta) * innerRadius, Math.sin(theta) * innerRadius);
      theta += inc;
      this.lineTo(Math.cos(theta) * outerRadius, Math.sin(theta) * outerRadius);
    }
  }
}

class App extends Component {
  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  // Standard scene setup in Three.js. Check "Creating a scene" manual for more information
  // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
  sceneSetup = () => {
    // get container dimensions and use them for scene sizing
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    this.scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 60);
    this.scene.add(light);

    this.scene.background = new THREE.Color(0xaaaaaa);
    this.camera.position.z = 50; // is used here to set some distance from a cube that is located at z = 0
    // OrbitControls allow a camera to orbit around the object
    // https://threejs.org/docs/#examples/controls/OrbitControls
    this.controls = new OrbitControls(this.camera, this.el);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  // Here should come custom code.
  // Code below is taken from Three.js BoxGeometry example
  // https://threejs.org/docs/#api/en/geometries/BoxGeometry
  addCustomSceneObjects = () => {
    // const geometry = new THREE.BoxGeometry(2, 2, 2);
    const making3DSetting = {
      depth: 10,
      steps: 1,
      bevelEnabled: false,
    };
    const making3DSetting2 = {
      depth: 10,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 3,
      bevelSegments: 10,
    };
    const shape = new StarShape(5, 6, 15);
    const geometry = new THREE.ExtrudeBufferGeometry(shape, making3DSetting2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
    const edges = new THREE.EdgesGeometry(geometry, 1000);
    const outline = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    this.cube.add(outline);
  };

  startAnimationLoop = () => {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);

    // The window.requestAnimationFrame() method tells the browser that you wish to perform
    // an animation and requests that the browser call a specified function
    // to update an animation before the next repaint
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  render() {
    return <div style={style} ref={(ref) => (this.el = ref)} />;
  }
}

/*
  init = () => {
    // === SCENE ===
    this.scene = new THREE.Scene();

    // === CAMERA ===
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 120, -150);
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) ); 

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(this.ambientLight);

    // === RENDERER ===
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    // === WINDOW SIZE ===
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // === CAMERA CONTROLS ===
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const cube = new THREE.MeshStandardMaterial();

    this.createMesh("square");
    window.addEventListener("resize", this.resize(), false);

    this.update();
  };

  createMesh = (name, type) => {
    if (this.mesh !== undefined) this.scene.remove(this.mesh);
    let shape = new THREE.Shape();
    let width, height, x, y, radius;
    const pos = new THREE.Vector3();
    let rot = 0;

    const extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1,
    };

    switch (name) {
      case "square":
        width = 80;
        shape.moveTo(0, 0);
        shape.lineTo(0, width);
        shape.lineTo(width, width);
        shape.lineTo(width, 0);
        pos.x = -40;
        pos.y = -40;
        break;
    }

    let geometry;

    geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    var texture = new THREE.TextureLoader().load("logo192.png");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(1.1, 1.1);
    texture.repeat.set(0.01, 0.01);

    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    console.log(material);
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.copy(pos);
    this.mesh.rotation.z = rot;
    this.scene.add(this.mesh);
  };

  //Update frames
  update = () => {
    console.log(this.mesh.scale.y);

    requestAnimationFrame(this.update);
    this.renderer.render(this.scene, this.camera);
  };

  //resize
  resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
*/
class Container extends Component {
  state = { isMounted: true };

  render() {
    const { isMounted = true } = this.state;
    return (
      <>
        <button
          onClick={() =>
            this.setState((state) => ({ isMounted: !state.isMounted }))
          }
        >
          {isMounted ? "Unmount" : "Mount"}
        </button>
        {isMounted && <App />}
        {isMounted && <div>Scroll to zoom, drag to rotate</div>}
      </>
    );
  }
}

export default Container;
