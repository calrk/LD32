
class Hud{

	constructor (params) {
		this.gameController = params.gameController;
		this.health = document.getElementById('healthHud');
		this.insects = document.getElementById('insectsHud');
	}

	show () {
		// $('#hud').show();
	}

	hide () {
		// $('#hud').hide();
	}

	update () {
		this.health.innerHTML = this.gameController.player.getHealth();
		this.insects.innerHTML = this.gameController.getRemainingInsects();
	}
}

module.exports = Hud;
