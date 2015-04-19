var Actor = function(){

};

Actor.prototype = {
	model : new THREE.Object3D(),
	state : 'still',
	self : this,
	health : 100,

	forward : new THREE.Vector3(0, 0, -1),
	right : new THREE.Vector3(1, 0, 0),

	MathV : new THREE.Vector3(),
	MathQ : new THREE.Quaternion(),

	lastMoveTime : 0,
	idleTime : 1,
	prevPos : 0,
	targetPos : 0,
	prevEuler : new THREE.Euler(0, 0, 0, 'XYZ'),
	targetRot : 0,
	interpPercent : 0,

	init: function(){
		this.createModel();
		scene.add(this.model);

		this.initSelf();
		
		this.reset();
	},
	initSelf: function(){},

	takeDamage : function(damage){
		this.health -= damage || 10;
	},

	setPosition: function(x, z){
		this.model.position.x = x*2;
		this.model.position.z = z*2;
		this.prevPos = this.model.position;
		this.targetPos = this.model.position;
	},

	reset : function(){
		this.health = 100;
		this.model.position.x = -2;//Math.floor(Math.random()*10)*2;
		this.model.position.z = -2;//Math.floor(Math.random()*10)*2;
		this.prevPos = this.model.position;
		this.targetPos = this.model.position;
		
		this.model.rotation.x = this.model.rotation.y = this.model.rotation.z = 0;
		this.forward = new THREE.Vector3(0, 0, -1);
		this.right = new THREE.Vector3(1, 0, 0);
		this.prevEuler = new THREE.Euler(0, 0, 0, 'XYZ');

		this.state = 'still';
		this.resetSelf();
	},
	resetSelf: function(){},

	createModel : function(){
		this.model = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshLambertMaterial({color:0x0000FF}));
	},

	update : function(dt){
		if(this.isAlive()){
			switch(this.state){
				case 'still':
					this.stillAction(dt);
					break;
				case 'moving':
					this.movingAction(dt);
					break;
				case 'movingFail':
					this.movingFailAction(dt);
					break;
				case 'rotating':
					this.rotatingAction(dt);
					break;
				case 'attacking':
					this.attackingAction(dt);
					break;
			}
			this.updateSelf();
		}
		else{
			if(this.state != 'dead'){
				this.interpPercent = 0;
				this.state = 'dead';
			}
			this.dyingAction(dt);
		}
	},
	updateSelf: function(){},

	stillAction : function(dt){
		this.lastMoveTime += dt;
		this.interpPercent += dt;
		if(this.interpPercent > 1){
			this.interpPercent = 0;
		}
		this.idleAnim();

		if(this.lastMoveTime > this.idleTime){
			var rand = Math.random()*6;
			if(rand < 1){
				this.setMove(this.right.clone().multiplyScalar(-1));
			}
			else if(rand < 2){
				this.setMove(this.right);
			}
			else if(rand < 3){
				this.setMove(this.forward);
			}
			else if(rand < 4){
				this.setMove(this.forward.clone().multiplyScalar(-1));
			}
			else if(rand < 5){
				this.setRotation(1);
			}
			else if(rand < 6){
				this.setRotation(-1);
			}
			this.lastMoveTime = 0;
		}
	},

	movingAction : function(dt, speed){
		var speed = speed || 2.5;
		this.interpPercent += dt*speed;
		if(this.interpPercent > 1){
			this.interpPercent = 1;
		}

		this.walkAnim();
		var smooth = THREE.Math.smoothstep(this.interpPercent, 0, 1);
		this.model.position.copy(this.MathV.lerpVectors(this.prevPos, this.targetPos, smooth));
		/*if(this.interpPercent > 0.6){
			this.prevPos = this.targetPos;
		}*/
		if(this.interpPercent >= 1){
			this.model.position.copy(this.targetPos);
			this.prevPos = this.targetPos;
			this.state = 'still';
		}
	},

	movingFailAction : function(dt){
		this.interpPercent += dt*5;
		this.walkFailAnim();

		var smooth = Math.sin(this.interpPercent*Math.PI);
		this.model.position.copy(this.MathV.lerpVectors(this.prevPos, this.targetPos, smooth));
		if(this.interpPercent > 1){
			this.model.position.copy(this.prevPos);
			this.targetPos = this.prevPos;
			this.state = 'still';
		}
	},

	rotatingAction : function(dt){
		this.interpPercent += dt*2;
		var smooth = THREE.Math.smoothstep(this.interpPercent, 0, 1);
		this.rotateAnim();

		this.model.quaternion.slerp(this.targetRot, smooth);
		
		if(this.interpPercent > 1){
			this.state = 'still';
		}
	},

	attackingAction : function(dt){
		this.interpPercent += dt*3;
		this.attackAnim();

		var smooth = Math.sin(this.interpPercent*Math.PI);
		this.model.position.copy(this.MathV.lerpVectors(this.prevPos, this.targetPos, smooth));
		if(this.interpPercent > 1){
			this.model.position.copy(this.prevPos);
			this.targetPos = this.prevPos;
			this.state = 'still';
		}
	},

	dyingAction : function(dt){
		if(this.interpPercent < 1){
			this.interpPercent += dt;
			this.dieAnim();
		}
	},

	getModel : function(){
		return this.model;
	},

	isAlive : function(){
		return this.health > 0;
	},

	setMove : function(target){
		var forwards = false;
		if(target.equals(this.forward)){
			forwards = true;
		}

		target = target.clone().multiplyScalar(2);
		this.prevPos = this.model.position.clone();
		this.targetPos = this.model.position.clone().add(target);

		this.interpPercent = 0;
		var result = gameController.canMove(this.targetPos, this, forwards);
		if(result == 'move'){
			this.state = 'moving';
			return true;
		}
		else if(result == 'blocked'){
			target = target.clone().multiplyScalar(0.15);
			this.targetPos = this.model.position.clone().add(target);
			this.state = 'movingFail';
			return false;
		}
		else if(result == 'attack'){
			if(target.equals(this.forward)){

			}
			target = target.clone().multiplyScalar(0.15);
			this.targetPos = this.model.position.clone().add(target);
			this.state = 'attacking';
			return false;
		}
	},

	spacesOccupied : function(){
		return [this.prevPos, this.targetPos];
	},

	setRotation : function(target){
		var euler = new THREE.Euler(0, Math.PI/2*target, 0, 'XYZ');
		this.prevEuler = new THREE.Euler(0, this.prevEuler.y+Math.PI/2*target, 0, 'XYZ');

		this.targetRot = new THREE.Quaternion();
		this.targetRot.setFromEuler(this.prevEuler);

		this.right.applyEuler(euler);
		this.right.round();
		this.forward.applyEuler(euler);
		this.forward.round();

		this.interpPercent = 0;
		this.state = 'rotating';
	},

	getHealth : function(){
		return this.health;
	},

	createJoint: function(length){
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(length, 0, 0));
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(0, length, 0));
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(0, 0, length));
		geometry.colors.push(new THREE.Color(0xff0000));
		geometry.colors.push(new THREE.Color(0xff0000));
		geometry.colors.push(new THREE.Color(0x00ff00));
		geometry.colors.push(new THREE.Color(0x00ff00));
		geometry.colors.push(new THREE.Color(0x0000ff));
		geometry.colors.push(new THREE.Color(0x0000ff));

		var material = new THREE.LineBasicMaterial();
		material.vertexColors = THREE.VertexColors;

		var axes = new THREE.Line(geometry, material, THREE.LinePieces);
		axes.name = "axes";

		return axes;
	},

	createDiamond: function(size, mat){
		var geo = new THREE.Geometry();
		var mat = mat || new THREE.MeshLambertMaterial({color: 0x800000});

		geo.vertices.push(new THREE.Vector3(size[0], 0, 0));
		geo.vertices.push(new THREE.Vector3(-size[0], 0, 0));
		geo.vertices.push(new THREE.Vector3(0, size[1], 0));
		geo.vertices.push(new THREE.Vector3(0, -size[1], 0));
		geo.vertices.push(new THREE.Vector3(0, 0, size[2]));
		geo.vertices.push(new THREE.Vector3(0, 0, -size[2]));

		geo.faces.push(new THREE.Face3(0, 2, 4));
		geo.faces.push(new THREE.Face3(0, 4, 3));
		geo.faces.push(new THREE.Face3(0, 3, 5));
		geo.faces.push(new THREE.Face3(0, 5, 2));

		geo.faces.push(new THREE.Face3(1, 2, 5));
		geo.faces.push(new THREE.Face3(1, 5, 3));
		geo.faces.push(new THREE.Face3(1, 3, 4));
		geo.faces.push(new THREE.Face3(1, 4, 2));

		var uva = new THREE.Vector2(0, 0);
		var uvb = new THREE.Vector2(0, 1);
		var uvc = new THREE.Vector2(1, 1);
		var uvd = new THREE.Vector2(1, 0);

		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under

		geo.computeFaceNormals();

		var diamond = new THREE.Mesh(geo, mat);
		return diamond;
	},

	idleAnim: function(){},
	walkAnim: function(){},
	walkFailAnim: function(){},
	rotateAnim: function(){},
	attackAnim: function(){},
	dieAnim: function(){},

	interpolator: function(times, angles, currentTime){
		var firstPos = 0; 
		var secondPos = 1;

		while(secondPos < times.length-1){
			if(times[firstPos] < currentTime && times[secondPos] > currentTime){
				break;
			}
			else{
				firstPos ++;
				secondPos ++;
			}
		}

		var animTime = times[secondPos] - times[firstPos];
		var animPos = currentTime - times[firstPos];
		animPos /= animTime;

		if(animPos > 1 || animPos < 0){
			animPos = 1;
		}

		var deltaAngle = angles[secondPos] - angles[firstPos];
		return (deltaAngle * animPos) + angles[firstPos];
	}
}

