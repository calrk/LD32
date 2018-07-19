const THREE = require('three');

const Prop = require('./prop');
const TextureLoader = require('./textures.js');

class FireFly extends Prop{
	constructor (params) {
		super(params);

		this.fireflyMaterial = new THREE.PointsMaterial({
			color: 0x00aadd,
			size: 0.1,
			map: TextureLoader.getTexture('firefly'),
			blending: THREE.AdditiveBlending,
			transparent: true
		});

		var fireflyParticles = new THREE.Geometry();
		for(var i = 0; i < 10; i++){
			fireflyParticles.vertices.push(new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1));
			fireflyParticles.vertices[i].offsetx = Math.random()*100;
			fireflyParticles.vertices[i].offsety = Math.random()*100;
			fireflyParticles.vertices[i].offsetz = Math.random()*100;
			fireflyParticles.vertices[i].offsetxdist = Math.random()*2-1;
			fireflyParticles.vertices[i].offsetydist = Math.random()*2-1;
			fireflyParticles.vertices[i].offsetzdist = Math.random()*2-1;
		}
		var sceneObject = new THREE.Points(fireflyParticles, this.fireflyMaterial);
		sceneObject.position.x = params.position.x;
		sceneObject.position.z = params.position.z;

		this.light = new THREE.PointLight(0x00ddff, 0.5, 3);
		this.light.position.y = 0.5;
		sceneObject.add(this.light);

		this.scene.add(sceneObject);
		this.sceneObject = sceneObject;
	}

	update (dt) {
		this.light.intensity = Math.sin(this.gameController.clock.elapsedTime*4)*0.2+0.9;

		this.sceneObject.geometry.vertices.forEach(vertex => {
			vertex.x = Math.sin(this.gameController.clock.elapsedTime/2 + vertex.offsetx)*vertex.offsetxdist;
			vertex.y = Math.sin(this.gameController.clock.elapsedTime/2 + vertex.offsety)*vertex.offsetydist;
			vertex.z = Math.sin(this.gameController.clock.elapsedTime/2 + vertex.offsetz)*vertex.offsetzdist;
		});
		this.sceneObject.geometry.verticesNeedUpdate = true;
	}
}

module.exports = FireFly;
