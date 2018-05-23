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