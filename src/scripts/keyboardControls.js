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

document.addEventListener('keydown', event => {
	keysDown[event.keyCode] = true;

	// console.log(event.keyCode);
	if(event.keyCode == 90){
		$('canvas').toggleClass('hided');
	}
	else if(event.keyCode == 32){
		requestFullScreen.call(document.documentElement);
	}
});

document.addEventListener('keyup', event => {
	keysDown[event.keyCode] = false;
});

/*window.oncontextmenu = (event) => {
	event.preventDefault();
	event.stopPropagation();
	return false;
};
*/

class InputController{
	constructor(){
		var doc = window.document;
		var docEl = doc.documentElement;
		this.requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		this.cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

		this.hammertime = new Hammer(docEl);

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

		// Destop swipe
		/*this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
		this.hammertime.get('pinch').set({ enable: false });*/

		// Mobile controls
		this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
		this.hammertime.get('pinch').set({ enable: true });
		this.hammertime.on('pinchout', ev => {
			// this.noSleep.enable();
			this.requestFullScreen.call(document.documentElement);
		});
		this.hammertime.on('pinchin', ev => {
			// this.noSleep.disable();
			this.cancelFullScreen.call(document);
		});
	}
}


module.exports = {
	keys,
	keysDown,
	InputController: new InputController()
};