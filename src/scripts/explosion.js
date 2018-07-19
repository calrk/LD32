const THREE = require('three');
const TextureLoader = require('./textures.js');

class Explosion{

	constructor(params){
		params = params || {};
		this.position = params.position.clone() || new THREE.Vector3(0,0,0);
		this.scene = params.scene;
		this.gameController = params.gameController;

		this.pointCloud;
		this.lifeTime = 2;

		var particles = new THREE.Geometry();

		for(var i = 0; i < 15; i++){
			particles.vertices.push(new THREE.Vector3(Math.random()*0.5-0.25, Math.random()*0.5-0.25, Math.random()*0.5-0.25));
		}

		this.pointCloud = new THREE.Points(particles, this.createMaterial());
		// pointCloud.sortParticles = true;
		this.pointCloud.position.copy(this.position);
		this.scene.add(this.pointCloud);
		this.gameController.explosions.push(this);
	}

	update (dt) {
		this.lifeTime -= dt;
		for(var i = 0; i < this.pointCloud.geometry.vertices.length; i++){
			this.pointCloud.geometry.vertices[i].multiplyScalar(1.02);
			this.pointCloud.geometry.verticesNeedUpdate = true;
		}
		this.pointCloud.material.opacity -= dt;
		if(this.pointCloud.material.opacity < 0){
			this.pointCloud.material.opacity = 0;
		}
		if(this.lifeTime < 0){
			this.destroy();
		}
	}

	destroy () {
		this.scene.remove(this.pointCloud);
		this.gameController.removeExplosion(this);
	}

	createMaterial(){
		var mat = Explosion.bloodMaterial.clone();
		mat.opacity = 1;
		return mat;
	}
}

Explosion.bloodMaterial = new THREE.PointsMaterial({
	color: 0xFF0000,
	size: 0.1,
	map: TextureLoader.getTexture('blood'),
	blending: THREE.AdditiveBlending,
	transparent: true
});

module.exports = Explosion;
