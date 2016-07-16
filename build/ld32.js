var frames = 0;
var LD32 = {
	scene: undefined,
	renderer: undefined,
	effect: undefined,
	gameController: undefined,
	textures: undefined,
	sounds: undefined,
	loader: undefined,
	shaderLoader: undefined,
	stats: undefined,
	clock: undefined,
	hammertime: undefined,
	noSleep: undefined,
	socket: undefined,
	p2p: undefined,
	gloop: undefined,
	rendering: false,

	init: function(){
		var self = this;
		this.width = $(window).width();
		this.height = $(window).height();

		this.scene = new THREE.Scene();
		// this.scene2 = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2( 0x000000, 0.1, 10 );

		var canvas = document.getElementById('canvas');
		this.renderer = new THREE.WebGLRenderer({ antialias:true, canvas: canvas });
		this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0x000000, 1.0);
		// this.renderer.shadowMapEnabled = true;
		
		this.loader = new LD32.Loader();
		this.shaderLoader = new LD32.Shader();
		
		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);

		this.clock = new THREE.Clock();
		this.clock.start();
		
		this.textures = new LD32.Textures();
		this.sounds = new LD32.Sounds();

		var doc = window.document;
		var docEl = doc.documentElement;
		var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

		this.hammertime = new Hammer(docEl);
		this.noSleep = new NoSleep();

		this.hammertime.get('pinch').set({ enable: true });
		this.hammertime.on('pinchout', function(ev) {
			self.noSleep.enable();
			// self.effect = new THREE.StereoEffect(self.renderer);
			requestFullScreen.call(document.documentElement);
		});
		this.hammertime.on('pinchin', function(ev) {
			self.noSleep.disable();
			cancelFullScreen.call(document);
		});

		this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
		this.hammertime.on('swipeleft', function(ev) {
			self.action = 'swipeleft';
		});

		this.hammertime.on('swiperight', function(ev) {
			self.action = 'swiperight';
		});

		this.hammertime.on('swipeup', function(ev) {
			self.action = 'swipeup';
			if(!self.rendering){
				self.rendering = true;
				self.loop();
			}
		});

		this.hammertime.on('swipedown', function(ev) {
			self.action = 'swipedown';
		});

		this.socket = io.connect('https://server.clarklavery.com', {
			'connect timeout': 5000,
			secure: true
		});
		this.p2p = new P2P(this.socket);

		this.action = undefined;
		this.p2p.on('peer-msg', function(data){
			if(data.action == 'pinchin'){
				// cancelFullScreen.call(document);
			}
			else if(data.action == 'pinchout'){
				startGame();
				// requestFullScreen.call(document.documentElement);
			}
			else{
				self.action = data.action;
			}
		});

		this.p2p.on('go-private', function () {
			self.p2p.useSockets = false;
		});

		this.load();
		console.log("Loading...");
	},

	load: function(){
		var self = this;
		var intv = setInterval(function(){
			if(!self.loader.ready() || !self.sounds.ready()/* || !textures.ready()*/){
				return;
			}
			clearInterval(intv);
			console.log("Loaded.");

			$('#startButton').removeAttr('disabled');
			$('#startButton')[0].value = 'Start';

			self.gameController = new LD32.GameController({
				scene: self.scene
			});

			self.gloop = LD32.gameController.update.bind(LD32.gameController);
		}, 100);
	},

	loop: function(){
		// requestAnimationFrame(LD32.loop);
		setTimeout(LD32.loop, 32);
		LD32.stats.begin();
		var dt = LD32.clock.getDelta();

		LD32.gloop(dt);

		if(LD32.effect){
			LD32.effect.render(LD32.scene2, LD32.gameController.player.camera);
		}
		else{
			LD32.renderer.render(LD32.scene, LD32.gameController.player.camera);
		}
		LD32.stats.end();
	},

	start: function(){
		$('#start').css({
			display:'none',
		});
		this.gameController.start();
	},

	restart: function(){
		$('#start').css({
			display:'block',
		});
		$('#end').css({
			display:'none',
		});
		$('#lost').css({
			display:'none',
		});
		this.gameController.reset();
	},

	end: function(div){
		$('#'+div).css({
			display:'block',
		});
	},

	changeVolume: function(elem){
		var vol = parseFloat(elem.value);
		this.sounds.setVolume(vol);
	},

	resize: function(){
		console.log('resizing');
		this.width = $(window).width();
		this.height = $(window).height();//-70

		var top = '0px'//'70px';
		// $('#header').show();
		if(this.height <= 700){
			this.height = $(window).height();
			top = '0px';
			$('#header').hide();
		}

		$('#scene').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});

		$('#canvas').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});
		$('#hud').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});
		$('#start').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});
		$('#end').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});
		$('#lost').css({
			width: this.width+'px', 
			height: this.height,
			top:top
		});

		// this.renderer.setSize(this.width, this.height);

		if(this.gameController){
			this.gameController.player.camera.aspect = this.width / this.height;
			this.gameController.player.camera.updateProjectionMatrix();
		}
	}
}

window.addEventListener('load', function(){
	LD32.init();
	LD32.resize();
});
window.addEventListener('resize', function(){
	LD32.resize();
});

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

LD32.Ant = function(params){
	LD32.Actor.call(this, params);
	this.lastMoveSuccess = true;

	this.takeDamageSound = 'ant_damage';
	this.dieSound = 'ant_die';
	this.hierarchy = {};
}

