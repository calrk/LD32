const THREE = require('three');

const Prop = require('./prop');
const TextureLoader = require('./textures.js');
const ShaderLoader = require('./shaderLoader.js');
const ModelLoader = require('./loader.js');

class Torch extends Prop{
	constructor (params) {
		super(params);

		var sceneObject = new THREE.Object3D();

		// var torch = ModelLoader.getModel('sphere');
		var torch = ModelLoader.getModel('torch2/scene');
		// console.log(torch);
		torch.scale.set(0.0064,0.0064,0.0064);
		sceneObject.add(torch);
		sceneObject.position.x = params.position.x;
		sceneObject.position.y = -0.95;
		sceneObject.position.z = params.position.z;
		sceneObject.rotation.y = Math.random()*Math.PI*2;

		this.light = new THREE.PointLight(0xff8800, 0.5, 3);
		this.light.position.y = 0.7;
		sceneObject.add(this.light);

		this.fireUniforms = {
			tHeightMap:  { type: "t",  value: TextureLoader.getTexture('cloud') },
			uColor: { type: "c", value: new THREE.Color( 0xff4800 ) },
			time: { type: "f", value: 0.0 },
		};

		this.displacementMaterial = new THREE.ShaderMaterial({
			transparent:	true,
			uniforms: this.fireUniforms,
			vertexShader:	ShaderLoader.getShader('fire_vertex'),
			fragmentShader: ShaderLoader.getShader('fire_fragment')
		});

		var fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 3), this.displacementMaterial);
		fire.position.y = 1.05;
		sceneObject.add(fire);

		this.scene.add(sceneObject);
		this.sceneObject = sceneObject;
	}

	update (dt) {
		this.light.intensity = Math.sin(this.gameController.clock.elapsedTime*16)*0.2+0.9;
		this.fireUniforms.time.value += dt;
	}
}

module.exports = Torch;
