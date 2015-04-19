Actor.Dog = function(params){
	Actor.call(this, params);
	this.lastMoveSuccess = true;
}
Actor.Dog.prototype = Object.create(Actor.prototype);
Actor.Dog.prototype.createModel = function(){
	this.dogMat = new THREE.MeshLambertMaterial({color: 0x800000});
	this.model = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1), this.dogMat);
	this.model.position.y = -0.5;
	this.model.scale.x = 0.5;
	this.model.scale.y = 0.5;
	this.model.scale.z = 0.5;

	var neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.25), this.dogMat);
	neck.position.y = 0.25;
	neck.position.z = -0.5;
	neck.rotation.x = -Math.PI/3;
	this.model.add(neck);

	var head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.35), this.dogMat);
	head.position.y = 0.15;
	head.position.z = 0;
	head.rotation.x = Math.PI/3;
	neck.add(head);

	var leg1 = this.createLeg();
	leg1.position.x = -0.25;
	leg1.position.z = -0.5;
	this.model.add(leg1);

	var leg2 = this.createLeg();
	leg2.position.x = 0.25;
	leg2.position.z = -0.5;
	this.model.add(leg2);

	var leg3 = this.createLeg();
	leg3.position.x = -0.25;
	leg3.position.z = 0.5;
	this.model.add(leg3);

	var leg4 = this.createLeg();
	leg4.position.x = 0.25;
	leg4.position.z = 0.5;
	this.model.add(leg4);
}

Actor.Dog.prototype.stillAction = function(dt){
	if(this.lastMoveTime > 1){
		var rand = Math.random()*6;
		if(rand < 4 && this.lastMoveSuccess){
			this.lastMoveSuccess = this.setMove(this.forward);
		}
		else if(rand < 5){
			this.setRotation(1);
			this.lastMoveSuccess = true;
		}
		else if(rand < 6){
			this.setRotation(-1);
			this.lastMoveSuccess = true;
		}
		this.lastMoveTime = 0;
	}
}

Actor.Dog.prototype.createLeg = function(){
	var hip = this.createJoint(0);
	hip.name = 'hip';
	hip.position.y = -0.25;

	var upperLeg = this.createDiamond([0.075, 0.15, 0.075], this.dogMat);
	upperLeg.position.y = -0.15;
	hip.add(upperLeg);

	var knee = this.createJoint(0);
	knee.name = 'knee';
	knee.position.y = -0.3;
	hip.add(knee);

	var lowerLeg = this.createDiamond([0.075, 0.15, 0.075], this.dogMat);
	lowerLeg.position.y = -0.15;
	knee.add(lowerLeg);
	
	return hip;
}