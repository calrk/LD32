
LD32.Player = function(params){
	LD32.Actor.call(this, params);

	this.controls = params.controls || {
		left: keys.a,
		right: keys.d,
		up: keys.w,
		down: keys.s,
	};

	this.camera = new THREE.PerspectiveCamera(75, LD32.width/LD32.height, 0.1, 10);
	this.light = new THREE.PointLight(0xffffff, 1, 10);
	this.camera.add(this.light);
	this.orientation = new THREE.DeviceOrientationControls(this.camera);
}
LD32.Player.prototype = Object.create( LD32.Actor.prototype );
LD32.Player.prototype.createModel = function(){
	this.model = new THREE.Object3D();

	var weaponJoint = new this.createJoint();
	weaponJoint.position.x = 0.75;
	weaponJoint.position.y = -1.5;
	weaponJoint.position.z = -1;
	weaponJoint.name = 'weapon';
	this.camera.add(weaponJoint);

	var weaponMat = new THREE.MeshLambertMaterial({
		color: 0xffffff, 
		map: LD32.textures.getTexture('newspaper'),
	});
	weaponMat.depthTest = false;
	weaponMat.transparent = true
	var weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16, 16), weaponMat);
	weapon.position.y = 1;
	weapon.rotation.y = 0.75;
	weapon.renderOrder = 10;
	weaponJoint.add(weapon);
}

LD32.Player.prototype.takeDamageSelf = function(damage){
	setTimeout(function(){
		if(Math.random() < 0.5){
			LD32.sounds.play('pain_1');
		}
		else{
			LD32.sounds.play('pain_2');
		}
	}, 150);
},

LD32.Player.prototype.initSelf = function(){
	// sceneHUD.add(this.model);
	// sceneHUD.add(this.model2);
}

LD32.Player.prototype.resetSelf = function(){
	this.health = 100;
	this.model.position.x = 2;
	this.model.position.z = 2;
	this.prevPos = this.model.position;
	this.targetPos = this.model.position;

	this.setRotation(-1);

	this.model.add(this.camera);
};

LD32.Player.prototype.setRotation = function(target){
	var euler = new THREE.Euler(0, Math.PI/2*target, 0, 'XYZ');
	this.prevEuler = new THREE.Euler(0, this.prevEuler.y+Math.PI/2*target, 0, 'XYZ');

	this.targetRot = new THREE.Quaternion();
	this.targetRot.setFromEuler(this.prevEuler);

	this.interpPercent = 0;
	this.state = 'rotating';
};

LD32.Player.prototype.rotatingAction = function(dt){
	this.interpPercent += dt*2;
	var smooth = THREE.Math.smoothstep(this.interpPercent, 0, 1);
	this.rotateAnim();

	this.camera.quaternion.slerp(this.targetRot, smooth);
	
	if(this.interpPercent > 1){
		this.state = 'still';
	}
};

LD32.Player.prototype.stillAction = function(dt){
	var result = false;

	var rotY = this.camera.rotation.y*(180/Math.PI);
	var nearest90 = Math.round(rotY/(90))*90;

	//adjust for orientation controls
	if(nearest90 == 0){
		this.forward = new THREE.Vector3(0, 0, -1);
		this.right = new THREE.Vector3(1, 0, 0);
	}
	else if(nearest90 == -90){
		this.forward = new THREE.Vector3(1, 0, 0);
		this.right = new THREE.Vector3(0, 0, 1);
	}
	else if(nearest90 == 180 || nearest90 == -180){
		this.forward = new THREE.Vector3(0, 0, 1);
		this.right = new THREE.Vector3(-1, 0, 0);
	}
	else{
		this.forward = new THREE.Vector3(-1, 0, 0);
		this.right = new THREE.Vector3(0, 0, -1);
	}

	if(keysDown[this.controls.left] || keysDown[keys.left]){
		result = this.setMove(this.right.clone().multiplyScalar(-1));
		LD32.sounds.playFootstep();
	}
	if(keysDown[this.controls.right] || keysDown[keys.right]){
		result = this.setMove(this.right);
		LD32.sounds.playFootstep();
	}
	if(keysDown[this.controls.up] || keysDown[keys.up]){
		result = this.setMove(this.forward);
		LD32.sounds.playFootstep();
	}
	if(keysDown[this.controls.down] || keysDown[keys.down]){
		result = this.setMove(this.forward.clone().multiplyScalar(-1));
		LD32.sounds.playFootstep();
	}

	if(LD32.action == 'swipeleft'){
		result = this.setMove(this.right.clone().multiplyScalar(-1));
		LD32.sounds.playFootstep();
		LD32.action = undefined;
	}
	else if(LD32.action == 'swiperight'){
		result = this.setMove(this.right);
		LD32.sounds.playFootstep();
		LD32.action = undefined;
	}
	else if(LD32.action == 'swipeup'){
		result = this.setMove(this.forward);
		LD32.sounds.playFootstep();
		LD32.action = undefined;
	}
	else if(LD32.action == 'swipedown'){
		result = this.setMove(this.forward.clone().multiplyScalar(-1));
		LD32.sounds.playFootstep();
		LD32.action = undefined;
	}

	if(keysDown[this.controls.rotateLeft]){
		this.setRotation(1);
		LD32.sounds.playFootstep();
	}
	if(keysDown[this.controls.rotateRight]){
		this.setRotation(-1);
		LD32.sounds.playFootstep();
	}
	if(result == 'move'){
		/*setTimeout(function(){
			LD32.sounds.playFootstep();
		}, 250);*/
	}
	else if(result == 'attack'){
		LD32.sounds.play('swing');
	}
	else if(result == 'blocked'){
		setTimeout(function(){
			LD32.sounds.play('thud');
		}, 150);
	}
};

LD32.Player.prototype.updateSelf = function(dt){
	this.light.intensity = Math.sin(LD32.clock.elapsedTime)*0.2+0.9;
	if(this.orientation.deviceOrientation.alpha !== null){
		this.orientation.update();
	}
}

LD32.Player.prototype.attackAnim = function(){
	this.model.getObjectByName('weapon').rotation.x = this.interpolator([0, 0.33, 0.66, 1], [0, 0.35, -0.75, 0], this.interpPercent);
	this.model.getObjectByName('weapon').rotation.z = this.interpolator([0, 0.33, 0.66, 1], [0, -0.1, 0.25, 0], this.interpPercent);
}