Actor.Ant = function(params){
	Actor.call(this, params);
	this.lastMoveSuccess = true;
}

Actor.Ant.prototype = Object.create(Actor.prototype);

Actor.Ant.prototype.initSelf = function(){
	this.idleTime = 1.5;
}
Actor.Ant.prototype.resetSelf = function(){
	this.model.traverse(function(joint){
		if(joint.name == 'knee'){
			joint.rotation.z = 2*Math.PI/3;
		}
		else if(joint.name == 'ankle'){
			joint.rotation.z = -Math.PI/3;
		}
	});
	this.model.getObjectByName('leg1').rotation.z = 0;
	this.model.getObjectByName('leg2').rotation.z = 0;
	this.model.getObjectByName('leg3').rotation.z = 0;
	this.model.getObjectByName('leg4').rotation.z = 0;
	this.model.getObjectByName('leg5').rotation.z = 0;
	this.model.getObjectByName('leg6').rotation.z = 0;
	this.model.getObjectByName('neck').rotation.x = 0;
}

Actor.Ant.prototype.createModel = function(){
	this.antMat = new THREE.MeshLambertMaterial({color: 0x800000});
	this.antMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xA00000, 
		specular: 0x444444, 
		map: textures.getTexture('cloud'),
		normalMap: textures.getTexture('noiseNorm')
	});
	this.blackMat = new THREE.MeshLambertMaterial({color: 0x000000});
	this.model = this.createBody();
	this.model.position.y = -0.75;
	this.model.scale.x = 0.35;
	this.model.scale.y = 0.35;
	this.model.scale.z = 0.35;

	var neck = this.createJoint(0);
	neck.name = 'neck';
	neck.position.z = -1;
	this.model.add(neck);

	var head = this.createDiamond([0.5, 0.5, 0.5], this.antMat);
	head.position.z = -0.5;
	neck.add(head);

	var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), this.blackMat);
	eye1.position.x = -0.15;
	eye1.position.y = 0.15;
	eye1.position.z = -0.15;
	head.add(eye1);

	var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), this.blackMat);
	eye1.position.x = 0.15;
	eye1.position.y = 0.15;
	eye1.position.z = -0.15;
	head.add(eye1);

	var abo = this.createJoint(0);
	abo.name = 'abdomen';
	abo.position.z = 1;
	abo.rotation.x = -Math.PI/6;
	this.model.add(abo);

	var abdo = this.createDiamond([1, 1, 1], this.antMat);
	abdo.position.z = 1;
	abo.add(abdo);

	var mandy1 = this.createJoint(0);
	mandy1.name = 'mandy1';
	mandy1.position.x = 0.5;
	mandy1.rotation.y = -Math.PI/6;
	head.add(mandy1);
	var mandy1_1 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy1_1.position.z = -0.3;
	mandy1.add(mandy1_1);
	var mandy1_2 = this.createJoint(0);
	mandy1_2.name = 'mandy1_2';
	mandy1_2.rotation.y = Math.PI/3;
	mandy1_2.position.z = -0.6;
	mandy1.add(mandy1_2);
	var mandy1_3 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy1_3.position.z = -0.3;
	mandy1_2 .add(mandy1_3);

	var mandy2 = this.createJoint(0);
	mandy2.name = 'mandy2';
	mandy2.rotation.y = Math.PI/6;
	mandy2.position.x = -0.5;
	head.add(mandy2);
	var mandy2_1 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy2_1.position.z = -0.3;
	mandy2.add(mandy2_1);
	var mandy2_2 = this.createJoint(0);
	mandy2_2.name = 'mandy2_2';
	mandy2_2.rotation.y = -Math.PI/3;
	mandy2_2.position.z = -0.6;
	mandy2.add(mandy2_2);
	var mandy2_3 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy2_3.position.z = -0.3;
	mandy2_2 .add(mandy2_3);

	var leg1 = this.createLeg();
	leg1.name = 'leg1';
	leg1.position.x = -0.5;
	leg1.position.z = -0.5;
	this.model.add(leg1);

	var leg2 = this.createLeg();
	leg2.name = 'leg2';
	leg2.position.x = -0.5;
	leg2.position.z = 0;
	this.model.add(leg2);

	var leg3 = this.createLeg();
	leg3.name = 'leg3';
	leg3.position.x = -0.5;
	leg3.position.z = 0.5;
	this.model.add(leg3);

	var leg4 = this.createLeg();
	leg4.name = 'leg4';
	leg4.position.x = 0.5;
	leg4.position.z = -0.5;
	this.model.add(leg4);

	var leg5 = this.createLeg();
	leg5.name = 'leg5';
	leg5.position.x = 0.5;
	leg5.position.z = 0;
	this.model.add(leg5);

	var leg6 = this.createLeg();
	leg6.name = 'leg6';
	leg6.position.x = 0.5;
	leg6.position.z = 0.5;
	this.model.add(leg6);
}

