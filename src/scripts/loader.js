const THREE = require("three");
const GLTFLoader = require("../resources/GLTFLoader");

class ModelLoader{

	constructor () {
		this.models = {};
		this.gltfLoader = new GLTFLoader();
		console.log(this.gltfLoader)

		this.loadingCount = 0;
		this.loadedCount = 0;

		console.time('Loading Models');
		this.loadModel('torch2/scene');
		// this.loadModel('torch3/scene');
		this.loadModel('sphere');
	}

	loadModel (name) {
		this.loadingCount ++;
		this.gltfLoader.load('../models/' + name + '.gltf', data => {
			this.loadedCount ++;
			this.models[name] = data.scene;

			/*this.models[name].traverse(part => {
				if(part.material){
					var col = new THREE.Color(part.material.uniforms.u_diffuse.value.x, part.material.uniforms.u_diffuse.value.y, part.material.uniforms.u_diffuse.value.z);
					part.material = new THREE.MeshLambertMaterial({color: col.getHex()});
				}
			});*/

			if(this.ready()){
				console.timeEnd('Loading Models');
			}
		});
	}

	getModel (name) {
		if(this.models[name])
			return this.models[name].clone();
		return new THREE.Object3D();
	}

	/*getImage (name) {
		if(this.images[name])
			return this.images[name];
		console.log("Image not found.");
		return new Image();
	}*/

	ready () {
		return this.loadingCount == this.loadedCount;
	}
}

module.exports = new ModelLoader();