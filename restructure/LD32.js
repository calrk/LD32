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
			if(!self.rendering){
				self.rendering = true;
				self.loop();
			}
			else{
				self.action = 'swipeup';
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
