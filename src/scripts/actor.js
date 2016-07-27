LD32.Actor = function(params){
	params = params || {};
	this.gameController = params.gameController;
	this.scene = params.scene;
};

LD32.Actor.prototype = {
	model : new THREE.Object3D(),
	state : 'still',
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
	takeDamageSound : undefined,
	dieSound : undefined,

	init: function(){
		this.createModel();
		this.scene.add(this.model);

		this.initSelf();
		
		this.reset();
	},
	initSelf: function(){},

	takeDamage : function(damage){
		this.health -= damage || 10;
		this.gameController.spawnExplosion(this.model.position);
		var self = this;
		if(this.takeDamageSound){
			setTimeout(function(){
				LD32.sounds.play(self.takeDamageSound);
			}, 150);
		}
		this.takeDamageSelf();
	},
	takeDamageSelf: function(){},
	die : function(){
		var self = this;
		if(this.dieSound){
			setTimeout(function(){
				LD32.sounds.play(self.dieSound);
			}, 150);
		}
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
				this.die();
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
		if(length == 0){
			return new THREE.Object3D();
		}
		else{
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

			var axes = new THREE.Line(geometry, material, THREE.LineSegments);
			axes.name = "axes";

			return axes;
		}
	},

	createDiamond: function(size, mat){
		if(this.diamondMesh){
			var mesh = this.diamondMesh.clone();
			mesh.scale.set(size[0], size[1], size[2]);
			return mesh;
		}
		var geo = new THREE.Geometry();
		var mat = mat || new THREE.MeshLambertMaterial({color: 0x800000});

		geo.vertices.push(new THREE.Vector3(1, 0, 0));
		geo.vertices.push(new THREE.Vector3(-1, 0, 0));
		geo.vertices.push(new THREE.Vector3(0, 1, 0));
		geo.vertices.push(new THREE.Vector3(0, -1, 0));
		geo.vertices.push(new THREE.Vector3(0, 0, 1));
		geo.vertices.push(new THREE.Vector3(0, 0, -1));

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
		var uve = new THREE.Vector2(0.5, 0.5);

		geo.faceVertexUvs[ 0 ].push( [ uvc, uve, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uvb, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uve, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );

		geo.faceVertexUvs[ 0 ].push( [ uva, uve, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uve, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uve ] );

		geo.computeFaceNormals();

		var diamond = new THREE.Mesh(geo, mat);
		this.diamondMesh = diamond.clone();
		diamond.scale.set(size[0], size[1], size[2]);
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
