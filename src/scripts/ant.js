LD32.Ant = function(params){
	LD32.Actor.call(this, params);
	this.lastMoveSuccess = true;

	this.takeDamageSound = 'ant_damage';
	this.dieSound = 'ant_die';
	this.hierarchy = {};
}

LD32.Ant.prototype = Object.create(LD32.Actor.prototype);

window.addEventListener('load', function(){
	LD32.Ant.bodymat = new THREE.MeshLambertMaterial({
		// metalness: 0.0,
		// roughness: 0.0,
		color: 0xA00000,
		map: LD32.textures.getTexture('cloud'),
	});
	LD32.Ant.eyemat = new THREE.MeshLambertMaterial({color: 0x000000});
});

LD32.Ant.prototype.initSelf = function(){
	this.idleTime = 1.25;
}
LD32.Ant.prototype.resetSelf = function(){
	this.model.traverse(function(joint){
		if(joint.name == 'knee'){
			joint.rotation.z = 2*Math.PI/3;
		}
		else if(joint.name == 'ankle'){
			joint.rotation.z = -Math.PI/3;
		}
	});
	this.hierarchy.leg1.rotation.z = 0;
	this.hierarchy.leg2.rotation.z = 0;
	this.hierarchy.leg3.rotation.z = 0;
	this.hierarchy.leg4.rotation.z = 0;
	this.hierarchy.leg5.rotation.z = 0;
	this.hierarchy.leg6.rotation.z = 0;
	this.hierarchy.neck.rotation.x = 0;
}

LD32.Ant.prototype.createModel = function(){
	this.model = this.createBody();
	this.model.position.y = -0.75;
	this.model.scale.x = 0.35;
	this.model.scale.y = 0.35;
	this.model.scale.z = 0.35;

	var neck = this.createJoint(0);
	neck.name = 'neck';
	this.hierarchy.neck = neck;
	neck.position.z = -1;
	this.model.add(neck);

	var head = this.createJoint(0);
	var headMesh = this.createDiamond([0.5, 0.5, 0.5], LD32.Ant.bodymat);
	head.position.z = -0.25;
	neck.add(head);
	head.add(headMesh);

	var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), LD32.Ant.eyemat);
	eye1.position.x = -0.15;
	eye1.position.y = 0.15;
	eye1.position.z = -0.15;
	head.add(eye1);

	var eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), LD32.Ant.eyemat);
	eye1.position.x = 0.15;
	eye1.position.y = 0.15;
	eye1.position.z = -0.15;
	head.add(eye1);

	var abdomen = this.createJoint(0);
	abdomen.name = 'abdomen';
	this.hierarchy.abdomen = abdomen;
	abdomen.position.z = 1;
	abdomen.rotation.x = -Math.PI/6;
	this.model.add(abdomen);

	var abdo = this.createDiamond([1, 1, 1], LD32.Ant.bodymat);
	abdo.position.z = 1;
	abdomen.add(abdo);

	var mandy1 = this.createJoint(0);
	mandy1.name = 'mandy1';
	this.hierarchy.mandy1 = mandy1;
	mandy1.position.x = 0.5;
	mandy1.rotation.y = -Math.PI/6;
	head.add(mandy1);
	var mandy1_1 = this.createDiamond([0.15, 0.15, 0.3], LD32.Ant.bodymat);
	mandy1_1.position.z = -0.3;
	mandy1.add(mandy1_1);
	var mandy1_2 = this.createJoint(0);
	mandy1_2.name = 'mandy1_2';
	this.hierarchy.mandy1_2 = mandy1_2;
	mandy1_2.rotation.y = Math.PI/3;
	mandy1_2.position.z = -0.6;
	mandy1.add(mandy1_2);
	var mandy1_3 = this.createDiamond([0.15, 0.15, 0.3], LD32.Ant.bodymat);
	mandy1_3.position.z = -0.3;
	mandy1_2 .add(mandy1_3);

	var mandy2 = this.createJoint(0);
	mandy2.name = 'mandy2';
	this.hierarchy.mandy2 = mandy2;
	mandy2.rotation.y = Math.PI/6;
	mandy2.position.x = -0.5;
	head.add(mandy2);
	var mandy2_1 = this.createDiamond([0.15, 0.15, 0.3], LD32.Ant.bodymat);
	mandy2_1.position.z = -0.3;
	mandy2.add(mandy2_1);
	var mandy2_2 = this.createJoint(0);
	mandy2_2.name = 'mandy2_2';
	this.hierarchy.mandy2_2 = mandy2_2;
	mandy2_2.rotation.y = -Math.PI/3;
	mandy2_2.position.z = -0.6;
	mandy2.add(mandy2_2);
	var mandy2_3 = this.createDiamond([0.15, 0.15, 0.3], LD32.Ant.bodymat);
	mandy2_3.position.z = -0.3;
	mandy2_2 .add(mandy2_3);

	var leg1 = this.createLeg();
	leg1.name = 'leg1';
	this.hierarchy.leg1 = leg1;
	leg1.position.x = -0.5;
	leg1.position.z = -0.5;
	this.model.add(leg1);

	var leg2 = this.createLeg();
	leg2.name = 'leg2';
	this.hierarchy.leg2 = leg2;
	leg2.position.x = -0.5;
	leg2.position.z = 0;
	this.model.add(leg2);

	var leg3 = this.createLeg();
	leg3.name = 'leg3';
	this.hierarchy.leg3 = leg3;
	leg3.position.x = -0.5;
	leg3.position.z = 0.5;
	this.model.add(leg3);

	var leg4 = this.createLeg();
	leg4.name = 'leg4';
	this.hierarchy.leg4 = leg4;
	leg4.position.x = 0.5;
	leg4.position.z = -0.5;
	this.model.add(leg4);

	var leg5 = this.createLeg();
	leg5.name = 'leg5';
	this.hierarchy.leg5 = leg5;
	leg5.position.x = 0.5;
	leg5.position.z = 0;
	this.model.add(leg5);

	var leg6 = this.createLeg();
	leg6.name = 'leg6';
	this.hierarchy.leg6 = leg6;
	leg6.position.x = 0.5;
	leg6.position.z = 0.5;
	this.model.add(leg6);
}

