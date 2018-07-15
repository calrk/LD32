window.addEventListener('load', () => {
	Fly.bodymat = new THREE.MeshLambertMaterial({
		color: 0x1b5c00,
		map: LD32.textures.getTexture('cloud'),
		// normalMap: LD32.textures.getTexture('noiseNorm')
	});
	Fly.eyemat = new THREE.MeshPhongMaterial({
		shininess: 10,
		color: 0x4c0000,
		specular: 0x620000,
		map: LD32.textures.getTexture('cloud'),
		normalMap: LD32.textures.getTexture('noiseNorm')
	});
});

class Fly extends Actor{

	constructor(params){
		super(params);
		this.lastMoveSuccess = 'blocked';
		this.prevHeight = 0;

		this.takeDamageSound = 'fly_damage';
		this.dieSound = 'fly_die';
		this.hierarchy = {};
	}

	init(){
		super.init();
		this.idleTime = 0.75;
	}

	reset () {
		super.reset();

		this.health = 50;
		this.model.traverse(joint => {
			if(joint.name == 'knee'){
				joint.rotation.z = Math.PI/3;
			}
			else if(joint.name == 'ankle'){
				joint.rotation.z = -Math.PI/5;
			}
			else if(joint.name == 'hip1'){
				joint.rotation.x = Math.PI/6;
			}
			else if(joint.name == 'hip2'){
				joint.rotation.x = -Math.PI/6;
			}
		});
		this.hierarchy.leg1.rotation.z = 0;
		this.hierarchy.leg2.rotation.z = 0;
		this.hierarchy.leg3.rotation.z = 0;
		this.hierarchy.leg4.rotation.z = 0;
		this.hierarchy.leg5.rotation.z = 0;
		this.hierarchy.leg6.rotation.z = 0;
		this.hierarchy.neck.rotation.x = -Math.PI/6;
		this.model.rotation.y = 0;
		this.hierarchy.model.rotation.x = Math.PI/6;
	}

	update (dt) {
		super.update(dt);
		if(this.isAlive()){
			this.model.position.y = Math.sin(LD32.clock.elapsedTime*2)/10;

			if(this.isAlive()){
				this.hierarchy.wing1.rotation.x = -Math.PI/6 + Math.sin(LD32.clock.elapsedTime*40)/7;
				this.hierarchy.wing2.rotation.x = -Math.PI/6 + Math.sin(LD32.clock.elapsedTime*40)/7;
			}
			else{
				this.prevHeight = this.model.position.y;
			}
		}
	}