Actor.Ant.prototype.stillAction = function(dt){
	this.lastMoveTime += dt;
	this.interpPercent += dt;
	if(this.interpPercent > 1){
		this.interpPercent = 0;
	}
	this.idleAnim();
	if(this.lastMoveTime > 1){
		var rand = Math.random()*6;
		if(rand < 4 && this.lastMoveSuccess){
			this.lastMoveSuccess = this.setMove(this.forward, 1);
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

Actor.Ant.prototype.createLeg = function(){
	var hip = this.createJoint(0);
	hip.rotation.z = -Math.PI/3;

	var upperLeg = this.createDiamond([0.3, 0.15, 0.15], this.antMat);
	upperLeg.position.x = -0.3;
	hip.add(upperLeg);

	var knee = this.createJoint(0);
	knee.name = 'knee';
	knee.position.x = -0.6;
	knee.rotation.z = 2*Math.PI/3;
	hip.add(knee);

	var lowerLeg = this.createDiamond([0.6, 0.15, 0.15], this.antMat);
	lowerLeg.position.x = -0.6;
	knee.add(lowerLeg);

	var ankle = this.createJoint(0);
	ankle.name = 'ankle';
	ankle.position.x = -1.2;
	ankle.rotation.z = -Math.PI/3;
	knee.add(ankle);

	var foot = this.createDiamond([0.15, 0.1, 0.1], this.blackMat);
	foot.position.x = -0.15;
	ankle.add(foot);
	
	var parent = new THREE.Object3D();
	parent.add(hip);
	parent.name = 'hip';
	return parent;
}

Actor.Ant.prototype.createBody = function(){
	var geo = new THREE.Geometry();

	geo.vertices.push(new THREE.Vector3(0, -1, 0));
	geo.vertices.push(new THREE.Vector3(0.5, -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, -0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, -0.5, 0.5));

	geo.vertices.push(new THREE.Vector3(0.5, 0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, 0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, 0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, 0.5, 0.5));
	
	geo.vertices.push(new THREE.Vector3(0, 1, 0));

	geo.faces.push(new THREE.Face3(0, 1, 4));
	geo.faces.push(new THREE.Face3(0, 2, 1));
	geo.faces.push(new THREE.Face3(0, 3, 2));
	geo.faces.push(new THREE.Face3(0, 4, 3));

	geo.faces.push(new THREE.Face3(1, 2, 5));
	geo.faces.push(new THREE.Face3(5, 2, 6));
	geo.faces.push(new THREE.Face3(2, 3, 6));
	geo.faces.push(new THREE.Face3(6, 3, 7));

	geo.faces.push(new THREE.Face3(3, 4, 7));
	geo.faces.push(new THREE.Face3(7, 4, 8));
	geo.faces.push(new THREE.Face3(4, 1, 8));
	geo.faces.push(new THREE.Face3(8, 1, 5));


	geo.faces.push(new THREE.Face3(8, 5, 9));
	geo.faces.push(new THREE.Face3(5, 6, 9));
	geo.faces.push(new THREE.Face3(6, 7, 9));
	geo.faces.push(new THREE.Face3(7, 8, 9));

	geo.computeFaceNormals();

	var uva = new THREE.Vector2(0, 0);
	var uvb = new THREE.Vector2(0, 1);
	var uvc = new THREE.Vector2(1, 1);
	var uvd = new THREE.Vector2(1, 0);

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under

	var mesh = new THREE.Mesh(geo, this.antMat);
	mesh.rotation.x = Math.PI/2;
	var parent = new THREE.Object3D();
	parent.add(mesh);
	parent.name = 'body';
	return parent;
}

Actor.Ant.prototype.idleAnim = function(){
	this.model.getObjectByName('neck').rotation.z = this.interpolator([0, 0.3, 0.4, 0.5, 0.6, 1], [0, 0, -0.1, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('abdomen').rotation.x = -Math.PI/6 + this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, 0, -0.05, 0, 0], this.interpPercent);
}

Actor.Ant.prototype.walkAnim = function(){
	this.model.getObjectByName('leg1').rotation.y = -Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
	this.model.getObjectByName('leg2').rotation.y = this.interpolator([0, 0.5, 1], [0, 0.3, 0], this.interpPercent);
	this.model.getObjectByName('leg3').rotation.y = Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);

	this.model.getObjectByName('leg4').rotation.y = Math.PI + Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
	this.model.getObjectByName('leg5').rotation.y = Math.PI + this.interpolator([0, 0.5, 1], [0, 0.3, 0], this.interpPercent);
	this.model.getObjectByName('leg6').rotation.y = Math.PI + -Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
}

Actor.Ant.prototype.walkFailAnim = function(){
	this.walkAnim();
}

Actor.Ant.prototype.rotateAnim = function(){
	this.walkAnim();
}

Actor.Ant.prototype.attackAnim = function(){
	this.model.getObjectByName('mandy1').rotation.y = -Math.PI/6 + this.interpolator([0, 0.33, 0.66, 1], [0, -0.25, 0.5, 0], this.interpPercent);
	this.model.getObjectByName('mandy2').rotation.y = Math.PI/6 + this.interpolator([0, 0.33, 0.66, 1], [0, 0.25, -0.5, 0], this.interpPercent);
	this.walkAnim();
}

Actor.Ant.prototype.dieAnim = function(){
	this.model.getObjectByName('leg1').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.model.getObjectByName('leg2').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.model.getObjectByName('leg3').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.model.getObjectByName('leg4').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.model.getObjectByName('leg5').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.model.getObjectByName('leg6').rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);

	var self = this;
	this.model.traverse(function(joint){
		if(joint.name == 'knee'){
			joint.rotation.z = 2*Math.PI/3 + self.interpolator([0, 1], [0, 0.65], self.interpPercent);
		}
		else if(joint.name == 'ankle'){
			joint.rotation.z = -Math.PI/3 + self.interpolator([0, 1], [0, Math.PI], self.interpPercent);
		}
	});

	this.model.getObjectByName('neck').rotation.x = this.interpolator([0, 1], [0, -0.5], this.interpPercent);
	this.model.getObjectByName('abdomen').rotation.x = this.interpolator([0, 1], [-Math.PI/6, 0.15], this.interpPercent);

	this.model.getObjectByName('mandy1').rotation.y = -Math.PI/6 + this.interpolator([0, 1], [0, 0.5], this.interpPercent);
	this.model.getObjectByName('mandy2').rotation.y = Math.PI/6 + this.interpolator([0, 1], [0, -0.5], this.interpPercent);
	this.model.getObjectByName('mandy1_2').rotation.y = Math.PI/3 + this.interpolator([0, 1], [0, 0.5], this.interpPercent);
	this.model.getObjectByName('mandy2_2').rotation.y = -Math.PI/3 + this.interpolator([0, 1], [0, -0.5], this.interpPercent);

	this.model.position.y = this.interpolator([0, 1], [-0.75, -0.78], this.interpPercent);
	this.model.rotation.y += 0.005;
}
Actor.Fly = function(params){
	Actor.call(this, params);
	this.lastMoveSuccess = true;
	this.prevHeight = 0;
}

Actor.Fly.prototype = Object.create(Actor.prototype);

Actor.Fly.prototype.initSelf = function(){
	this.idleTime = 1;
}

Actor.Fly.prototype.resetSelf = function(){
	this.health = 50;
	this.model.traverse(function(joint){
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
	this.model.getObjectByName('leg1').rotation.z = 0;
	this.model.getObjectByName('leg2').rotation.z = 0;
	this.model.getObjectByName('leg3').rotation.z = 0;
	this.model.getObjectByName('leg4').rotation.z = 0;
	this.model.getObjectByName('leg5').rotation.z = 0;
	this.model.getObjectByName('leg6').rotation.z = 0;
	this.model.getObjectByName('neck').rotation.x = -Math.PI/6;
	this.model.rotation.y = 0;
	this.model.getObjectByName('model').rotation.x = Math.PI/6;
}


Actor.Fly.prototype.updateSelf = function(){
	this.model.position.y = Math.sin(clock.elapsedTime*2)/10;

	if(this.isAlive()){
		this.model.getObjectByName('wing1').rotation.x = -Math.PI/6 + Math.sin(clock.elapsedTime*40)/7;
		this.model.getObjectByName('wing2').rotation.x = -Math.PI/6 + Math.sin(clock.elapsedTime*40)/7;
	}
	else{
		prevHeight = this.model.position.y;
	}
}

Actor.Fly.prototype.createModel = function(){
	this.flyMat = new THREE.MeshLambertMaterial({color: 0x800000});
	this.flyMat = new THREE.MeshPhongMaterial({
		shininess: 0.5, 
		color: 0x081b00, 
		specular: 0x113700, 
		map: textures.getTexture('cloud'),
		normalMap: textures.getTexture('noiseNorm')
	});
	this.eyeMat = new THREE.MeshPhongMaterial({
		shininess: 10, 
		color: 0x4c0000, 
		specular: 0x620000, 
		map: textures.getTexture('cloud'),
		normalMap: textures.getTexture('noiseNorm')
	});
	this.blackMat = new THREE.MeshLambertMaterial({color: 0x000000});
	this.model = this.createBody();
	this.model.position.y = 0;
	this.model.scale.x = 0.35;
	this.model.scale.y = 0.35;
	this.model.scale.z = 0.35;
	this.model.rotation.x = Math.PI/6;

	var neck = this.createJoint(0);
	neck.name = 'neck';
	neck.position.z = -1;
	neck.rotation.x = -Math.PI/6;
	this.model.add(neck);

	var head = this.createDiamond([0.5, 0.5, 0.5], this.flyMat);
	head.position.y = -0.25;
	neck.add(head);

	var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), this.eyeMat);
	eye1.position.x = -0.2;
	eye1.position.y = 0.17;
	eye1.position.z = -0.17;
	eye1.scale.z = 0.5;
	eye1.rotation.x = Math.PI/3;
	eye1.rotation.y = Math.PI/4;
	head.add(eye1);

	var eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), this.eyeMat);
	eye2.position.x = 0.2;
	eye2.position.y = 0.17;
	eye2.position.z = -0.17;
	eye2.scale.z = 0.5;
	eye2.rotation.x = Math.PI/3;
	eye2.rotation.y = -Math.PI/4;
	head.add(eye2);

	var abo = this.createJoint(0);
	abo.name = 'abdomen';
	abo.position.y = 0.25;
	abo.position.z = 0.15;
	abo.rotation.x = Math.PI/5;
	this.model.add(abo);

	var abdo = this.createDiamond([0.6, 0.6, 0.75], this.flyMat);
	abdo.position.z = 1;
	abo.add(abdo);


	var wing1 = this.createJoint(0);
	wing1.name = 'wing1';
	wing1.position.z = -0.5;
	wing1.position.x = -0.25;
	wing1.position.y = 0.25;
	wing1.rotation.x = -Math.PI/6;
	wing1.rotation.y = -Math.PI/8;
	wing1.rotation.z = Math.PI/12;
	this.model.add(wing1);

	var wing1_1 = this.createWing(this.blackMat);
	wing1_1.position.z = 0.5;
	wing1.add(wing1_1);

	var wing2 = this.createJoint(0);
	wing2.name = 'wing2';
	wing2.position.z = -0.5;
	wing2.position.x = 0.25;
	wing2.position.y = 0.25;
	wing2.rotation.x = -Math.PI/6;
	wing2.rotation.y = Math.PI/8;
	wing2.rotation.z = -Math.PI/12;
	this.model.add(wing2);

	var wing2_1 = this.createWing(this.blackMat);
	wing2_1.position.z = 0.5;
	wing2.add(wing2_1);



	var leg1 = this.createLeg();
	leg1.name = 'leg1';
	leg1.position.x = -0.5;
	leg1.position.z = -0.5;
	this.model.add(leg1);

	var leg2 = this.createLeg();
	leg2.name = 'leg2';
	leg2.position.x = -0.5;
	leg2.position.z = 0;
	leg2.rotation.z = Math.PI/12;
	this.model.add(leg2);

	var leg3 = this.createLeg();
	leg3.name = 'leg3';
	leg3.position.x = -0.5;
	leg3.position.z = 0.5;
	leg3.rotation.z = Math.PI/8;
	this.model.add(leg3);

	var leg4 = this.createLeg(true);
	leg4.name = 'leg4';
	leg4.position.x = 0.5;
	leg4.position.z = -0.5;
	leg4.rotation.y = Math.PI;
	this.model.add(leg4);

	var leg5 = this.createLeg(true);
	leg5.name = 'leg5';
	leg5.position.x = 0.5;
	leg5.position.z = 0;
	leg5.rotation.y = Math.PI;
	leg5.rotation.z = Math.PI/12;
	this.model.add(leg5);

	var leg6 = this.createLeg(true);
	leg6.name = 'leg6';
	leg6.position.x = 0.5;
	leg6.position.z = 0.5;
	leg6.rotation.y = Math.PI;
	leg6.rotation.z = Math.PI/8;
	this.model.add(leg6);

	var asd = new THREE.Object3D();
	this.model.name = 'model';
	asd.add(this.model);
	this.model = asd;
	// this.model = this.createBody();
}