LD32.Ant.prototype = Object.create(LD32.Actor.prototype);

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
	this.antMat = new THREE.MeshLambertMaterial({color: 0x800000});
	this.antMat = new THREE.MeshLambertMaterial({
		// shininess: 1, 
		color: 0xA00000, 
		// specular: 0x444444, 
		map: LD32.textures.getTexture('cloud'),
		// normalMap: LD32.textures.getTexture('noiseNorm')
	});
	this.blackMat = new THREE.MeshLambertMaterial({color: 0x000000});
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
	var headMesh = this.createDiamond([0.5, 0.5, 0.5], this.antMat);
	head.position.z = -0.25;
	neck.add(head);
	head.add(headMesh);

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

	var abdomen = this.createJoint(0);
	abdomen.name = 'abdomen';
	this.hierarchy.abdomen = abdomen;
	abdomen.position.z = 1;
	abdomen.rotation.x = -Math.PI/6;
	this.model.add(abdomen);

	var abdo = this.createDiamond([1, 1, 1], this.antMat);
	abdo.position.z = 1;
	abdomen.add(abdo);

	var mandy1 = this.createJoint(0);
	mandy1.name = 'mandy1';
	this.hierarchy.mandy1 = mandy1;
	mandy1.position.x = 0.5;
	mandy1.rotation.y = -Math.PI/6;
	head.add(mandy1);
	var mandy1_1 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy1_1.position.z = -0.3;
	mandy1.add(mandy1_1);
	var mandy1_2 = this.createJoint(0);
	mandy1_2.name = 'mandy1_2';
	this.hierarchy.mandy1_2 = mandy1_2;
	mandy1_2.rotation.y = Math.PI/3;
	mandy1_2.position.z = -0.6;
	mandy1.add(mandy1_2);
	var mandy1_3 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy1_3.position.z = -0.3;
	mandy1_2 .add(mandy1_3);

	var mandy2 = this.createJoint(0);
	mandy2.name = 'mandy2';
	this.hierarchy.mandy2 = mandy2;
	mandy2.rotation.y = Math.PI/6;
	mandy2.position.x = -0.5;
	head.add(mandy2);
	var mandy2_1 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
	mandy2_1.position.z = -0.3;
	mandy2.add(mandy2_1);
	var mandy2_2 = this.createJoint(0);
	mandy2_2.name = 'mandy2_2';
	this.hierarchy.mandy2_2 = mandy2_2;
	mandy2_2.rotation.y = -Math.PI/3;
	mandy2_2.position.z = -0.6;
	mandy2.add(mandy2_2);
	var mandy2_3 = this.createDiamond([0.15, 0.15, 0.3], this.antMat);
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

	var mesh = new THREE.Mesh(geo, this.antMat);
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

