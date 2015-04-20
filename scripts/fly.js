Actor.Fly = function(params){
	Actor.call(this, params);
	this.lastMoveSuccess = 'blocked';
	this.prevHeight = 0;

	this.takeDamageSound = 'fly_damage';
	this.dieSound = 'fly_die';
}

Actor.Fly.prototype = Object.create(Actor.prototype);

Actor.Fly.prototype.initSelf = function(){
	this.idleTime = 0.75;
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
	if(this.lastMoveTime > this.idleTime){
		var rand = Math.random()*8;
		if(rand < 6 && this.lastMoveSuccess != 'blocked'){
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