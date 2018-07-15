
class Player extends Actor{

	constructor(params){
		super(params);

		this.controls = params.controls || {
			left: keys.a,
			right: keys.d,
			up: keys.w,
			down: keys.s,
		};

		this.camera = LD32.camera;//new THREE.PerspectiveCamera(75, LD32.width/LD32.height, 0.1, 10);
		this.light = new THREE.PointLight(0xffffff, 1, 10);
		this.camera.add(this.light);
		this.orientation = new THREE.DeviceOrientationControls(this.camera);
	}

	createModel () {
		this.model = new THREE.Object3D();

		this.weaponJoint = this.createJoint();
		this.weaponJoint.position.x = 0.75;
		this.weaponJoint.position.y = -1.5;
		this.weaponJoint.position.z = -1;
		this.weaponJoint.name = 'weapon';
		this.camera.add(this.weaponJoint);

		var weaponMat = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			map: LD32.textures.getTexture('newspaper'),
		});
		weaponMat.depthTest = false;
		weaponMat.transparent = true
		this.weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16, 16), weaponMat);
		this.weapon.position.y = 1;
		this.weapon.rotation.y = 0.75;
		this.weapon.renderOrder = 10;
		this.weaponJoint.add(this.weapon);

	}

	setVr(){
		if(!this.controller){
			this.controller = new THREE.DaydreamController();
		}
		this.controller.position.set( 0.3, 0.85/*-1.6*/, -0.5 );
		this.model.add( this.controller );

		this.controller.add(this.weaponJoint);
		this.weaponJoint.position.x = 0;
		this.weaponJoint.position.y = 0;
		this.weaponJoint.position.z = 0;

		this.weaponJoint.rotation.x = -1.57;
		this.weaponJoint.rotation.y = 0;
		this.weaponJoint.rotation.z = 0;

		this.weapon.position.x = 0;
		this.weapon.position.y = 2;
		this.weapon.position.z = 0;

		this.isVR = true;
		// this.weapon.position.set(0,0,0);
		// this.weapon.scale.set(0.1,0.1,0.1);

		// var controllerHelper = new THREE.Line( new THREE.BufferGeometry(), new THREE.LineBasicMaterial( { linewidth: 2 } ) );
		// controllerHelper.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 10 ], 3 ) );
		// this.controller.add( controllerHelper );

		this.controller.addEventListener('angularvelocitychanged', data => {
			if(data.angularVelocity.x < -5 && this.state == 'still'){
				//attack

				var target = this.forward.clone().multiplyScalar(2);
				this.targetPos = this.model.position.clone().add(target);
				this.prevPos = this.model.position.clone();

				var result = this.gameController.canMove(this.targetPos, this, true);
				if(result == 'attack'){
					target = target.clone().multiplyScalar(0.15);
					this.targetPos = this.model.position.clone().add(target);
					this.interpPercent = 0;
					this.state = 'attacking';
					LD32.sounds.play('swing');
				}
			}
		});
	}

	setMove (target){
		var forwards = false;
		if(target.equals(this.forward)){
			forwards = true;
		}

		target = target.clone().multiplyScalar(2);
		this.prevPos = this.model.position.clone();
		this.targetPos = this.model.position.clone().add(target);

		this.interpPercent = 0;
		var result = this.gameController.canMove(this.targetPos, this, forwards);
		if(result == 'move'){
			this.state = 'moving';
			return result;
		}
		else if(result == 'blocked'){
			target = target.clone().multiplyScalar(0.15);
			this.targetPos = this.model.position.clone().add(target);
			this.state = 'movingFail';
			return result;
		}
		else if(result == 'attack'){
			if(target.equals(this.forward)){

			}
			target = target.clone().multiplyScalar(0.15);
			this.targetPos = this.model.position.clone().add(target);
			this.state = 'attacking';
			return result;
		}
	}

	takeDamage (damage) {
		super.takeDamage(damage);
		setTimeout(() => {
			if(Math.random() < 0.5){
				LD32.sounds.play('pain_1');
			}
			else{
				LD32.sounds.play('pain_2');
			}
		}, 150);
	}

	reset () {
		super.reset();
		this.health = 100;
		this.model.position.x = 2;
		this.model.position.z = 2;
		this.prevPos = this.model.position;
		this.targetPos = this.model.position;

		this.setRotation(-1);
		this.model.add(this.camera);
	}

	setRotation (target) {
		var euler = new THREE.Euler(0, Math.PI/2*target, 0, 'XYZ');
		this.prevEuler = new THREE.Euler(0, this.prevEuler.y+Math.PI/2*target, 0, 'XYZ');

		this.targetRot = new THREE.Quaternion();
		this.targetRot.setFromEuler(this.prevEuler);

		this.interpPercent = 0;
		this.state = 'rotating';
	}

	rotatingAction (dt) {
		this.interpPercent += dt*2;
		var smooth = THREE.Math.smoothstep(this.interpPercent, 0, 1);
		this.rotateAnim();

		this.camera.quaternion.slerp(this.targetRot, smooth);

		if(this.interpPercent > 1){
			this.state = 'still';
		}
	}

	stillAction (dt) {
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

		if(this.controller && this.controller.getTouchpadState() === true){
			result = this.setMove(this.forward);
			if(result == 'attack'){
				// need to cancel the attack
				// return;
			}
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
			setTimeout(() => {
				LD32.sounds.play('thud');
			}, 150);
		}
	}

	update (dt) {
		super.update(dt);
		this.light.intensity = Math.sin(LD32.clock.elapsedTime)*0.2+0.9;
		if(this.isVR){
			this.light.intensity += 0.5;
			this.light.distance = 15;
		}
		if(this.orientation.deviceOrientation.alpha !== null){
			this.orientation.update();
		}

		this.model.position.y = -this.camera.position.y;
		if(this.controller){
			this.controller.update();
		}
	}

	over(dt){
		if(this.controller){
			this.controller.update();

			if ( this.controller.getTouchpadState() === true ) {
				LD32.restart();
			}
		}
	}

	attackAnim () {
		if(this.isVR){
			return;
		}
		this.model.getObjectByName('weapon').rotation.x = this.interpolator([0, 0.33, 0.66, 1], [0, 0.35, -0.75, 0], this.interpPercent);
		this.model.getObjectByName('weapon').rotation.z = this.interpolator([0, 0.33, 0.66, 1], [0, -0.1, 0.25, 0], this.interpPercent);
	}
}
