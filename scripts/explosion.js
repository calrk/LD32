
function Explosion(parameters){
	parameters = parameters || {};
	var position = parameters.position.clone() || new THREE.Vector3(0,0,0);

	var pointCloud;
	var lifeTime = 0;

	var unique = Math.random();

	var bloodMaterial = new THREE.PointsMaterial({
		color: 0xFF0000, 
		size: 0.1,
		map: textures.getTexture('blood'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	this.init = function(){
		var particle = new THREE.Geometry();

		for(var i = 0; i < 15; i++){
			particle.vertices.push(new THREE.Vector3(Math.random()*0.5-0.25, Math.random()*0.5-0.25, Math.random()*0.5-0.25));
		}

		pointCloud = new THREE.Points(particle, bloodMaterial);
		// pointCloud.sortParticles = true;
		pointCloud.position.copy(position);
		scene.add(pointCloud);
		gameController.explosions.push(this);
	}
	this.init();

	this.update = function(dt){
		lifeTime += dt;
		for(var i = 0; i < pointCloud.geometry.vertices.length; i++){
			pointCloud.geometry.vertices[i].multiplyScalar(1.02);
			pointCloud.geometry.verticesNeedUpdate = true;
		}
		pointCloud.material.opacity -= dt;
		if(lifeTime > 2){
			this.destroy();
		}
	}

	this.destroy = function(){
		scene.remove(pointCloud);
		gameController.removeExplosion(self);
	}
}