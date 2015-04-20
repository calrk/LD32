
var width=100;
var height=100;

var scene;
var sceneHUD;
var renderer;
var gameController;
var textures;
var sounds;
var loader;

var clock;

function init(){
	width = $(window).width();
	height = $(window).height()-70;

	scene = new THREE.Scene();
	sceneHUD = new THREE.Scene();

	var canvas = document.getElementById('canvas');
	renderer = new THREE.WebGLRenderer({antialias:true, canvas: canvas});
	
	renderer.setSize(width, height);
	renderer.setClearColor(0x888888, 0);
	// renderer.shadowMapEnabled = true;

	loader = new Loader();

	clock = new THREE.Clock()
	clock.start();
	
	textures = new Textures();
	sounds = new Sounds();

	load();
	console.log("Loading...");
}

function load(){
	if(!loader.ready()){
		requestAnimationFrame(load);
		return;
	}
	console.log("Loaded.");

	gameController = new GameController();

	resize();
	render();

}

function render(){
	// console.log('rendereing');
	requestAnimationFrame(render);
	var dt = clock.getDelta();

	gameController.update(dt);

	renderer.render(scene, gameController.player.camera);
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

window.onload = function(){
	init();
	resize();
}

window.onresize = resize;
function resize(){
	console.log('resizing');
	width = $(window).width();
	height = $(window).height()-70;//1022;

	$('#scene').css({
		width:width+'px', 
		height:height,
		top:'70px'
	});

	$('#canvas').css({
		width:width+'px', 
		height:height,
		top:'70px'
	});
	$('#hud').css({
		width:width+'px', 
		height:height,
		top:'70px'
	});

	renderer.setSize(width, height);

	if(gameController){
		gameController.player.camera.aspect = width / height;
		gameController.player.camera.updateProjectionMatrix();
	}
}