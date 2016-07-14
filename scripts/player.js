
Actor.Player = function(params){
	Actor.call(this, params);

	this.controls = params.controls || {
		left: keys.a,
		right: keys.d,
		up: keys.w,
		down: keys.s,
	};

	this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 10);
	this.light = new THREE.PointLight(0xffffff, 1, 10);
	this.camera.add(this.light);
	this.orientation = new THREE.DeviceOrientationControls(this.camera);
}
Actor.Player.prototype = Object.create( Actor.prototype );
Actor.Player.prototype.createModel = function(){
	this.model = new THREE.Object3D();

	var weaponJoint = new this.createJoint();
	weaponJoint.position.x = 0.75;
	weaponJoint.position.y = -1.5;
	weaponJoint.position.z = -1;
	weaponJoint.name = 'weapon';
	this.camera.add(weaponJoint);

	var weaponMat = new THREE.MeshLambertMaterial({
		color: 0xffffff, 
		map: textures.getTexture('newspaper'),
	});
	weaponMat.depthTest = false;
	weaponMat.transparent = true
	var weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16, 16), weaponMat);
	weapon.position.y = 1;
	weapon.rotation.y = 0.75;
	weapon.renderOrder = 10;
	weaponJoint.add(weapon);
}

Actor.Player.prototype.takeDamageSelf = function(damage){
	setTimeout(function(){
		if(Math.random() < 0.5){
			sounds.play('pain_1');
		}
		else{
			sounds.play('pain_2');
		}
	}, 150);
},

Actor.Player.prototype.initSelf = function(){
	// sceneHUD.add(this.model);
	// sceneHUD.add(this.model2);
}

Actor.Player.prototype.resetSelf = function(){
	this.health = 100;
	this.model.position.x = 2;
	this.model.position.z = 2;
	this.prevPos = this.model.position;
	this.targetPos = this.model.position;

	this.setRotation(-1);

	this.model.add(this.camera);
};

Actor.Player.prototype.stillAction = function(dt){
	var result = false;

	var rotY = this.camera.rotation.y*(180/Math.PI);
	var nearest90 = Math.round(rotY/(90))*90;

	/*if(nearest90 == 0){
		this.forward = new THREE.Vector3(1, 0, 0);
		this.right = new THREE.Vector3(0, 0, 1);
	}
	else if(nearest90 == -90){
		this.forward = new THREE.Vector3(0, 0, 1);
		this.right = new THREE.Vector3(-1, 0, 0);
	}
	else if(nearest90 == 180 || nearest90 == -180){
		this.forward = new THREE.Vector3(-1, 0, 0);
		this.right = new THREE.Vector3(0, 0, -1);
	}
	else{
		this.forward = new THREE.Vector3(0, 0, -1);
		this.right = new THREE.Vector3(1, 0, 0);
	}*/

	if(keysDown[this.controls.left] || keysDown[keys.left]){
		result = this.setMove(this.right.clone().multiplyScalar(-1));
		sounds.playFootstep();
	}
	if(keysDown[this.controls.right] || keysDown[keys.right]){
		result = this.setMove(this.right);
		sounds.playFootstep();
	}
	if(keysDown[this.controls.up] || keysDown[keys.up]){
		result = this.setMove(this.forward);
		sounds.playFootstep();
	}
	if(keysDown[this.controls.down] || keysDown[keys.down]){
		result = this.setMove(this.forward.clone().multiplyScalar(-1));
		sounds.playFootstep();
	}

	if(action == 'swipeleft'){
		result = this.setMove(this.right.clone().multiplyScalar(-1));
		sounds.playFootstep();
		action = undefined;
	}
	else if(action == 'swiperight'){
		result = this.setMove(this.right);
		sounds.playFootstep();
		action = undefined;
	}
	else if(action == 'swipeup'){
		result = this.setMove(this.forward);
		sounds.playFootstep();
		action = undefined;
	}
	else if(action == 'swipedown'){
		result = this.setMove(this.forward.clone().multiplyScalar(-1));
		sounds.playFootstep();
		action = undefined;
	}

	if(keysDown[this.controls.rotateLeft]){
		this.setRotation(1);
		sounds.playFootstep();
	}
	if(keysDown[this.controls.rotateRight]){
		this.setRotation(-1);
		sounds.playFootstep();
	}
	if(result == 'move'){
		/*setTimeout(function(){
			sounds.playFootstep();
		}, 250);*/
	}
	else if(result == 'attack'){
		sounds.play('swing');
	}
	else if(result == 'blocked'){
		setTimeout(function(){
			sounds.play('thud');
		}, 150);
	}
};

Actor.Player.prototype.updateSelf = function(dt){
	this.light.intensity = Math.sin(clock.elapsedTime)*0.2+0.9;
	// this.orientation.update();
}

Actor.Player.prototype.attackAnim = function(){
	this.model.getObjectByName('weapon').rotation.x = this.interpolator([0, 0.33, 0.66, 1], [0, 0.35, -0.75, 0], this.interpPercent);
	this.model.getObjectByName('weapon').rotation.z = this.interpolator([0, 0.33, 0.66, 1], [0, -0.1, 0.25, 0], this.interpPercent);
}