LD32.Explosion = function(params){
	params = params || {};
	this.position = params.position.clone() || new THREE.Vector3(0,0,0);
	this.scene = params.scene;
	this.gameController = params.gameController;

	this.pointCloud;
	this.lifeTime = 0;

	this.bloodMaterial = new THREE.PointsMaterial({
		color: 0xFF0000, 
		size: 0.1,
		map: LD32.textures.getTexture('blood'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	this.init();
}

LD32.Explosion.prototype.init = function(){
	var particles = new THREE.Geometry();

	for(var i = 0; i < 15; i++){
		particles.vertices.push(new THREE.Vector3(Math.random()*0.5-0.25, Math.random()*0.5-0.25, Math.random()*0.5-0.25));
	}

	this.pointCloud = new THREE.Points(particles, this.bloodMaterial);
	// pointCloud.sortParticles = true;
	this.pointCloud.position.copy(this.position);
	this.scene.add(this.pointCloud);
	this.gameController.explosions.push(this);
}

LD32.Explosion.prototype.update = function(dt){
	this.lifeTime += dt;
	for(var i = 0; i < this.pointCloud.geometry.vertices.length; i++){
		this.pointCloud.geometry.vertices[i].multiplyScalar(1.02);
		this.pointCloud.geometry.verticesNeedUpdate = true;
	}
	this.pointCloud.material.opacity -= dt;
	if(this.lifeTime > 2){
		this.destroy();
	}
}

LD32.Explosion.prototype.destroy = function(){
	this.scene.remove(this.pointCloud);
	this.gameController.removeExplosion(this);
}
LD32.Fly = function(params){
	LD32.Actor.call(this, params);
	this.lastMoveSuccess = 'blocked';
	this.prevHeight = 0;

	this.takeDamageSound = 'fly_damage';
	this.dieSound = 'fly_die';
	this.hierarchy = {};
}

LD32.Fly.prototype = Object.create(LD32.Actor.prototype);

LD32.Fly.prototype.initSelf = function(){
	this.idleTime = 0.75;
}

LD32.Fly.prototype.resetSelf = function(){
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
	this.hierarchy.leg1.rotation.z = 0;
	this.hierarchy.leg2.rotation.z = 0;
	this.hierarchy.leg3.rotation.z = 0;
	this.hierarchy.leg4.rotation.z = 0;
	this.hierarchy.leg5.rotation.z = 0;
	this.hierarchy.leg6.rotation.z = 0;
	this.hierarchy.neck.rotation.x = -Math.PI/6;
	this.model.rotation.y = 0;
	this.model.getObjectByName('model').rotation.x = Math.PI/6;
}


LD32.Fly.prototype.updateSelf = function(){
	this.model.position.y = Math.sin(LD32.clock.elapsedTime*2)/10;

	if(this.isAlive()){
		this.model.getObjectByName('wing1').rotation.x = -Math.PI/6 + Math.sin(LD32.clock.elapsedTime*40)/7;
		this.model.getObjectByName('wing2').rotation.x = -Math.PI/6 + Math.sin(LD32.clock.elapsedTime*40)/7;
	}
	else{
		prevHeight = this.model.position.y;
	}
}

LD32.Fly.prototype.createModel = function(){
	this.flyMat = new THREE.MeshLambertMaterial({color: 0x800000});
	this.flyMat = new THREE.MeshLambertMaterial({
		// shininess: 0.5, 
		color: 0x081b00, 
		// specular: 0x113700, 
		map: LD32.textures.getTexture('cloud'),
		// normalMap: LD32.textures.getTexture('noiseNorm')
	});
	this.eyeMat = new THREE.MeshPhongMaterial({
		shininess: 10, 
		color: 0x4c0000, 
		specular: 0x620000, 
		map: LD32.textures.getTexture('cloud'),
		normalMap: LD32.textures.getTexture('noiseNorm')
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
	this.hierarchy.neck = neck;
	neck.position.z = -1;
	neck.rotation.x = -Math.PI/6;
	this.model.add(neck);

	var head = this.createJoint(0);
	var headMesh = this.createDiamond([0.5, 0.5, 0.5], this.flyMat);
	head.position.z = -0.25;
	neck.add(head);
	head.add(headMesh);

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
	this.hierarchy.abdomen = abo;
	abo.position.y = 0.25;
	abo.position.z = 0.15;
	abo.rotation.x = Math.PI/5;
	this.model.add(abo);

	var abdo = this.createDiamond([0.6, 0.6, 0.75], this.flyMat);
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
	leg2.rotation.z = Math.PI/12;
	this.model.add(leg2);

	var leg3 = this.createLeg();
	leg3.name = 'leg3';
	this.hierarchy.leg3 = leg3;
	leg3.position.x = -0.5;
	leg3.position.z = 0.5;
	leg3.rotation.z = Math.PI/8;
	this.model.add(leg3);

	var leg4 = this.createLeg(true);
	leg4.name = 'leg4';
	this.hierarchy.leg4 = leg4;
	leg4.position.x = 0.5;
	leg4.position.z = -0.5;
	leg4.rotation.y = Math.PI;
	this.model.add(leg4);

	var leg5 = this.createLeg(true);
	leg5.name = 'leg5';
	this.hierarchy.leg5 = leg5;
	leg5.position.x = 0.5;
	leg5.position.z = 0;
	leg5.rotation.y = Math.PI;
	leg5.rotation.z = Math.PI/12;
	this.model.add(leg5);

	var leg6 = this.createLeg(true);
	leg6.name = 'leg6';
	this.hierarchy.leg6 = leg6;
	leg6.position.x = 0.5;
	leg6.position.z = 0.5;
	leg6.rotation.y = Math.PI;
	leg6.rotation.z = Math.PI/8;
	this.model.add(leg6);

	var asd = new THREE.Object3D();
	this.model.name = 'model';
	this.hierarchy.model = this.model;
	asd.add(this.model);
	this.model = asd;
	// this.model = this.createBody();
}

LD32.Fly.prototype.stillAction = function(dt){
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

LD32.Fly.prototype.createLeg = function(rotate){
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

LD32.Fly.prototype.createWing = function(mat){
	var geo = new THREE.Geometry();
	var mat = mat || new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.5});

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

LD32.Fly.prototype.createBody = function(){
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

	var mesh = new THREE.Mesh(geo, this.flyMat);
	mesh.rotation.x = Math.PI/2;
	var parent = new THREE.Object3D();
	parent.add(mesh);
	parent.name = 'body';
	return parent;
}

LD32.Fly.prototype.idleAnim = function(){
	this.hierarchy.neck.rotation.z = this.interpolator([0, 0.3, 0.4, 0.5, 0.6, 1], [0, 0, -0.1, 0.1, 0, 0], this.interpPercent);
	this.hierarchy.abdomen.rotation.x = Math.PI/5 + this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, 0, -0.05, 0, 0], this.interpPercent);

	this.hierarchy.leg1.rotation.z =              this.interpolator([0, 0.2, 0.3, 0.4, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.hierarchy.leg2.rotation.z = Math.PI/12 + this.interpolator([0, 0.4, 0.5, 0.6, 1], [0, 0, 0.1, 0, 0], this.interpPercent);
	this.hierarchy.leg3.rotation.z = Math.PI/8 +  this.interpolator([0, 0.6, 0.7, 0.8, 1], [0, 0, 0.1, 0, 0], this.interpPercent);

	this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg5.rotation.z = this.hierarchy.leg2.rotation.z;
	this.hierarchy.leg6.rotation.z = this.hierarchy.leg3.rotation.z;
}

LD32.Fly.prototype.attackAnim = function(){
	this.hierarchy.model.rotation.x = Math.PI/6 + this.interpolator([0, 0.2, 0.6, 1], [0, -0.15, 0.25, 0], this.interpPercent);
	this.hierarchy.model.position.z = this.interpolator([0, 0.2, 0.6, 1], [0, -0.25, -0.75, 0], this.interpPercent);
		
	this.hierarchy.leg1.rotation.z =              this.interpolator([0, 0.2, 0.4, 0.6, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.hierarchy.leg2.rotation.z = Math.PI/12 + this.interpolator([0, 0.3, 0.5, 0.7, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);
	this.hierarchy.leg3.rotation.z = Math.PI/8 +  this.interpolator([0, 0.4, 0.6, 0.8, 1], [0, -0.2, 0.5, 0, 0], this.interpPercent);

	this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg5.rotation.z = this.hierarchy.leg2.rotation.z;
	this.hierarchy.leg6.rotation.z = this.hierarchy.leg3.rotation.z;
}

LD32.Fly.prototype.dieAnim = function(){
	this.hierarchy.model.rotation.x = this.interpolator([0, 0.5, 1], [Math.PI/6, Math.PI, Math.PI], this.interpPercent);
	this.hierarchy.leg1.rotation.z = this.interpolator([0, 1], [0, 0.2], this.interpPercent);
	this.hierarchy.leg2.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg3.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg4.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg5.rotation.z = this.hierarchy.leg1.rotation.z;
	this.hierarchy.leg6.rotation.z = this.hierarchy.leg1.rotation.z;

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

	this.hierarchy.neck.rotation.x = this.interpolator([0, 1], [-Math.PI/6, 0], this.interpPercent);
	this.hierarchy.abdomen.rotation.x = Math.PI/5 + this.interpolator([0, 1], [0, -0.15], this.interpPercent);
	
	this.hierarchy.wing1.rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);
	this.hierarchy.wing2.rotation.x = -Math.PI/6 + this.interpolator([0, 1], [0, Math.PI/6], this.interpPercent);

	this.model.position.y = this.interpolator([0, 0.5, 1], [this.prevHeight, -0.85, -0.85], this.interpPercent);
	this.model.rotation.y = this.model.rotation.y += 0.005;
}

LD32.GameController = function(params){
	params = params || {};
	var scene = params.scene;

	var worldVars = {
		length: 20,
		width: 20
	}

	var atmosCooldown = 0;

	LD32.textures.setOptions(worldVars);
	LD32.textures.generate();

	var world = new LD32.World(worldVars);
	world.createWorld();
	scene.add(world.World());

	this.player = player = new LD32.Player({
		controls:{
			left: keys.a,
			right: keys.d,
			up: keys.w,
			down: keys.s,
			rotateLeft: keys.q,
			rotateRight: keys.e
		},
		gameController: this,
		scene: scene,
		worldVars: worldVars,
		isAlive: true
	});
	this.player.init();

	this.enemies = [];
	for(var i = 0; i < 10; i++){
		if(Math.random() < 0.5){
			this.enemies[i] = new LD32.Fly({gameController: this, scene: scene});
		}
		else{
			this.enemies[i] = new LD32.Ant({gameController: this, scene: scene});
		}
		this.enemies[i].init();
	}

	for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].reset();
		var x = Math.floor(Math.random()*worldVars.width-1)+1;
		var z = Math.floor(Math.random()*worldVars.length-1)+1;
		while(!world.canMove(x, z) || (x <= 2 && z <= 2)){
			x = Math.floor(Math.random()*worldVars.width);
			z = Math.floor(Math.random()*worldVars.length);
		}
		this.enemies[i].setPosition(x, z);
	}

	var hud = new LD32.Hud();
	this.explosions = [];
	
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
			var x = Math.floor(Math.random()*worldVars.width-1)+1;
			var z = Math.floor(Math.random()*worldVars.length-1)+1;
			while(!world.canMove(x, z) || (x <= 2 && z <= 2)){
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
		hud.show();
		hud.update();
	}

	this.update = function(dt){
		// hud.updateText(gameState);
		world.update(dt);
		switch(gameState){
			case "setup":
				break;
			case "playing":
				this.player.update(dt);

				atmosCooldown += dt;
				if(atmosCooldown > 4){
					LD32.sounds.playAtmospheric();
					atmosCooldown = 0 - Math.random()*2;
				}

				for(var i = 0; i < this.enemies.length; i++){
					this.enemies[i].update(dt);
				}

				for(var i = 0; i < this.explosions.length; i++){
					this.explosions[i].update(dt);
				}

				if(this.getRemainingInsects() == 0){
					gameState = "won";
					LD32.end('end');
					hud.hide();
				}

				if(!this.player.isAlive()){
					gameState = "lost";
					LD32.end('lost');
					hud.hide();
				}
				break;
			case "over":
			case "lost":
			case "won":
				break;
		}
	}

	this.setGameState = function(state){
		gameState = state;
	}

	this.spawnExplosion = function(position){
		var explosion = new LD32.Explosion({
			gameController: this,
			scene: scene,
			position: position
		});
		this.explosions.unshift(explosion);
	}

	this.removeExplosion = function(explosion){
		for(var i = 0; i < this.explosions.length; i++){
			var index = this.explosions.indexOf(explosion);
			this.explosions[index] = this.explosions[this.explosions.length-1];
			this.explosions.pop();
		}
	}

	this.getRemainingInsects = function(){
		var count = 0;
		for(var i = 0; i < this.enemies.length; i++){
			if(this.enemies[i].isAlive()){
				count++;
			}
		}
		return count;
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
									hud.update();
									return 'attack';
								}
								return 'blocked';
							}
							else{
								return 'move';
							}
						}
						return 'blocked';
					}
				}
			}
			return 'move';
		}
		return 'blocked';
	}
}