Actor.Fly.prototype.stillAction = function(dt){
	this.lastMoveTime += dt;
	this.interpPercent += dt;
	if(this.interpPercent > 1){
		this.interpPercent = 0;
	}
	this.idleAnim();
	if(this.lastMoveTime > 1){
		var rand = Math.random()*6;
		if(rand < 4 && this.lastMoveSuccess){
			this.lastMoveSuccess = this.setMove(this.forward, 1);
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

Actor.Fly.prototype.createLeg = function(rotate){
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

	var upperLeg = this.createDiamond([0.3, 0.15, 0.15], this.flyMat);
	upperLeg.position.x = -0.3;
	hip.add(upperLeg);

	var knee = this.createJoint(0);
	knee.name = 'knee';
	knee.position.x = -0.6;
	knee.rotation.z = Math.PI/3;
	hip.add(knee);

	var lowerLeg = this.createDiamond([0.3, 0.15, 0.15], this.flyMat);
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

Actor.Fly.prototype.createWing = function(mat){
	var geo = new THREE.Geometry();
	var mat = mat || new THREE.MeshLambertMaterial({color: 0x800000});

	geo.vertices.push(new THREE.Vector3(0.75, 0, 0.75));
	geo.vertices.push(new THREE.Vector3(-0.75, 0, 0.75));
	geo.vertices.push(new THREE.Vector3(0, 0.1, 0));
	geo.vertices.push(new THREE.Vector3(0, -0.1, 0));
	geo.vertices.push(new THREE.Vector3(0, 0, 1.5));
	geo.vertices.push(new THREE.Vector3(0, 0, -0.5));

	geo.faces.push(new THREE.Face3(0, 2, 4));
	geo.faces.push(new THREE.Face3(0, 4, 3));
	geo.faces.push(new THREE.Face3(0, 3, 5));
	geo.faces.push(new THREE.Face3(0, 5, 2));

	geo.faces.push(new THREE.Face3(1, 2, 5));
	geo.faces.push(new THREE.Face3(1, 5, 3));
	geo.faces.push(new THREE.Face3(1, 3, 4));
	geo.faces.push(new THREE.Face3(1, 4, 2));

	var uva = new THREE.Vector2(0, 0);
	var uvb = new THREE.Vector2(0, 1);
	var uvc = new THREE.Vector2(1, 1);
	var uvd = new THREE.Vector2(1, 0);

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under

	geo.computeFaceNormals();

	var diamond = new THREE.Mesh(geo, mat);
	return diamond;
},

Actor.Fly.prototype.createBody = function(){
	var geo = new THREE.Geometry();

	geo.vertices.push(new THREE.Vector3(0, -1, 0));
	geo.vertices.push(new THREE.Vector3(0.5, -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, -0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, -0.5, 0.5));

	geo.vertices.push(new THREE.Vector3(0.5, 0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, 0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, 0.5, 0));
	geo.vertices.push(new THREE.Vector3(0, 0.5, 0.5));
	
	geo.vertices.push(new THREE.Vector3(0, 1, 0));

	geo.faces.push(new THREE.Face3(0, 1, 4));
	geo.faces.push(new THREE.Face3(0, 2, 1));
	geo.faces.push(new THREE.Face3(0, 3, 2));
	geo.faces.push(new THREE.Face3(0, 4, 3));

	geo.faces.push(new THREE.Face3(1, 2, 5));
	geo.faces.push(new THREE.Face3(5, 2, 6));
	geo.faces.push(new THREE.Face3(2, 3, 6));
	geo.faces.push(new THREE.Face3(6, 3, 7));

	geo.faces.push(new THREE.Face3(3, 4, 7));
	geo.faces.push(new THREE.Face3(7, 4, 8));
	geo.faces.push(new THREE.Face3(4, 1, 8));
	geo.faces.push(new THREE.Face3(8, 1, 5));


	geo.faces.push(new THREE.Face3(8, 5, 9));
	geo.faces.push(new THREE.Face3(5, 6, 9));
	geo.faces.push(new THREE.Face3(6, 7, 9));
	geo.faces.push(new THREE.Face3(7, 8, 9));

	geo.computeFaceNormals();

	var uva = new THREE.Vector2(0, 0);
	var uvb = new THREE.Vector2(0, 1);
	var uvc = new THREE.Vector2(1, 1);
	var uvd = new THREE.Vector2(1, 0);

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under
	geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under

	var mesh = new THREE.Mesh(geo, this.flyMat);
	mesh.rotation.x = Math.PI/2;
	var parent = new THREE.Object3D();
	parent.add(mesh);
	parent.name = 'body';
	return parent;
}

Actor.Fly.prototype.idleAnim = function(){
	this.model.getObjectByName('neck').rotation.z = this.interpolator([0, 0.3, 0.4, 0.5, 0.6, 1], [0, 0, -0.1, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('abdomen').rotation.x = Math.PI/5 + this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, 0, -0.05, 0, 0], this.interpPercent);

	this.model.getObjectByName('leg1').rotation.z =              this.interpolator([0, 0.2, 0.3, 0.4, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg2').rotation.z = Math.PI/12 + this.interpolator([0, 0.4, 0.5, 0.6, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg3').rotation.z = Math.PI/8 +  this.interpolator([0, 0.6, 0.7, 0.8, 1], [0, 0, 0.1, 0, 0], this.interpPercent);

	this.model.getObjectByName('leg4').rotation.z =              this.interpolator([0, 0.2, 0.3, 0.4, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg5').rotation.z = Math.PI/12 + this.interpolator([0, 0.4, 0.5, 0.6, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg6').rotation.z = Math.PI/8 +  this.interpolator([0, 0.6, 0.7, 0.8, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
}

Actor.Fly.prototype.attackAnim = function(){
	this.model.getObjectByName('model').rotation.x = Math.PI/6 + this.interpolator([0, 0.2, 0.6, 1], [0, -0.15, 0.25, 0], this.interpPercent);
	this.model.getObjectByName('model').position.z = this.interpolator([0, 0.2, 0.6, 1], [0, -0.25, -0.75, 0], this.interpPercent);
		
	this.model.getObjectByName('leg1').rotation.z =              this.interpolator([0, 0.2, 0.4, 0.6, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg2').rotation.z = Math.PI/12 + this.interpolator([0, 0.3, 0.5, 0.7, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg3').rotation.z = Math.PI/8 +  this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);

	this.model.getObjectByName('leg4').rotation.z =              this.interpolator([0, 0.2, 0.4, 0.6, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg5').rotation.z = Math.PI/12 + this.interpolator([0, 0.3, 0.5, 0.7, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.model.getObjectByName('leg6').rotation.z = Math.PI/8 +  this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
}

Actor.Fly.prototype.dieAnim = function(){
	this.model.getObjectByName('model').rotation.x = this.interpolator([0, 0.5, 1], [Math.PI/6, Math.PI, Math.PI], this.interpPercent);
	this.model.getObjectByName('leg1').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.model.getObjectByName('leg2').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.model.getObjectByName('leg3').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.model.getObjectByName('leg4').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.model.getObjectByName('leg5').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.model.getObjectByName('leg6').rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);

	var self = this;
	this.model.traverse(function(joint){
		if(joint.name == 'knee'){
			joint.rotation.z = Math.PI/3 + self.interpolator([0, 1], [0, 0.15], self.interpPercent);
		}
		else if(joint.name == 'ankle'){
			joint.rotation.z = -Math.PI/5 + self.interpolator([0, 1], [0, 3*Math.PI/5], self.interpPercent);
		}
		else if(joint.name == 'hip1' || joint.name == 'hip2'){
			joint.rotation.x = 0;//Math.PI/6;
		}
	});

	this.model.getObjectByName('neck').rotation.x = this.interpolator([0, 1], [-Math.PI/6, 0], this.interpPercent);
	this.model.getObjectByName('abdomen').rotation.x = Math.PI/5 + this.interpolator([0, 1], [0, -0.15], this.interpPercent);
	
	this.model.getObjectByName('wing1').rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);
	this.model.getObjectByName('wing2').rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);

	this.model.position.y = this.interpolator([0, 0.5, 1], [this.prevHeight, -0.85, -0.85], this.interpPercent);
	this.model.rotation.y = this.model.rotation.y += 0.005;
}

function GameController(){
	var worldVars = {
		length: 10,
		width: 10
	}

	textures.setOptions(worldVars);
	textures.generate();

	var world = new World(worldVars);
	world.createWorld();
	scene.add(world.World());

	this.player = player = new Actor.Player({
		controls:{
			left: keys.a,
			right: keys.d,
			up: keys.w,
			down: keys.s,
			rotateLeft: keys.q,
			rotateRight: keys.e
		},
		worldVars: worldVars,
		isAlive: true
	});
	this.player.init();

	this.enemies = [];
	this.enemies[0] = new Actor.Fly();
	this.enemies[0].init();

	this.enemies[1] = new Actor.Ant();
	this.enemies[1].init();

	for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].reset();
		var x = Math.floor(Math.random()*worldVars.width);
		var z = Math.floor(Math.random()*worldVars.length);
		while(!world.canMove(x, z)){
			x = Math.floor(Math.random()*worldVars.width);
			z = Math.floor(Math.random()*worldVars.length);
		}
		this.enemies[i].setPosition(x, z);
		/*if(world.canMove(x, z)){
			for(var j = i; j < this.enemies.length; j++){
				// var pos = this.enemies[i].spacesOccupied();
			}
		}*/
	}

	var hud = new Hud();
	
	var gameState = "setup";

	this.reset = function(){
		world.reset();
		scene.remove(world.World());
		world.createWorld();
		scene.add(world.World());

		player.reset();
		hud.update();
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].reset();
			var x = Math.floor(Math.random()*worldVars.width);
			var z = Math.floor(Math.random()*worldVars.length);
			while(!world.canMove(x, z)){
				x = Math.floor(Math.random()*worldVars.width);
				z = Math.floor(Math.random()*worldVars.length);
			}
			this.enemies[i].setPosition(x, z);
			/*if(world.canMove(x, z)){
				for(var j = i; j < this.enemies.length; j++){
					// var pos = this.enemies[i].spacesOccupied();
				}
			}*/
		}
		gameState = 'setup';
	}
	// this.reset();
	this.start = function(){
		gameState = "playing";
		hud.update();
	}

	this.update = function(dt){
		// hud.updateText(gameState);
		switch(gameState){
			case "setup":
				if(keysDown[32]){
					gameState = "playing";
				}
				break;
			case "playing":
				if(keysDown[keys.r]){
					this.reset();
				}
				this.player.update(dt);

				world.update(dt);

				var anyLeft = false;
				for(var i = 0; i < this.enemies.length; i++){
					this.enemies[i].update(dt);
					if(this.enemies[i].isAlive()){
						anyLeft = true;
					}
				}

				if(!anyLeft){
					console.log('wonned');
					//game is over
					/*if(keysDown[82]){
						this.reset();
						gameState = "setup";
					}*/
				}

				break;
			case "over":
			case "lost":
			case "won":
				if(keysDown[82]){
					this.reset();
					gameState = "setup";
				}
				break;
		}
	}

	this.canMove = function(target, object, forwards){
		var x = target.x;
		var z = target.z;
		if(world.canMove(x/2, z/2)){
			//check for player collision
			if(object != player){
				var pos = player.spacesOccupied();
				if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
					//enemy attacking player
					if(forwards){
						player.takeDamage();
						hud.update();
						return 'attack';
					}
					return 'blocked';
				}
			}

			//check for any monster collisions;
			for(var i = 0; i < this.enemies.length; i++){
				if(object != this.enemies[i]){
					var pos = this.enemies[i].spacesOccupied();
					if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
						if(object == player){
							if(this.enemies[i].isAlive()){
								if(forwards){
									// player attacking enemy;
									this.enemies[i].takeDamage();
									return 'attack';
								}
								return 'blocked';
							}
							else{
								return 'move';
							}
						}
						return false;
					}
				}
			}
			return 'move';
		}
		return 'blocked';
	}
}

function Hud(params){
	var self = this;
	var health;

	this.initHud = function(){
		health = document.getElementById('healthHud');
	}

	this.update = function(){
		health.innerHTML = gameController.player.getHealth();
	}

	this.initHud();
}

var keys = {
	up: 38,
	down: 40,
	left: 37,
	right: 39,
	w: 87,
	s: 83,
	a: 65,
	d: 68,
	z: 68,
	r: 82,
	q: 81,
	e: 69
}

var keysDown = new Array();

document.addEventListener('keydown', function(event) {
	keysDown[event.keyCode] = true;
	
	// console.log(event.keyCode);
	if(event.keyCode == 90){
		$('canvas').toggleClass('hided');
	}
});

document.addEventListener('keyup', function(event) {
	keysDown[event.keyCode] = false;
});

window.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};


