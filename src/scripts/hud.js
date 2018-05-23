
class Hud{

	constructor () {
		this.health = document.getElementById('healthHud');
		this.insects = document.getElementById('insectsHud');
	}

	show () {
		// $('#hud').show();
	}

	hide () {
		$('#hud').hide();
	}

	update () {
		this.health.innerHTML = LD32.gameController.player.getHealth();
		this.insects.innerHTML = LD32.gameController.getRemainingInsects();
	}
}