LD32.Hud = function(params){
	var self = this;
	var health;
	var insects;

	this.initHud = function(){
		health = document.getElementById('healthHud');
		insects = document.getElementById('insectsHud');
	}

	this.show = function(){
		// $('#hud').show();
	}

	this.hide = function(){
		$('#hud').hide();
	}

	this.update = function(){
		health.innerHTML = LD32.gameController.player.getHealth();
		insects.innerHTML = LD32.gameController.getRemainingInsects();
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
	else if(event.keyCode == 32){
		requestFullScreen.call(document.documentElement);
	}
});

document.addEventListener('keyup', function(event) {
	keysDown[event.keyCode] = false;
});

/*window.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};
*/

LD32.Loader = function(params){
	var models = {};
	var images = {};
	var objectloader = new THREE.ObjectLoader();
	// objectloader.texturePath = '../textures/';
	var loadingCount = 0;
	var loadedCount = 0;

	// objectloader.load("models/test.js", modelToScene);

	loadImage('dust', true);
	loadImage('firefly', true);
	loadImage('blood', true);
	loadImage('newspaper', true);
	loadImage('fire', true);

	loadModel('torch');

	function loadModel(name){
		// loadingCount ++;
		//load a model and add it to the model object
		objectloader.load('../models/' + name + '.json', function(object){
			loadedCount ++;
			// var material = new THREE.MultiMaterial( materials );
			models[name] = object;
			// models[name].rotation.x = Math.PI/2;
		}, function(e){//progress

		}, function(){//error
			loadedCount ++;
		});
	}

	function loadImage(name, asTexture){
		loadingCount ++;
		var image = document.createElement('img');
		image.src = '../images/' + name + '.png';
		image.onload = function(){
			images[name] = image;

			if(asTexture){
				LD32.textures.addTexture(name, image);
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

LD32.Shader = function(params){
	var shaders = {};
	loadingCount = 0;
	loadedCount = 0;

	loadShader('disp_vertex');
	loadShader('disp_fragment');
	loadShader('noise_vertex');
	loadShader('noise_fragment');
	// loadShader('fire_vertex');
	// loadShader('fire_fragment');

	function loadShader(file){
		loadingCount ++;

		var client = new XMLHttpRequest();
		client.open('GET', './shaders/' + file + '.js');
		client.onreadystatechange = function(e) {
			if(e.target.readyState == 4){
				loadedCount ++;
				shaders[file] = client.responseText;
				// console.log(shaders[file]);
			}
		}
		client.send();
	}

	this.getShader = function(name){
		if(shaders[name])
			return shaders[name];
		return '';
	}

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

LD32.Sounds = function(params){
	var self = this;
	var loadingCount = 0;
	var loadedCount = 0;
	this.sounds = {};
	this.loops = {};
	// this.soundSettings = {};

	this.audio = new AudioContext();
	this.audioGain = this.audio.createGain();
	this.volume = 0.15;
	// this.audioGain.gain.value = 0.15;
	this.audioCompressor = this.audio.createDynamicsCompressor();

	this.atmosAudio = new AudioContext();
	this.atmosGain = this.atmosAudio.createGain();
	this.atmosGainValue = 0.25;

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
	
	this.setVolume = function(val) {
		var val = val;
		if(val < 0){
			val = 0;
		}
		if(val > 2){
			val = 2;
		}
		this.volume = val;
	}
	
	this.play = function(sound) {
		if(!this.sounds[sound]){
			console.log("Sound not loaded: " + sound);
			return;
		}
		this.audioGain.gain.value = this.volume;
		var source = this.audio.createBufferSource();
		source.buffer = this.sounds[sound];
		source.connect(this.audioCompressor);
		this.audioCompressor.connect(this.audioGain);
		this.audioGain.connect(this.audio.destination);
		source.start(0);
	}

	this.playFootstep = function() {
		var rand = Math.floor(Math.random()*3.99)+1;
		this.play('dirt_step_'+rand);
	}

	this.loadSound = function(url) {
		loadingCount ++;
		var ctx = this;
		var request = new XMLHttpRequest();
		request.open('GET', './sounds/' + url + '.ogg', true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			ctx.audio.decodeAudioData(request.response, function(buffer) {
				ctx.sounds[url] = buffer;
			}, function (err){
				console.log(err);
			});
			loadedCount ++;
		}
		request.send();
	};

	this.playLoop = function(sound) {
		if(!this.sounds[sound]){
			console.log("Sound not loaded: " + sound);
			return;
		}
		if(this.loops[sound]){
			console.log("Sound already looping: " + sound);
			return;
		}
		var source = this.audio.createBufferSource();
		source.loop = true;
		source.buffer = this.sounds[sound];
		source.connect(this.audioGain);
		this.audioGain.connect(this.audio.destination);
		source.start(0);

		this.loops[sound] = source;
	}

	this.stopLoop = function(sound) {
		if(!this.loops[sound]){
			console.log("Sound not Playing: " + sound);
			return;
		}
		this.loops[sound].stop(0);
		delete this.loops[sound];
	}

	this.playAtmospheric = function() {
		var atmos = ['insect_1', 'insect_2', 'insect_3', 'insect_4'];
		var pos = Math.floor(Math.random()*atmos.length);

		if(!self.sounds[atmos[pos]]){
			console.log("Sound not loaded: " + sound);
			return;
		}

		self.atmosGain.gain.value = self.atmosGainValue*self.volume;

		var source = self.atmosAudio.createBufferSource();
		source.buffer = self.sounds[atmos[pos]];
		source.connect(self.atmosGain);
		self.atmosGain.connect(self.atmosAudio.destination);
		source.start(0);
	}

	this.loadSound('dirt_step_1');
	this.loadSound('dirt_step_2');
	this.loadSound('dirt_step_3');
	this.loadSound('dirt_step_4');
	this.loadSound('swing');
	this.loadSound('thud');
	this.loadSound('fly_damage');
	this.loadSound('fly_die');
	this.loadSound('ant_damage');
	this.loadSound('ant_die');
	this.loadSound('insect_1');
	this.loadSound('insect_2');
	this.loadSound('insect_3');
	this.loadSound('insect_4');
	this.loadSound('pain_1');
	this.loadSound('pain_2');
}


LD32.Textures = function(params){
	var textures = {};
	var textureSettings = {};
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = canvas.height = 128;
	var isReady = false;

	this.ready = function(){
		return isReady;
	}

	this.generate = function(){
		console.log("Generating Textures...");
		var frame = CLARITY.ctx.createImageData(canvas.width, canvas.height);
		
		var cloud = new CLARITY.Cloud({red:255, green:255, blue:255}).process(frame);
		// cloud = new CLARITY.Blur({}).process(cloud);
		var icloud = new CLARITY.Invert({}).process(cloud);
		generateTexture('cloud', cloud);
		generateTexture('wall', cloud);
		generateTexture('dirtCeil', cloud);

		var cloudNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(cloud);
		generateTexture('wallNorm', cloudNorm);

		var noiseNorm = new CLARITY.FillRGB({red: 128, green: 128, blue: 255}).process(frame);
		// noiseNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(noiseNorm);
		// noiseNorm = new CLARITY.Blur({radius:2}).process(noiseNorm);
		generateTexture('noiseNorm', noiseNorm);
		generateTexture('dirtCeilNorm', noiseNorm);

		console.log("Textures Generated.");
		isReady = true;
	}

	function generateTexture(name, frame){
		ctx.putImageData(frame, 0, 0);
		
		var img = canvas.toDataURL('image/png');
		var imageSrc = document.createElement('img');

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

	this.setOptions = function(params){
		var params = params || {};
		canvas.width = canvas.height = params.resolution || canvas.width || 512;

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

		/*textureSettings['dirtCeil'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};*/
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


LD32.World = function(params){
	var world = new THREE.Object3D();
	var content = [];
	for(var i = 0; i < params.width+2; i++){
		content[i] = [];
	}
	var dustSystems = [];
	var fireflies = [];
	var torches = [];
	var fireEmbers = undefined;

	var params = params || {};
	var length = params.length || 100;
	var width = params.width || 20;

	/*var floorMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: LD32.textures.getTexture('dirtCeil'),
		normalMap: LD32.textures.getTexture('dirtCeilNorm')
	});
	var ceilMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: LD32.textures.getTexture('dirtCeil'),
		normalMap: LD32.textures.getTexture('dirtCeilNorm')
	});*/

	var wallMat = new THREE.MeshLambertMaterial({
		// shininess: 1,
		color: 0xcb6e00, 
		// specular: 0x444444,
		map: LD32.textures.getTexture('wall'),
		// normalMap: LD32.textures.getTexture('noiseNorm')
	});
	var ceilMat = wallMat;
	var floorMat = wallMat;

	var dustMaterial = new THREE.PointsMaterial({
		color: 0x743f00, 
		size: 0.1,
		map: LD32.textures.getTexture('dust'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	var fireflyMaterial = new THREE.PointsMaterial({
		color: 0x00aadd, 
		size: 0.1,
		map: LD32.textures.getTexture('firefly'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	/*var fireEmberMaterial = new THREE.PointsMaterial({
		color: 0xff8800, 
		size: 0.01,
		map: LD32.textures.getTexture('firefly'),
		blending: THREE.AdditiveBlending,
		opacity: 0.5,
		transparent: true
	});*/

	/*var sceneRenderTarget = new THREE.Scene();
	var cameraOrtho = new THREE.OrthographicCamera(512 / - 2, 512 / 2, 512 / 2, 512 / - 2, -10000, 10000);
	cameraOrtho.position.z = 100;
	var quadTarget = new THREE.Mesh( new THREE.PlaneGeometry( 512, 512 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
	quadTarget.position.z = -500;
	sceneRenderTarget.add( quadTarget );

	var uniforms = {
		time:  { type: "f", value: 1.0 },
		uSpeed:  { type: "f", value: 1.0 },
		scale: { type: "v2", value: new THREE.Vector2( 1, 1 ) }
	};

	var noiseMaterial = new THREE.ShaderMaterial({
		uniforms:		uniforms,
		vertexShader:   LD32.shaderLoader.getShader('noise_vertex'),
		fragmentShader: LD32.shaderLoader.getShader('noise_fragment'),
		// lights: false
	});
	quadTarget.material = noiseMaterial;

	var noiseMap = new THREE.WebGLRenderTarget( 512, 512, {
		minFilter: THREE.LinearMipMapLinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	});*/

	var displacementUniforms = {
		time:  { type: "f", value: 1.0 },
		// tHeightMap:  { type: "t",  value: noiseMap.texture },
		uDisplacementBias: { type: "f", value: 0.09 },
		uDisplacementScale: { type: "f", value: 0.04 },
		uColor1: { type: "c", value: new THREE.Color( 0xffff00 ) },
		uColor2: { type: "c", value: new THREE.Color( 0xff8800 ) },
		uSmoke: { type: "f", value: 0.8 },
		uShapeBias: { type: "v2", value: new THREE.Vector2(0.23, 0.88) },
		uTurbulence: { type: "f", value: 5 }
	};

	var displacementMaterial = new THREE.ShaderMaterial({
		transparent:	true,
		uniforms:		displacementUniforms,
		vertexShader:	LD32.shaderLoader.getShader('disp_vertex'),
		fragmentShader: LD32.shaderLoader.getShader('disp_fragment'),
		// lights:			false
	});

	this.reset = function(){
		content = [];
		for(var i = 0; i < params.width+2; i++){
			content[i] = [];
		}
		dustSystems = [];
		fireflies = [];
		torches = [];
	}

	this.update = function(dt){
		for(var i = 0; i < dustSystems.length; i++){
			dustSystems[i].position.y = Math.sin(LD32.clock.elapsedTime/10+dustSystems[i].offset);
		}

		for(var i = 0; i < fireflies.length; i++){
			fireflies[i].light.intensity = Math.sin(LD32.clock.elapsedTime*4)*0.2+0.9;

			fireflies[i].geometry.vertices.forEach(function(vertex){
				vertex.x = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetx)*vertex.offsetxdist;
				vertex.y = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsety)*vertex.offsetydist;
				vertex.z = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetz)*vertex.offsetzdist;
			});
			fireflies[i].geometry.verticesNeedUpdate = true;
		}

		for(var i = 0; i < torches.length; i++){
			torches[i].light.intensity = Math.sin(LD32.clock.elapsedTime*16)*0.2+0.9;
		}

		/*fireEmbers.geometry.vertices.forEach(function(vertex){
			vertex.y += dt*0.5;
			vertex.x = vertex.initial.x+Math.sin(LD32.clock.elapsedTime*2+vertex.offsetxdist)/20;
			vertex.z = vertex.initial.z+Math.sin(LD32.clock.elapsedTime*2+vertex.offsetzdist)/20;
			if(vertex.y > 1.5){
				vertex.y = vertex.initial.y;
			}
		});
		fireEmbers.geometry.verticesNeedUpdate = true;*/

		displacementUniforms.time.value += dt*0.3;
		// uniforms.uSpeed.value += dt*3;
		// uniforms.time.value += dt*0.3;
		// LD32.renderer.clear();
		// LD32.renderer.render( sceneRenderTarget, cameraOrtho, noiseMap, true );
		
	}

	this.createWorld = function(){
		world = new THREE.Object3D();
		
		//add outside walls
		for(var i = 0; i < params.width+2; i++){
			for(var j = 0; j < params.length+2; j++){
				if(i == 0 || i == params.width+1 || j == 0 || j == params.length+1){
					var wall = this.createWall();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 1;
				}
				else{
					var wall = this.createEmpty();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 0;
				}
				// var val = simplex.noise3D(geometry.vertices[i].x/2, geometry.vertices[i].y/2, geometry.vertices[i].z/2);
			}
		}

		//add inside walls
		for(var i = 0; i < params.width+1; i+=2){
			for(var j = 0; j < params.length+1; j+=2){
				var x = Math.floor(Math.random()*2);
				var y = Math.floor(Math.random()*2);

				var type = Math.floor(Math.random()*3);
				var wall;
				if(type == 0){
					wall = this.createStalagtite();
				}
				else if(type == 1){
					wall = this.createStalagmite();
				}
				else{
					wall = this.createWall();
				}
				wall.position.x = 2*(i + x);
				wall.position.z = 2*(j + y);
				world.add(wall);
				content[i+x][j+y] = 1;
			}
		}

		//add dust particles
		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*params.width*2, Math.random()*2-1, Math.random()*params.length*2));
			}

			dustSystems[j] = new THREE.Points(dusts, dustMaterial);
			dustSystems[j].offset = Math.random()*Math.PI*2;
			world.add(dustSystems[j]);
		}

		//add fireflies
		for(var j = 0; j < 5; j++){
			var fireflyParticles = new THREE.Geometry();
			for(var i = 0; i < 10; i++){
				fireflyParticles.vertices.push(new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1));
				fireflyParticles.vertices[i].offsetx = Math.random()*100;
				fireflyParticles.vertices[i].offsety = Math.random()*100;
				fireflyParticles.vertices[i].offsetz = Math.random()*100;
				fireflyParticles.vertices[i].offsetxdist = Math.random()*2-1;
				fireflyParticles.vertices[i].offsetydist = Math.random()*2-1;
				fireflyParticles.vertices[i].offsetzdist = Math.random()*2-1;
			}
			var firefly = new THREE.Points(fireflyParticles, fireflyMaterial);

			firefly.position.x = Math.floor(Math.random()*params.width);
			firefly.position.z = Math.floor(Math.random()*params.length);
			while(!this.canMove(firefly.position.x, firefly.position.z)){
				firefly.position.x = Math.floor(Math.random()*params.width);
				firefly.position.z = Math.floor(Math.random()*params.length);
			}
			firefly.position.x *= 2;
			firefly.position.z *= 2;
			world.add(firefly);

			var light = new THREE.PointLight(0x00ddff, 0.5, 3);
			light.position.y = 0.5;
			firefly.add(light);
			firefly.light = light;
			fireflies.push(firefly);
		}

		//add torches
		// fireParticles = new THREE.Geometry();
		for(var j = 0; j < 5; j++){
			var torchHolder = new THREE.Object3D();
			var torch = LD32.loader.getModel('torch');

			torchHolder.position.x = Math.floor(Math.random()*params.width);
			torchHolder.position.z = Math.floor(Math.random()*params.length);
			while(!this.canMove(torchHolder.position.x, torchHolder.position.z)){
				torchHolder.position.x = Math.floor(Math.random()*params.width);
				torchHolder.position.z = Math.floor(Math.random()*params.length);
			}
			torchHolder.position.x *= 2;
			torchHolder.position.z *= 2;
			torchHolder.position.z += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.x += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.y = -0.25;
			torchHolder.rotation.y = Math.random()*Math.PI*2;

			torch.scale.set(0.15,0.25,0.15);

			world.add(torchHolder);
			torchHolder.add(torch);
			var light = new THREE.PointLight(0xff8800, 0.5, 3);
			light.position.y = 0.5;
			torchHolder.add(light);
			torchHolder.light = light;

			var fire = this.createFire();
			fire.position.x = -0.01;
			fire.position.y = 0.23;
			fire.position.z = -0.01;
			torchHolder.add(fire);

			/*for(var i = j*20; i < j*20+20; i++){
				fireParticles.vertices.push( new THREE.Vector3(
					torchHolder.position.x + Math.random()*0.15-0.126,
					torchHolder.position.y + 0.2,
					torchHolder.position.z + Math.random()*0.15-0.126)
				);
				fireParticles.vertices[i].initial = {};
				fireParticles.vertices[i].initial.x = fireParticles.vertices[i].x;
				fireParticles.vertices[i].initial.y = fireParticles.vertices[i].y;
				fireParticles.vertices[i].initial.z = fireParticles.vertices[i].z;
				
				fireParticles.vertices[i].y -= Math.random()*5;

				fireParticles.vertices[i].offsetxdist = Math.random()*4-2;
				// fireParticles.vertices[i].offsetydist = Math.random()*4-2;
				fireParticles.vertices[i].offsetzdist = Math.random()*4-2;
			}*/

			torches.push(torchHolder);
		}
		// fireEmbers = new THREE.Points(fireParticles, fireEmberMaterial);
		// world.add(fireEmbers);
	}

	this.createStalagmite = function(){
		var mergeGeometry = new THREE.Geometry();
		var scale = Math.random()*0.4+0.8;

		var mite = new THREE.Mesh(new THREE.ConeGeometry( 0.25*scale, 1.5*scale, 32), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.25*scale, 1.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.25*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.25*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.SphereGeometry( 1, 16, 16 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*0.5-0.25;
		mite.position.y = -1.75;
		mite.position.z = Math.random()*0.5-0.25;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		object = new THREE.Mesh(mergeGeometry, wallMat);
		object.rotation.y = Math.PI*Math.random()*2;
		return object;
	}

	this.createStalagtite = function(){
		var object = this.createStalagmite();
		object.rotation.x = Math.PI;

		var scale = Math.random()*0.2+0.9;
		var mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.5*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.75*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.75*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		return object;
	}

	this.createWall = function(){
		var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
		return wall;
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

	this.createFire = function(){
		var geometrySphere = new THREE.SphereGeometry( 0.1, 140, 100 );
		mesh = new THREE.Mesh(geometrySphere, displacementMaterial);
		mesh.scale.set(0.01,0.01,0.01);
		return mesh;
	}

	this.createEmpty = function(){
		var geo = new THREE.BufferGeometry();

		var vertexCount = 8;
		var vertices = new Float32Array(vertexCount * 3);
		vertices = Float32Array.from([
						 1, -1,  1,
						 1, -1, -1,
						-1, -1, -1,
						-1, -1,  1,
				
						 1, 1,  1,
						 1, 1, -1,
						-1, 1, -1,
						-1, 1,  1]);
		geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

		var indices = new Uint16Array(vertexCount * 3);
		indices = Uint16Array.from([
						0, 1, 2,
						0, 2, 3,
						4, 6, 5,
						4, 7, 6]);
		geo.setIndex(new THREE.BufferAttribute(indices, 1));

		var uvs = new Float32Array(vertexCount * 2);
		uvs = Float32Array.from([
						0, 0,
						0, 1,
						1, 1,
						1, 0,
						0, 0,
						0, 1,
						1, 1,
						1, 0]);
		geo.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

		geo.computeVertexNormals();
		var floor = new THREE.Mesh(geo, floorMat);
		return floor;
		/*for(var i = -4.5; i < 5.5; i++){
			for(var j = -4.5; j < 5.5; j++){
				geo.vertices.push(new THREE.Vector3(i, 0, j));
			}
		}
		for(var i = 1; i < 9; i++){
			for(var j = 1; j < 9; j++){
				var a = j + 11 * i;
				var b = j + 11 * ( i + 1 );
				var c = ( j + 1 ) + 11 * ( i + 1 );
				var d = ( j + 1 ) + 11 * i;

				geo.faces.push(new THREE.Face3(a, b, d));
			}
		}
		geo.computeFaceNormals();
		var floor = new THREE.Mesh(geo, floorMat);
		floor.position.y = -1;
		return floor;*/
		/*for(var i = 0; i < 10; i++){
			for(var j = 0; j < 10; j++){
				geo.vertices.push(new THREE.Vector3(i, 1, j));
				if(i > 1 && j > 1){
					var x = i*10;
					var y = x + j;
					geo.faces.push(new THREE.Face3(x, x+1, y));
					geo.faces.push(new THREE.Face3(x, y, y+1));
				}
			}
		}
		geo.computeFaceNormals();
		return new THREE.Mesh(geo, wallMat);*/
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 10, 10), floorMat);
		floor.position.y = -1;
		return floor;
	}

	/*this.createWall = function(){
		var geo = new THREE.BufferGeometry();

		var vertexCount = 8;
		var vertices = new Float32Array(vertexCount * 3);
		vertices = Float32Array.from([
						 1, -1,  1,
						 1, -1, -1,
						-1, -1, -1,
						-1, -1,  1,
				
						 1, 1,  1,
						 1, 1, -1,
						-1, 1, -1,
						-1, 1,  1]);
		geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

		var indices = new Uint16Array(vertexCount * 3);
		indices = Uint16Array.from([
						0, 1, 5,
						0, 5, 4,
						1, 2, 6,
						1, 6, 5,
						2, 3, 7,
						2, 7, 6,
						3, 0, 4,
						3, 4, 7]);
		geo.setIndex(new THREE.BufferAttribute(indices, 1));

		var uvs = new Float32Array(vertexCount * 2);
		uvs = Float32Array.from([
						0, 0, //0
						0, 1, //1
						0, 0, //2
						0, 1, //3

						1, 1, //4
						1, 0, //5
						1, 1, //6
						1, 0, //7
						]);
		geo.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

		geo.computeVertexNormals();
		var floor = new THREE.Mesh(geo, floorMat);
		return floor;
	}*/
}