LD32.Ant.prototype.stillAction = function(dt){
	this.lastMoveTime += dt;
	this.interpPercent += dt;
	if(this.interpPercent > 1){
		this.interpPercent = 0;
	}
	this.idleAnim();
	if(this.lastMoveTime > this.idleTime){
		var rand = Math.random()*8;
		var direction = LD32.gameController.player.model.position.clone().sub(this.model.position);
		direction.y = 0;
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

LD32.Ant.prototype.createLeg = function(){
	var hip = this.createJoint(0);
	hip.rotation.z = -Math.PI/3;

	var upperLeg = this.createDiamond([0.3, 0.15, 0.15], LD32.Ant.bodymat);
	upperLeg.position.x = -0.3;
	hip.add(upperLeg);

	var knee = this.createJoint(0);
	knee.name = 'knee';
	knee.position.x = -0.6;
	knee.rotation.z = 2*Math.PI/3;
	hip.add(knee);

	var lowerLeg = this.createDiamond([0.6, 0.15, 0.15], LD32.Ant.bodymat);
	lowerLeg.position.x = -0.6;
	knee.add(lowerLeg);

	var ankle = this.createJoint(0);
	ankle.name = 'ankle';
	ankle.position.x = -1.2;
	ankle.rotation.z = -Math.PI/3;
	knee.add(ankle);

	var foot = this.createDiamond([0.15, 0.1, 0.1], LD32.Ant.eyemat);
	foot.position.x = -0.15;
	ankle.add(foot);

	var parent = new THREE.Object3D();
	parent.add(hip);
	parent.name = 'hip';
	return parent;
}

LD32.Ant.prototype.createBody = function(){
	var geo = new THREE.Geometry();

	geo.vertices.push(new THREE.Vector3(0, -1, 0));

	geo.vertices.push(new THREE.Vector3(0.5,  -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0,    -0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
	geo.vertices.push(new THREE.Vector3(0,    -0.5, 0.5));

	geo.vertices.push(new THREE.Vector3(0.5,  0.5, 0));
	geo.vertices.push(new THREE.Vector3(0,    0.5, -0.5));
	geo.vertices.push(new THREE.Vector3(-0.5, 0.5, 0));
	geo.vertices.push(new THREE.Vector3(0,    0.5, 0.5));

	geo.vertices.push(new THREE.Vector3(0, 1, 0));

	geo.faces.push(new THREE.Face3(0, 1, 4));
	geo.faces.push(new THREE.Face3(0, 2, 1));
	geo.faces.push(new THREE.Face3(0, 3, 2));
	geo.faces.push(new THREE.Face3(0, 4, 3));

	geo.faces.push(new THREE.Face3(1, 2, 6));
	geo.faces.push(new THREE.Face3(1, 6, 5));
	geo.faces.push(new THREE.Face3(2, 3, 7));
	geo.faces.push(new THREE.Face3(2, 7, 6));
	geo.faces.push(new THREE.Face3(3, 4, 8));
	geo.faces.push(new THREE.Face3(3, 8, 7));
	geo.faces.push(new THREE.Face3(4, 1, 5));
	geo.faces.push(new THREE.Face3(4, 5, 8));

	geo.faces.push(new THREE.Face3(8, 5, 9));
	geo.faces.push(new THREE.Face3(5, 6, 9));
	geo.faces.push(new THREE.Face3(6, 7, 9));
	geo.faces.push(new THREE.Face3(7, 8, 9));

	geo.computeFaceNormals();

	var uva = new THREE.Vector2(0, 0);
	var uvb = new THREE.Vector2(0, 1);
	var uvc = new THREE.Vector2(1, 1);
	var uvd = new THREE.Vector2(1, 0);
	var uve = new THREE.Vector2(0.5, 0.5);

	geo.faceVertexUvs[ 0 ].push( [ uve, uva, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uve, uvb, uva ] );
	geo.faceVertexUvs[ 0 ].push( [ uve, uva, uvb ] );
	geo.faceVertexUvs[ 0 ].push( [ uve, uvb, uva ] );

	geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvc, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uvd, uvc ] );

	geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc ] );
	geo.faceVertexUvs[ 0 ].push( [ uva, uvc, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
	geo.faceVertexUvs[ 0 ].push( [ uvb, uvd, uvc ] );

	geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );
	geo.faceVertexUvs[ 0 ].push( [ uvd, uvc, uve ] );
	geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );
	geo.faceVertexUvs[ 0 ].push( [ uvd, uvc, uve ] );

	var buffer = new THREE.BufferGeometry();
	buffer = buffer.fromGeometry(geo);

	var mesh = new THREE.Mesh(buffer, LD32.Ant.bodymat);
	mesh.rotation.x = Math.PI/2;
	var parent = new THREE.Object3D();
	parent.add(mesh);
	parent.name = 'body';
	return parent;
}

