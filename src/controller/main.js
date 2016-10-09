var doc = window.document;
var docEl = doc.documentElement;
var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
var noSleep = new NoSleep();

function init(){
	//set up socketio
	var socket = io.connect('https://server.clarklavery.com', {
		'connect timeout': 5000,
		secure: true
	});
	var p2p = new P2P(socket);

	socket.on('connected', function(){
		console.log("Connected.");
		socket.emit('insectsController');
		$('#text')[0].innerHTML = 'Connected to server.';
	});

	/*p2p.on('ready', function(){
		console.log('asd')
		p2p.usePeerConnection = true;
		p2p.emit('peer-obj', { peerId: peerId });
	});*/

	p2p.on('peer-gesture', function(data){
		console.log(data);

		if(data.action == 'set up'){
			p2p.emit('peer-gesture', { action: 'set up confirm' });
			$('#text')[0].innerHTML = 'Connected to game.';
		}
	});

	p2p.on('disconnect', function(){
		console.log('disconnect');
	});

	/*p2p.on('go-private', function () {
		goPrivate();
	})

	function goPrivate(){
		p2p.useSockets = false;
	}*/
	
	var options = {
		preventDefault: true
	};
	var hammertime = new Hammer(document.getElementById('control'), options);

	hammertime.get('pinch').set({ enable: true });
	hammertime.on('pinchout', function(ev) {
		p2p.emit('peer-gesture', { action: 'pinchout' });
		requestFullScreen.call(document.documentElement);
		noSleep.enable();
	});
	hammertime.on('pinchin', function(ev) {
		p2p.emit('peer-gesture', { action: 'pinchin' });
		cancelFullScreen.call(document);
		noSleep.disable();
	});

	hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
	hammertime.on('swipeleft', function(ev) {
		p2p.emit('peer-gesture', { action: 'swipeleft' });
		p2p.emit('peer-gesture', { action: 'pinchout' });
	});

	hammertime.on('swiperight', function(ev) {
		p2p.emit('peer-gesture', { action: 'swiperight' });
	});

	hammertime.on('swipeup', function(ev) {
		p2p.emit('peer-gesture', { action: 'swipeup' });
	});

	hammertime.on('swipedown', function(ev) {
		p2p.emit('peer-gesture', { action: 'swipedown' });
	});

	/*hammertime.on('tap', function(ev) {
		goPrivate();
		p2p.emit('go-private', true);
	});*/
}

window.onload = function(){
	init();
	resize();
}

window.onresize = resize;
function resize(){
	var width = $(window).width();
	var height = $(window).height();
}
