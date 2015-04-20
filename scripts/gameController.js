
function GameController(){
	var worldVars = {
		length: 20,
		width: 20
	}

	var atmosCooldown = 0;

	textures.setOptions(worldVars);
	textures.generate();

	var world = new World(worldVars);
	world.createWorld();
	scene.add(world.World());

	this.player = player = new Actor.Player({
		controls:{
			left: keys.a,
			right: keys.d,
			up: keys.w,
			down: keys.s,
			rotateLeft: keys.q,
			rotateRight: keys.e
		},
		worldVars: worldVars,
		isAlive: true
	});
	this.player.init();

	this.enemies = [];
	for(var i = 0; i < 10; i++){
		if(Math.random() < 0.5){
			this.enemies[i] = new Actor.Fly();
		}
		else{
			this.enemies[i] = new Actor.Ant();
		}
		this.enemies[i].init();
	}

	for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].reset();
		var x = Math.floor(Math.random()*worldVars.width-1)+1;
		var z = Math.floor(Math.random()*worldVars.length-1)+1;
		while(!world.canMove(x, z) || (x <= 2 && z <= 2)){
			x = Math.floor(Math.random()*worldVars.width);
			z = Math.floor(Math.random()*worldVars.length);
		}
		this.enemies[i].setPosition(x, z);
	}

	var hud = new Hud();
	this.explosions = [];
	
	var gameState = "setup";

	this.reset = function(){
		world.reset();
		scene.remove(world.World());
		world.createWorld();
		scene.add(world.World());

		player.reset();
		hud.update();
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].reset();
			var x = Math.floor(Math.random()*worldVars.width-1)+1;
			var z = Math.floor(Math.random()*worldVars.length-1)+1;
			while(!world.canMove(x, z) || (x <= 2 && z <= 2)){
				x = Math.floor(Math.random()*worldVars.width);
				z = Math.floor(Math.random()*worldVars.length);
			}
			this.enemies[i].setPosition(x, z);
			/*if(world.canMove(x, z)){
				for(var j = i; j < this.enemies.length; j++){
					// var pos = this.enemies[i].spacesOccupied();
				}
			}*/
		}
		gameState = 'setup';
	}
	// this.reset();
	this.start = function(){
		gameState = "playing";
		hud.show();
		hud.update();
	}

	this.update = function(dt){
		// hud.updateText(gameState);
		switch(gameState){
			case "setup":
				break;
			case "playing":
				this.player.update(dt);

				atmosCooldown += dt;
				if(atmosCooldown > 4){
					sounds.playAtmospheric();
					atmosCooldown = 0 - Math.random()*2;
				}

				world.update(dt);

				for(var i = 0; i < this.enemies.length; i++){
					this.enemies[i].update(dt);
				}

				for(var i = 0; i < this.explosions.length; i++){
					this.explosions[i].update(dt);
				}

				if(this.getRemainingInsects() == 0){
					gameState = "won";
					endGame('end');
					hud.hide();
				}

				if(!this.player.isAlive()){
					gameState = "lost";
					endGame('lost');
					hud.hide();
				}

				break;
			case "over":
			case "lost":
			case "won":
				break;
		}
	}

	this.setGameState = function(state){
		gameState = state;
	}

	this.spawnExplosion = function(position){
		var explosion = new Explosion({position: position});
		this.explosions.unshift(explosion);
	}

	this.removeExplosion = function(explosion){
		for(var i = 0; i < this.explosions.length; i++){
			var index = this.explosions.indexOf(explosion);
			this.explosions[index] = this.explosions[this.explosions.length-1];
			this.explosions.pop();
		}
	}

	this.getRemainingInsects = function(){
		var count = 0;
		for(var i = 0; i < this.enemies.length; i++){
			if(this.enemies[i].isAlive()){
				count++;
			}
		}
		return count;
	}

	this.canMove = function(target, object, forwards){
		var x = target.x;
		var z = target.z;
		if(world.canMove(x/2, z/2)){
			//check for player collision
			if(object != player){
				var pos = player.spacesOccupied();
				if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
					//enemy attacking player
					if(forwards){
						player.takeDamage();
						hud.update();
						return 'attack';
					}
					return 'blocked';
				}
			}

			//check for any monster collisions;
			for(var i = 0; i < this.enemies.length; i++){
				if(object != this.enemies[i]){
					var pos = this.enemies[i].spacesOccupied();
					if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
						if(object == player){
							if(this.enemies[i].isAlive()){
								if(forwards){
									// player attacking enemy;
									this.enemies[i].takeDamage();
									hud.update();
									return 'attack';
								}
								return 'blocked';
							}
							else{
								return 'move';
							}
						}
						return 'blocked';
					}
				}
			}
			return 'move';
		}
		return 'blocked';
	}
}