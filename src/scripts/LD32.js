// import GameController from 'gameController';

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

		this.loader = new ModelLoader();
		this.shaderLoader = new ShaderLoader();

		this.stats = new Stats();
		// this.stats.showPanel(0);
		// document.body.appendChild(this.stats.dom);

		this.clock = new THREE.Clock();
		this.clock.start();

		this.textures = new TextureLoader();
		this.sounds = new SoundLoader();
		this.geometry = new GeometryLoader();

		this.mode = 'desktop';

		var doc = window.document;
		var docEl = doc.documentElement;
		this.requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		this.cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

		this.hammertime = new Hammer(docEl);
		this.noSleep = new NoSleep();

		this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
		this.hammertime.on('swipeleft', ev => {
			this.action = 'swipeleft';
		});

		this.hammertime.on('swiperight', ev => {
			this.action = 'swiperight';
		});

		this.hammertime.on('swipeup', ev => {
			this.action = 'swipeup';
		});

		this.hammertime.on('swipedown', ev => {
			this.action = 'swipedown';
		});

		this.load();
		console.log("Loading...");
	},

	load: function(){
		var intv = setInterval(() => {
			if(!this.loader.ready() || !this.sounds.ready() || !this.textures.ready()){
				return;
			}
			clearInterval(intv);
			console.log("Loaded.");

			$('#playButt').show();

			this.gameController = new GameController({
				scene: this.scene
			});

			this.gloop = LD32.gameController.update.bind(LD32.gameController);
		}, 100);
	},

	loop: function(){
		// requestAnimationFrame(LD32.loop);
		setTimeout(LD32.loop, 32);
		LD32.stats.begin();
		var dt = LD32.clock.getDelta();

		LD32.gloop(dt);

		if(LD32.effect){
			LD32.effect.render(LD32.scene, LD32.gameController.player.camera);
		}
		else{
			LD32.renderer.render(LD32.scene, LD32.gameController.player.camera);
		}
		LD32.stats.end();
	},

	setMode: function(mode){
		$('#desktop').hide();
		$('#mobile').hide();
		$('#cardboard').hide();
		this.mode = mode;
		$('#' + this.mode).show();

		switch(this.mode){
			case 'desktop':
				$('#hud').show();
				this.requestFullScreen.call(document.documentElement);

				this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
				this.hammertime.get('pinch').set({ enable: false });
				break;
			case 'cardboard':
			case 'mobile':
				this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
				this.hammertime.get('pinch').set({ enable: true });
				this.hammertime.on('pinchout', ev => {
					this.noSleep.enable();
					this.requestFullScreen.call(document.documentElement);
				});
				this.hammertime.on('pinchin', ev => {
					this.noSleep.disable();
					this.cancelFullScreen.call(document);
				});
				break;
		}
	},

	start: function(){
		$('#start').css({
			display:'none',
		});
		this.gameController.start();
		this.loop();

		switch(this.mode){
			case 'desktop':
				$('#hud').show();
				this.requestFullScreen.call(document.documentElement);
				break;
			case 'cardboard':
				this.effect = new THREE.StereoEffect(this.renderer);
				// this.effect = new THREE.VREffect(this.renderer);
			case 'mobile':
				this.requestFullScreen.call(document.documentElement);
				this.noSleep.enable();
				break;
		}
	},

	setupSockets: function(){
		if(this.socket){
			return;
		}
		this.socket = io.connect('https://server.clarklavery.com', {
			'connect timeout': 5000,
			secure: true
		});

		this.socket.on('connected', () => {
			this.socket.emit('insectsGame');
			console.log(this.socket);
		});

		this.p2p = new P2P(this.socket);
		this.p2p.emit('peer-gesture', { action: 'set up'});

		this.action = undefined;

		this.p2p.on('peer-gesture', data => {
			console.log(data);

			if(data.action == 'set up confirm'){
				$('#connectionoff').hide();
				$('#connectionon').show();
			}
			else if(data.action == 'pinchin'){
				// cancelFullScreen.call(document);
			}
			else if(data.action == 'pinchout'){
				this.mode == 'cardboard';
				// start();
				// requestFullScreen.call(document.documentElement);
				if(this.gameController.getState() == 'lost' || this.gameController.getState() == 'won'){
					this.restart();
				}
				else if(this.gameController.getState() == 'setup'){
					this.start();
				}
			}
			else{
				this.action = data.action;
			}
		});

		this.p2p.on('go-private', () => {
			this.p2p.useSockets = false;
			console.log('go privates')
		});
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
		$('#hud').hide();
		this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
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

		if(this.renderer){
			this.renderer.setSize(this.width, this.height);
		}

		if(this.gameController){
			this.gameController.player.camera.aspect = this.width / this.height;
			this.gameController.player.camera.updateProjectionMatrix();
		}
	}
}

window.addEventListener('load', () => {
	LD32.init();
	LD32.resize();
});
window.addEventListener('resize', () => {
	LD32.resize();
});
