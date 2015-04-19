
function Hud(params){
	var self = this;
	var health;

	this.initHud = function(){
		health = document.getElementById('healthHud');
	}

	this.update = function(){
		health.innerHTML = gameController.player.getHealth();
	}

	this.initHud();
}
