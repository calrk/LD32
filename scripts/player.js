
Actor.Player = function(params){
	Actor.call(this, params);

	this.controls = params.controls || {
		left: keys.a,
		right: keys.d,
		up: keys.w,
		down: keys.s,
	};

	this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 100);
	this.light = new THREE.PointLight(0xffffff, 1, 10);
	this.camera.add(this.light);
}
Actor.Player.prototype = Object.create( Actor.prototype );
Actor.Player.prototype.createModel = function(){
	this.model = new THREE.Object3D();

	var weaponJoint = new this.createJoint();
	weaponJoint.position.x = 0.75;
	weaponJoint.position.y = -1.5;
	weaponJoint.position.z = -1;
	weaponJoint.name = 'weapon';
	this.model.add(weaponJoint);

	var weaponMat = new THREE.MeshLambertMaterial({
		color: 0xffffff, 
		map: textures.getTexture('newspaper'),
	});
	weaponMat.depthTest = false;
	var weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16, 16), weaponMat);
	weapon.position.y = 1;
	weapon.rotation.y = 0.75;
	weapon.renderOrder = 1;
	weaponJoint.add(weapon);
}

Actor.Player.prototype.initSelf = function(){
	// sceneHUD.add(this.model);
	// sceneHUD.add(this.model2);
}

Actor.Player.prototype.resetSelf = function(){
	this.health = 100;
	this.model.position.x = 2;
	this.model.position.z = 4;
	this.prevPos = this.model.position;
	this.targetPos = this.model.position;

	this.setRotation(-1);

	this.model.add(this.camera);
};

Actor.Player.prototype.stillAction = function(dt){
	if(keysDown[this.controls.left]){
		this.setMove(this.right.clone().multiplyScalar(-1));
	}
	if(keysDown[this.controls.right]){
		this.setMove(this.right);
	}
	if(keysDown[this.controls.up]){
		this.setMove(this.forward);
	}
	if(keysDown[this.controls.down]){
		this.setMove(this.forward.clone().multiplyScalar(-1));
	}
	if(keysDown[this.controls.rotateLeft]){
		this.setRotation(1);
	}
	if(keysDown[this.controls.rotateRight]){
		this.setRotation(-1);
	}
};

Actor.Player.prototype.updateSelf = function(dt){
	this.light.intensity = Math.sin(clock.elapsedTime)*0.2+0.9;
}

Actor.Player.prototype.attackAnim = function(){
	this.model.getObjectByName('weapon').rotation.x = this.interpolator([0, 0.33, 0.66, 1], [0, 0.35, -0.75, 0], this.interpPercent);
	this.model.getObjectByName('weapon').rotation.z = this.interpolator([0, 0.33, 0.66, 1], [0, -0.1, 0.25, 0], this.interpPercent);
}