function Loader(params){
	var models = {};
	var images = {};
	var jsonloader = new THREE.JSONLoader();
	var loadingCount = 0;
	var loadedCount = 0;

	// jsonloader.load("models/test.js", modelToScene);

	/*loadModel('fence');
	loadModel('woodfence');
	loadModel('tombstone1');
	loadModel('tombstone2');
	loadModel('hay');
	loadModel('player');

	loadImage('tombstone2');
	loadImage('grass');
	loadImage('wood');*/
	loadImage('dust', true);
	loadImage('newspaper', true);

	function loadModel(name){
		loadingCount ++;
		//load a model and add it to the model object
		jsonloader.load('../models/' + name, function(geometry, materials){
			loadedCount ++;
			var mat = new THREE.MeshLambertMaterial({color:0xffffff});
			geometry.computeTangents();
			models[name] = new THREE.Mesh(geometry, mat);
			// models[name].rotation.x = Math.PI/2;
		});
	}

	function loadImage(name, asTexture){
		loadingCount ++;
		var image = document.createElement('img');
		image.src = '../images/' + name + '.png';
		image.onload = function(){
			images[name] = image;

			if(asTexture){
				textures.addTexture(name, image);
			}
			loadedCount ++;
		}
	}

	this.getModel = function(name){
		if(models[name])
			return models[name].clone();
		return new THREE.Object3D();
	}

	this.getImage = function(name){
		if(images[name])
			return images[name];
		console.log("Image not found.");
		return new Image();
	}

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
}


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