LD32.Ant.prototype.idleAnim = function(){
	this.hierarchy.neck.rotation.z = this.interpolator([0, 0.3, 0.4, 0.5, 0.6, 1], [0, 0, -0.1, 0.1, 0, 0], this.interpPercent);
	this.hierarchy.abdomen.rotation.x = -Math.PI/6 + this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, 0, -0.05, 0, 0], this.interpPercent);
}

LD32.Ant.prototype.walkAnim = function(){
	this.hierarchy.leg1.rotation.y = -Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
	this.hierarchy.leg2.rotation.y = this.interpolator([0, 0.5, 1], [0, 0.3, 0], this.interpPercent);
	this.hierarchy.leg3.rotation.y = Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);

	this.hierarchy.leg4.rotation.y = Math.PI + Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
	this.hierarchy.leg5.rotation.y = Math.PI + this.interpolator([0, 0.5, 1], [0, 0.3, 0], this.interpPercent);
	this.hierarchy.leg6.rotation.y = Math.PI + -Math.PI/8 + this.interpolator([0, 0.5, 1], [0, -0.3, 0], this.interpPercent);
}

LD32.Ant.prototype.walkFailAnim = function(){
	this.walkAnim();
}

LD32.Ant.prototype.rotateAnim = function(){
	this.walkAnim();
}

LD32.Ant.prototype.attackAnim = function(){
	this.hierarchy.mandy1.rotation.y = -Math.PI/6 + this.interpolator([0, 0.33, 0.66, 1], [0, -0.25, 0.5, 0], this.interpPercent);
	this.hierarchy.mandy2.rotation.y = Math.PI/6 + this.interpolator([0, 0.33, 0.66, 1], [0, 0.25, -0.5, 0], this.interpPercent);
	this.walkAnim();
}

LD32.Ant.prototype.dieAnim = function(){
	this.hierarchy.leg1.rotation.z = this.interpolator([0, 1], [0, 0.8], this.interpPercent);
	this.hierarchy.leg2.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg3.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg5.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg6.rotation.z = this.hierarchy.leg1.rotation.z;

	var self = this;
	this.model.traverse(function(joint){
		if(joint.name == 'knee'){
			joint.rotation.z = 2*Math.PI/3 + self.interpolator([0, 1], [0, 0.65], self.interpPercent);
		}
		else if(joint.name == 'ankle'){
			joint.rotation.z = -Math.PI/3 + self.interpolator([0, 1], [0, Math.PI], self.interpPercent);
		}
	});

	this.hierarchy.neck.rotation.x = this.interpolator([0, 1], [0, -0.5], this.interpPercent);
	this.hierarchy.abdomen.rotation.x = this.interpolator([0, 1], [-Math.PI/6, 0.15], this.interpPercent);

	this.hierarchy.mandy1.rotation.y = -Math.PI/6 + this.interpolator([0, 1], [0, 0.5], this.interpPercent);
	this.hierarchy.mandy2.rotation.y = Math.PI/6 + this.interpolator([0, 1], [0, -0.5], this.interpPercent);
	this.hierarchy.mandy1_2.rotation.y = Math.PI/3 + this.interpolator([0, 1], [0, 0.5], this.interpPercent);
	this.hierarchy.mandy2_2.rotation.y = -Math.PI/3 + this.interpolator([0, 1], [0, -0.5], this.interpPercent);

	this.model.position.y = this.interpolator([0, 1], [-0.75, -0.78], this.interpPercent);
	this.model.rotation.y += 0.005;
}