
LD32.Hud = function(params){
	var self = this;
	var health;
	var insects;

	this.initHud = function(){
		health = document.getElementById('healthHud');
		insects = document.getElementById('insectsHud');
	}

	this.show = function(){
		// $('#hud').show();
	}

	this.hide = function(){
		$('#hud').hide();
	}

	this.update = function(){
		health.innerHTML = LD32.gameController.player.getHealth();
		insects.innerHTML = LD32.gameController.getRemainingInsects();
	}

	this.initHud();
}