function Textures(params){
	var textures = {};
	var textureSettings = {};
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = canvas.height = 512;

	this.generate = function(){
		console.log("Generating Textures...");
		var frame = CLARITY.ctx.createImageData(canvas.width, canvas.height);
		
		var cloud = new CLARITY.Cloud({red:255, green:255, blue:255}).process(frame);
		cloud = new CLARITY.Blur({}).process(cloud);
		var icloud = new CLARITY.Invert({}).process(cloud);
		generateTexture('cloud', cloud);
		generateTexture('wall', cloud);
		generateTexture('dirtCeil', cloud);

		var cloudNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(cloud);
		generateTexture('wallNorm', cloudNorm);

		/*var green = new CLARITY.FillRGB({red: 0, green: 150, blue: 0}).process(frame);
		green = new CLARITY.Multiply().process([cloud, green]);
		var brown = new CLARITY.FillRGB({red: 88, green: 62, blue: 44}).process(frame);
		brown = new CLARITY.Multiply().process([icloud, brown]);
		var grass = new CLARITY.Blend({ratio:0.75}).process([green, brown]);
		grass = new CLARITY.hsvShifter({lightness:2}).process(grass);
		generateTexture('grass', grass);
		generateTexture('dirt', brown);*/

		/*brown = new CLARITY.FillRGB({red: 87, green: 39, blue: 0}).process(frame);
		brown = new CLARITY.Multiply().process([icloud, brown]);
		generateTexture('dirtPath', brown);*/

		/*var tilesNorm = new CLARITY.Brickulate({horizontalSegs:8, verticalSegs: 8, grooveSize: 2}).process(frame);
		brown = new CLARITY.FillRGB({red: 40, green: 40, blue: 40}).process(frame);
		var moss = new CLARITY.FillRGB({red: 0, green: 150, blue: 0}).process(frame);
		moss = new CLARITY.Multiply().process([cloud, moss]);
		var tiles = new CLARITY.Puzzler({horizontalSegs:8, verticalSegs: 8}).process(cloud);
		// tiles = new CLARITY.AddSub().process([tiles, moss]);
		tiles = new CLARITY.AddSub({subtractive:true}).process([tiles, tilesNorm]);
		tiles = new CLARITY.AddSub({}).process([tiles, brown]);
		generateTexture('tiles', tiles);

		tilesNorm = new CLARITY.Brickulate({horizontalSegs:8, verticalSegs: 8, grooveSize: 2}).process(frame);
		tilesNorm = new CLARITY.Invert().process(tilesNorm);
		tilesNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(tilesNorm);
		tilesNorm = new CLARITY.NormalFlip({green: true}).process(tilesNorm);
		tilesNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(tilesNorm);
		tilesNorm = new CLARITY.Blur({radius:1}).process(tilesNorm);
		generateTexture('tilesNorm', tilesNorm);*/

		var noiseNorm = new CLARITY.FillRGB({red: 128, green: 128, blue: 255}).process(frame);
		noiseNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(noiseNorm);
		noiseNorm = new CLARITY.Blur({radius:2}).process(noiseNorm);
		generateTexture('noiseNorm', noiseNorm);
		generateTexture('dirtCeilNorm', noiseNorm);

		/*ctx.drawImage(loader.getImage('dust'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		generateTexture('dust', frame);*/

		/*ctx.drawImage(loader.getImage('tombstone2'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		var normal = new CLARITY.NormalGenerator({intensity: 0.01}).process(frame);
		normal = new CLARITY.Noise({intensity:30, monochromatic: false}).process(normal);
		generateTexture('tombstone2Norm', normal);


		var frame1, frame2;
		frame2 = new CLARITY.FillRGB({red: 208, green: 186, blue: 137}).process(frame);
		frame1 = new CLARITY.Blend().process([cloud, frame2]);

		frame2 = new CLARITY.FillRGB({red: 163, green: 133, blue: 87}).process(frame2);
		frame2 = new CLARITY.Blend().process([icloud, frame2]);

		ctx.drawImage(loader.getImage('grass'), 0, 0, canvas.width, canvas.height);
		yellow = new CLARITY.FillRGB({red: 208, green: 186, blue: 137}).process(frame);
		frame = ctx.getImageData(0,0,width,height);
		var hay = new CLARITY.Blend().process([frame, yellow]);
		// hay = new CLARITY.Multiply().process([cloud, hay]);
		// hay = new CLARITY.hsvShifter({value:3}).process(hay);
		generateTexture('hay', hay);

		ctx.drawImage(loader.getImage('grass'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		normal = new CLARITY.NormalGenerator({intensity: 0.02}).process(frame);
		normal = new CLARITY.Noise({intensity:30, monochromatic: false}).process(normal);
		generateTexture('hayNorm', normal);
		// normal = new CLARITY.NormalIntensity({intensity: 0.5}).process(normal);
		// generateTexture('hayNormBig', normal);


		ctx.drawImage(loader.getImage('wood'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		generateTexture('wood', frame);*/
		
		console.log("Textures Generated.");
	}

	function generateTexture(name, frame){
		ctx.putImageData(frame, 0, 0);
		
		var img = canvas.toDataURL('image/png');
		var imageSrc = document.createElement('img');

		// document.body.appendChild(imageSrc);

		imageSrc.src = img;

		textures[name] = new THREE.Texture();
		textures[name].image = imageSrc;
		if(textureSettings[name]){
			if(textureSettings[name].wrap){
				textures[name].wrapS = THREE.RepeatWrapping;
				textures[name].wrapT = THREE.RepeatWrapping;
				textures[name].repeat.x = textureSettings[name].x;
				textures[name].repeat.y = textureSettings[name].y;
			}
		}

		textures[name].needsUpdate = true;
		setTimeout(function(){
			textures[name].needsUpdate = true;
		}, 1000);
	}

	this.addTexture = function(name, image){
		textures[name] = new THREE.Texture();
		textures[name].image = image;

		if(textureSettings[name]){
			if(textureSettings[name].wrap){
				textures[name].wrapS = THREE.RepeatWrapping;
				textures[name].wrapT = THREE.RepeatWrapping;
				textures[name].repeat.x = textureSettings[name].x;
				textures[name].repeat.y = textureSettings[name].y;
			}
		}

		textures[name].needsUpdate = true;
	}

	this.getTexture = function(name){
		return textures[name];
	}

	// this.generate();

	this.setOptions = function(params){
		var params = params || {};
		canvas.width = canvas.height = params.resolution || 512;


		/*textureSettings['grass'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};
		textureSettings['hayNormBig'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};
		textureSettings['dirt'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};*/

		textureSettings['tiles'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};
		textureSettings['tilesNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		textureSettings['dirtCeil'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};
		textureSettings['dirtCeilNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		textureSettings['wall'] = {
			wrap: true,
			x: 1,
			y: 1
		};
		textureSettings['wallNorm'] = {
			wrap: true,
			x: 1,
			y: 1
		};
	}

}


function World(params){
	var world = new THREE.Object3D();
	var content = [];
	for(var i = 0; i < params.width+2; i++){
		content[i] = [];
	}
	var dustSystems = [];

	var params = params || {};
	var length = params.length || 100;
	var width = params.width || 20;

	var floorMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('dirtCeil'),
		normalMap: textures.getTexture('dirtCeilNorm')
	});
	var ceilMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('dirtCeil'),
		normalMap: textures.getTexture('dirtCeilNorm')
	});

	var wallMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('wall'),
		normalMap: textures.getTexture('noiseNorm')
	});

	var dustMaterial = new THREE.PointCloudMaterial({
		color: 0x743f00, 
		size: 0.1,
		map: textures.getTexture('dust'),
		blending: THREE.AdditiveBlending,
		transparent: true});

	this.reset = function(){
		content = [];
		for(var i = 0; i < params.width+2; i++){
			content[i] = [];
		}
		dustSystems = [];
	}

	this.update = function(dt){
		for(var i = 0; i < dustSystems.length; i++){
			dustSystems[i].position.y = Math.sin(clock.elapsedTime/10+dustSystems[i].offset);
		}
	}

	this.createWorld = function(){
		world = new THREE.Object3D();
		
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(params.width*2, params.length*2, params.width/10, params.length/10), floorMat);
		floor.rotation.x = -Math.PI/2;
		floor.position.x = params.width+1;
		floor.position.z = params.length+1;
		floor.position.y = -1;
		world.add(floor);

		var ceil = new THREE.Mesh(new THREE.PlaneBufferGeometry(params.width*2, params.length*2, params.width/5, params.length/5), ceilMat);
		ceil.rotation.x = Math.PI/2;
		ceil.position.x = params.width+1;
		ceil.position.z = params.length+1;
		ceil.position.y = 1;
		world.add(ceil);

		//add outside walls
		for(var i = 0; i < params.width+2; i++){
			for(var j = 0; j < params.length+2; j++){
				if(i == 0 || i == params.width || j == 0 || j == params.length+1){
					var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 1;
				}
			}
		}

		//add inside walls
		for(var i = 1; i < params.width+1; i+=2){
			for(var j = 1; j < params.length+1; j+=2){
				if(i == 1 && j == 1){
					continue;
				}
				var x = Math.floor(Math.random()*2);
				var y = Math.floor(Math.random()*2);

				var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
				wall.position.x = 2*(i + x);
				wall.position.z = 2*(j + y);
				world.add(wall);
				content[i+x][j+y] = 1;
			}
		}

		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*params.width*2, Math.random()*2-1, Math.random()*params.length*2));
			}

			dustSystems[j] = new THREE.PointCloud(dusts, dustMaterial);
			dustSystems[j].offset = Math.random()*Math.PI*2;
			world.add(dustSystems[j]);
		}
	}

	this.canMove = function(i, j){
		if(i < 0 || j < 0){
			return false;
		}
		if(!content[i][j]){
			return true;
		}
	}

	this.World = function(){
		return world;
	}
	// createWorld();
}
