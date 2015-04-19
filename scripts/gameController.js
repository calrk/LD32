
function GameController(){
	var worldVars = {
		length: 10,
		width: 10
	}

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
	this.enemies[0] = new Actor.Fly();
	this.enemies[0].init();

	this.enemies[1] = new Actor.Ant();
	this.enemies[1].init();

	for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].reset();
		var x = Math.floor(Math.random()*worldVars.width);
		var z = Math.floor(Math.random()*worldVars.length);
		while(!world.canMove(x, z)){
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

	var hud = new Hud();
	
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
			var x = Math.floor(Math.random()*worldVars.width);
			var z = Math.floor(Math.random()*worldVars.length);
			while(!world.canMove(x, z)){
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
		hud.update();
	}

	this.update = function(dt){
		// hud.updateText(gameState);
		switch(gameState){
			case "setup":
				if(keysDown[32]){
					gameState = "playing";
				}
				break;
			case "playing":
				if(keysDown[keys.r]){
					this.reset();
				}
				this.player.update(dt);

				world.update(dt);

				var anyLeft = false;
				for(var i = 0; i < this.enemies.length; i++){
					this.enemies[i].update(dt);
					if(this.enemies[i].isAlive()){
						anyLeft = true;
					}
				}

				if(!anyLeft){
					console.log('wonned');
					//game is over
					/*if(keysDown[82]){
						this.reset();
						gameState = "setup";
					}*/
				}

				break;
			case "over":
			case "lost":
			case "won":
				if(keysDown[82]){
					this.reset();
					gameState = "setup";
				}
				break;
		}
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
									return 'attack';
								}
								return 'blocked';
							}
							else{
								return 'move';
							}
						}
						return false;
					}
				}
			}
			return 'move';
		}
		return 'blocked';
	}
}