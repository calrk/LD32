
var width=100;
var height=100;

var scene;
var sceneHUD;
var renderer;
var effect;
var gameController;
var textures;
var sounds;
var loader;
var shaderLoader;
var stats;

var clock;

var doc = window.document;
var docEl = doc.documentElement;
var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

var hammertime = new Hammer(docEl);
var noSleep = new NoSleep();

hammertime.get('pinch').set({ enable: true });
hammertime.on('pinchout', function(ev) {
	noSleep.enable();
	requestFullScreen.call(document.documentElement);
});
hammertime.on('pinchin', function(ev) {
	noSleep.disable();
	cancelFullScreen.call(document);
});

var socket = io.connect('https://server.clarklavery.com', {
	'connect timeout': 5000,
	secure: true
});
var p2p = new P2P(socket);

socket.on('connected', function(){
	console.log("Connected.");
});

/*p2p.on('ready', function(){
	console.log('asd')
	p2p.usePeerConnection = true;
	p2p.emit('peer-obj', { peerId: peerId });
});*/

var action = undefined;
p2p.on('peer-msg', function(data){
	console.log(data);
	if(data.action == 'pinchin'){
		// cancelFullScreen.call(document);
	}
	else if(data.action == 'pinchout'){
		startGame();
		// requestFullScreen.call(document.documentElement);
	}
	else{
		action = data.action;
	}
});

p2p.on('go-private', function () {
	goPrivate();
})

function goPrivate(){
	p2p.useSockets = false;
}

function init(){
	width = $(window).width();
	height = $(window).height()-70;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.1, 10 );
	sceneHUD = new THREE.Scene();

	var canvas = document.getElementById('canvas');
	renderer = new THREE.WebGLRenderer({antialias:true, canvas: canvas});
	effect = new THREE.StereoEffect(renderer);
	
	renderer.setSize(width, height);
	renderer.setClearColor(0x888888, 0);
	// renderer.shadowMapEnabled = true;

	loader = new Loader();
	shaderLoader = new Shader();
	stats = new Stats();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);

	clock = new THREE.Clock()
	clock.start();
	
	textures = new Textures();
	sounds = new Sounds();

	load();
	console.log("Loading...");
}

function load(){
	if(!loader.ready() || !sounds.ready()/* || !textures.ready()*/){
		requestAnimationFrame(load);
		return;
	}
	console.log("Loaded.");

	$('#startButton').removeAttr('disabled');
	$('#startButton')[0].value = 'Start';

	gameController = new GameController();

	resize();
	render();
}

function render(){
	// console.log('rendereing');
	requestAnimationFrame(render);
	stats.begin();
	var dt = clock.getDelta();

	gameController.update(dt);

	renderer.render(scene, gameController.player.camera);
	stats.end();
	// effect.render(scene, gameController.player.camera);
}

function startGame(){
	$('#start').css({
		display:'none',
	});
	// gameController.setGameState('playing');
	gameController.start();
}

function restartGame(){
	$('#start').css({
		display:'block',
	});
	$('#end').css({
		display:'none',
	});
	$('#lost').css({
		display:'none',
	});
	gameController.reset();
}

function endGame(asd){
	$('#'+asd).css({
		display:'block',
	});
	// gameController.setGameState('playing');
}

function changeVolume(elem){
	var vol = parseFloat(elem.value);
	sounds.setVolume(vol);
}

window.onload = function(){
	init();
	resize();
}

window.onresize = resize;
function resize(){
	console.log('resizing');
	width = $(window).width();
	height = $(window).height();//1022;//-70

	var top = '0px'//'70px';
	// $('#header').show();
	if(height <= 700){
		height = $(window).height();
		top = '0px';
		$('#header').hide();
	}

	$('#scene').css({
		width:width+'px', 
		height:height,
		top:top
	});

	$('#canvas').css({
		width:width+'px', 
		height:height,
		top:top
	});
	$('#hud').css({
		width:width+'px', 
		height:height,
		top:top
	});
	$('#start').css({
		width:width+'px', 
		height:height,
		top:top
	});
	$('#end').css({
		width:width+'px', 
		height:height,
		top:top
	});
	$('#lost').css({
		width:width+'px', 
		height:height,
		top:top
	});

	renderer.setSize(width, height);

	if(gameController){
		gameController.player.camera.aspect = width / height;
		gameController.player.camera.updateProjectionMatrix();
	}
}