	createModel () {
		this.blackMat = new THREE.MeshLambertMaterial({color: 0x000000});
		this.model = this.createBody();
		this.model.position.y = 0;
		this.model.scale.set(0.35, 0.35, 0.35);
		this.model.rotation.x = Math.PI/6;

		var neck = this.createJoint(0);
		neck.name = 'neck';
		this.hierarchy.neck = neck;
		neck.position.z = -1;
		neck.rotation.x = -Math.PI/6;
		this.model.add(neck);

		var head = this.createJoint(0);
		var headMesh = this.createDiamond([0.5, 0.5, 0.5], Fly.bodymat);
		head.position.z = -0.25;
		neck.add(head);
		head.add(headMesh);

		var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), Fly.eyemat);
		eye1.position.x = -0.2;
		eye1.position.y = 0.17;
		eye1.position.z = -0.17;
		eye1.scale.z = 0.5;
		eye1.rotation.x = Math.PI/3;
		eye1.rotation.y = Math.PI/4;
		head.add(eye1);

		var eye2 = new THREE.Mesh(eye1.geometry, Fly.eyemat);
		eye2.position.x = 0.2;
		eye2.position.y = 0.17;
		eye2.position.z = -0.17;
		eye2.scale.z = 0.5;
		eye2.rotation.x = Math.PI/3;
		eye2.rotation.y = -Math.PI/4;
		head.add(eye2);

		var abo = this.createJoint(0);
		abo.name = 'abdomen';
		this.hierarchy.abdomen = abo;
		abo.position.y = 0.25;
		abo.position.z = 0.15;
		abo.rotation.x = Math.PI/5;
		this.model.add(abo);

		var abdo = this.createDiamond([0.6, 0.6, 0.75], Fly.bodymat);
		abdo.position.z = 1;
		abo.add(abdo);


		var wing1 = this.createJoint(0);
		wing1.name = 'wing1';
		this.hierarchy.wing1 = wing1;
		wing1.position.z = -0.5;
		wing1.position.x = -0.25;
		wing1.position.y = 0.25;
		wing1.rotation.x = -Math.PI/6;
		wing1.rotation.y = -Math.PI/8;
		wing1.rotation.z = Math.PI/12;
		this.model.add(wing1);

		var wing1_1 = this.createWing();
		wing1_1.position.z = 0.5;
		wing1.add(wing1_1);

		var wing2 = this.createJoint(0);
		wing2.name = 'wing2';
		this.hierarchy.wing2 = wing2;
		wing2.position.z = -0.5;
		wing2.position.x = 0.25;
		wing2.position.y = 0.25;
		wing2.rotation.x = -Math.PI/6;
		wing2.rotation.y = Math.PI/8;
		wing2.rotation.z = -Math.PI/12;
		this.model.add(wing2);

		var wing2_1 = this.createWing();
		wing2_1.position.z = 0.5;
		wing2.add(wing2_1);



		var leg1 = this.createLeg();
		this.hierarchy.leg1 = leg1;
		leg1.position.x = -0.5;
		leg1.position.z = -0.5;
		this.model.add(leg1);

		var leg2 = this.createLeg();
		this.hierarchy.leg2 = leg2;
		leg2.position.x = -0.5;
		leg2.position.z = 0;
		leg2.rotation.z = Math.PI/12;
		this.model.add(leg2);

		var leg3 = this.createLeg();
		this.hierarchy.leg3 = leg3;
		leg3.position.x = -0.5;
		leg3.position.z = 0.5;
		leg3.rotation.z = Math.PI/8;
		this.model.add(leg3);

		var leg4 = this.createLeg(true);
		this.hierarchy.leg4 = leg4;
		leg4.position.x = 0.5;
		leg4.position.z = -0.5;
		leg4.rotation.y = Math.PI;
		this.model.add(leg4);

		var leg5 = this.createLeg(true);
		this.hierarchy.leg5 = leg5;
		leg5.position.x = 0.5;
		leg5.position.z = 0;
		leg5.rotation.y = Math.PI;
		leg5.rotation.z = Math.PI/12;
		this.model.add(leg5);

		var leg6 = this.createLeg(true);
		this.hierarchy.leg6 = leg6;
		leg6.position.x = 0.5;
		leg6.position.z = 0.5;
		leg6.rotation.y = Math.PI;
		leg6.rotation.z = Math.PI/8;
		this.model.add(leg6);

		var asd = new THREE.Object3D();
		this.hierarchy.model = this.model;
		asd.add(this.model);
		this.model = asd;
	}

	stillAction (dt) {
		this.lastMoveTime += dt;
		this.interpPercent += dt;
		if(this.interpPercent > 1){
			this.interpPercent = 0;
		}
		this.idleAnim();
		if(this.lastMoveTime > this.idleTime){
			var rand = Math.random()*8;
			var direction = LD32.gameController.player.model.position.clone().sub(this.model.position);
			direction.round();
			var dot = direction.dot(this.right.clone())

			if(direction.length() <= 2){
				this.lastMoveSuccess = true;
				if(dot == 0){
					var dot2 = direction.dot(this.forward.clone());
					if(dot2 < 0){
						this.setRotation(1);
					}
					else{
						this.lastMoveSuccess = this.setMove(this.forward, 1);
					}
				}
				else if(dot < 0){
					this.setRotation(1);
				}
				else{
					this.setRotation(-1);
				}
			}
			else if(rand < 6 && this.lastMoveSuccess != 'blocked'){
				this.lastMoveSuccess = this.setMove(this.forward, 1);
			}
			else if(rand < 7){
				this.setRotation(1);
				this.lastMoveSuccess = true;
			}
			else if(rand < 8){
				this.setRotation(-1);
				this.lastMoveSuccess = true;
			}
			this.lastMoveTime = 0;
		}
	}

	createLeg (rotate) {
		var hip = this.createJoint(0);
		if(rotate){
			hip.name = 'hip1';
			hip.rotation.x 	= Math.PI/6;
		}
		else{
			hip.name = 'hip2';
			hip.rotation.x = -Math.PI/6;
		}
		hip.rotation.z = Math.PI/3;

		var upperLeg = this.createDiamond([0.3, 0.15, 0.15], Fly.bodymat);
		upperLeg.position.x = -0.3;
		hip.add(upperLeg);

		var knee = this.createJoint(0);
		knee.name = 'knee';
		knee.position.x = -0.6;
		knee.rotation.z = Math.PI/3;
		hip.add(knee);

		var lowerLeg = this.createDiamond([0.3, 0.15, 0.15], Fly.bodymat);
		lowerLeg.position.x = -0.3;
		knee.add(lowerLeg);

		var ankle = this.createJoint(0);
		ankle.name = 'ankle';
		ankle.position.x = -0.6;
		ankle.rotation.z = -Math.PI/5;
		knee.add(ankle);

		var foot = this.createDiamond([0.15, 0.1, 0.1], this.blackMat);
		foot.position.x = -0.15;
		ankle.add(foot);

		var parent = new THREE.Object3D();
		parent.add(hip);
		parent.name = 'hip';
		return parent;
	}

	createWing (mat) {
		return new THREE.Mesh(LD32.geometry.createWing(), new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.5}));
	}

	createBody () {
		var mesh = new THREE.Mesh(LD32.geometry.createBody(), Fly.bodymat);
		mesh.rotation.x = Math.PI/2;
		var parent = new THREE.Object3D();
		parent.add(mesh);
		parent.name = 'body';
		return parent;
	}

	idleAnim () {
		this.hierarchy.neck.rotation.z = this.interpolator([0, 0.3, 0.4, 0.5, 0.6, 1], [0, 0, -0.1, 0.1, 0, 0], this.interpPercent);
		this.hierarchy.abdomen.rotation.x = Math.PI/5 + this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, 0, -0.05, 0, 0], this.interpPercent);

		this.hierarchy.leg1.rotation.z =              this.interpolator([0, 0.2, 0.3, 0.4, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
		this.hierarchy.leg2.rotation.z = Math.PI/12 + this.interpolator([0, 0.4, 0.5, 0.6, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
		this.hierarchy.leg3.rotation.z = Math.PI/8 +  this.interpolator([0, 0.6, 0.7, 0.8, 1], [0, 0, 0.1, 0, 0], this.interpPercent);

		this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg5.rotation.z = this.hierarchy.leg2.rotation.z;
		this.hierarchy.leg6.rotation.z = this.hierarchy.leg3.rotation.z;
	}

	attackAnim () {
		this.hierarchy.model.rotation.x = Math.PI/6 + this.interpolator([0, 0.2, 0.6, 1], [0, -0.15, 0.25, 0], this.interpPercent);
		this.hierarchy.model.position.z = this.interpolator([0, 0.2, 0.6, 1], [0, -0.25, -0.75, 0], this.interpPercent);

		this.hierarchy.leg1.rotation.z =              this.interpolator([0, 0.2, 0.4, 0.6, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
		this.hierarchy.leg2.rotation.z = Math.PI/12 + this.interpolator([0, 0.3, 0.5, 0.7, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
		this.hierarchy.leg3.rotation.z = Math.PI/8 +  this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);

		this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg5.rotation.z = this.hierarchy.leg2.rotation.z;
		this.hierarchy.leg6.rotation.z = this.hierarchy.leg3.rotation.z;
	}

	dieAnim () {
		this.hierarchy.model.rotation.x = this.interpolator([0, 0.5, 1], [Math.PI/6, Math.PI, Math.PI], this.interpPercent);
		this.hierarchy.leg1.rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
		this.hierarchy.leg2.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg3.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg5.rotation.z = this.hierarchy.leg1.rotation.z;
		this.hierarchy.leg6.rotation.z = this.hierarchy.leg1.rotation.z;

		this.model.traverse(joint => {
			if(joint.name == 'knee'){
				joint.rotation.z = Math.PI/3 + this.interpolator([0, 1], [0, 0.15], this.interpPercent);
			}
			else if(joint.name == 'ankle'){
				joint.rotation.z = -Math.PI/5 + this.interpolator([0, 1], [0, 3*Math.PI/5], this.interpPercent);
			}
			else if(joint.name == 'hip1' || joint.name == 'hip2'){
				joint.rotation.x = 0;//Math.PI/6;
			}
		});

		this.hierarchy.neck.rotation.x = this.interpolator([0, 1], [-Math.PI/6, 0], this.interpPercent);
		this.hierarchy.abdomen.rotation.x = Math.PI/5 + this.interpolator([0, 1], [0, -0.15], this.interpPercent);

		this.hierarchy.wing1.rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);
		this.hierarchy.wing2.rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);

		this.model.position.y = this.interpolator([0, 0.5, 1], [this.prevHeight, -0.85, -0.85], this.interpPercent);
		this.model.rotation.y = this.model.rotation.y += 0.005;
	}
}
