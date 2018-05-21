
LD32.Explosion = function(params){
	params = params || {};
	this.position = params.position.clone() || new THREE.Vector3(0,0,0);
	this.scene = params.scene;
	this.gameController = params.gameController;

	this.pointCloud;
	this.lifeTime = 0;

	this.init();
}

window.addEventListener('load', function(){
	LD32.Explosion.bloodMaterial = new THREE.PointsMaterial({
		color: 0xFF0000,
		size: 0.1,
		map: LD32.textures.getTexture('blood'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});
});

LD32.Explosion.prototype.init = function(){
	var particles = new THREE.Geometry();

	for(var i = 0; i < 15; i++){
		particles.vertices.push(new THREE.Vector3(Math.random()*0.5-0.25, Math.random()*0.5-0.25, Math.random()*0.5-0.25));
	}

	this.pointCloud = new THREE.Points(particles, LD32.Explosion.bloodMaterial);
	// pointCloud.sortParticles = true;
	this.pointCloud.position.copy(this.position);
	this.scene.add(this.pointCloud);
	this.gameController.explosions.push(this);
}

LD32.Explosion.prototype.update = function(dt){
	this.lifeTime += dt;
	for(var i = 0; i < this.pointCloud.geometry.vertices.length; i++){
		this.pointCloud.geometry.vertices[i].multiplyScalar(1.02);
		this.pointCloud.geometry.verticesNeedUpdate = true;
	}
	this.pointCloud.material.opacity -= dt;
	if(this.lifeTime > 2){
		this.destroy();
	}
}

LD32.Explosion.prototype.destroy = function(){
	this.scene.remove(this.pointCloud);
	this.gameController.removeExplosion(this);
}