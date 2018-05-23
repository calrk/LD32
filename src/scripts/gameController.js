
class GameController{

	constructor(params){
		params = params || {};
		this.scene = params.scene;

		this.worldVars = {
			length: 20,
			width: 20
		}

		this.atmosCooldown = 0;

		LD32.textures.setOptions(this.worldVars);
		// LD32.textures.generate();

		this.world = new World(this.worldVars);
		this.world.createWorld();
		this.scene.add(this.world.World());

		this.player = new Player({
			controls:{
				left: keys.a,
				right: keys.d,
				up: keys.w,
				down: keys.s,
				rotateLeft: keys.q,
				rotateRight: keys.e
			},
			gameController: this,
			scene: this.scene,
			worldVars: this.worldVars,
			isAlive: true
		});
		this.player.init();

		this.enemies = [];
		for(let i = 0; i < 10; i++){
			if(Math.random() < 0.5){
				this.enemies[i] = new Fly({gameController: this, scene: this.scene});
			}
			else{
				this.enemies[i] = new Ant({gameController: this, scene: this.scene});
			}
			this.enemies[i].init();
		}

		for(let i = 0; i < this.enemies.length; i++){
			this.enemies[i].reset();
			let x = Math.floor(Math.random()*this.worldVars.width-1)+1;
			let z = Math.floor(Math.random()*this.worldVars.length-1)+1;
			while(!this.world.canMove(x, z) || (x <= 2 && z <= 2)){
				x = Math.floor(Math.random()*this.worldVars.width);
				z = Math.floor(Math.random()*this.worldVars.length);
			}
			this.enemies[i].setPosition(x, z);
		}

		this.hud = new Hud();
		this.explosions = [];

		this.state = "setup";
	}

	reset(){
		this.world.reset();
		this.scene.remove(this.world.World());
		this.world.createWorld();
		this.scene.add(this.world.World());

		this.player.reset();
		this.hud.update();
		for(let i = 0; i < this.enemies.length; i++){
			this.enemies[i].reset();
			let x = Math.floor(Math.random()*this.worldVars.width-1)+1;
			let z = Math.floor(Math.random()*this.worldVars.length-1)+1;
			while(!this.world.canMove(x, z) || (x <= 2 && z <= 2)){
				x = Math.floor(Math.random()*this.worldVars.width);
				z = Math.floor(Math.random()*this.worldVars.length);
			}
			this.enemies[i].setPosition(x, z);
			/*if(world.canMove(x, z)){
				for(const j = i; j < this.enemies.length; j++){
					// const pos = this.enemies[i].spacesOccupied();
				}
			}*/
		}
		this.state = 'setup';
	}

	start(){
		this.state = "playing";
		this.hud.show();
		this.hud.update();
	}

	update(dt){
		// hud.updateText(this.state);
		this.world.update(dt);
		switch(this.state){
			case "setup":
				break;
			case "playing":
				this.player.update(dt);

				this.atmosCooldown += dt;
				if(this.atmosCooldown > 4){
					LD32.sounds.playAtmospheric();
					this.atmosCooldown = 0 - Math.random()*2;
				}

				for(let i = 0; i < this.enemies.length; i++){
					this.enemies[i].update(dt);
				}

				for(let i = 0; i < this.explosions.length; i++){
					if(this.explosions[i]){
						this.explosions[i].update(dt);
					}
				}

				if(this.getRemainingInsects() == 0){
					this.state = "won";
					LD32.end('end');
					this.hud.hide();
				}

				if(!this.player.isAlive()){
					this.state = "lost";
					LD32.end('lost');
					this.hud.hide();
				}
				break;
			case "over":
			case "lost":
			case "won":
				break;
		}
	}

	setState(){
		this.state = state;
	}

	getState(){
		return this.state;
	}

	spawnExplosion(position){
		const explosion = new Explosion({
			gameController: this,
			scene: this.scene,
			position: position
		});
	}

	removeExplosion(explosion){
		const index = this.explosions.indexOf(explosion);
		this.explosions[index] = undefined;
		this.explosions[index] = this.explosions[this.explosions.length-1];
		this.explosions.pop();
	}

	getRemainingInsects(){
		let count = 0;
		for(let i = 0; i < this.enemies.length; i++){
			if(this.enemies[i].isAlive()){
				count++;
			}
		}
		return count;
	}

	canMove(target, object, forwards){
		const x = target.x;
		const z = target.z;
		if(this.world.canMove(x/2, z/2)){
			//check for player collision
			if(object != this.player){
				let pos = this.player.spacesOccupied();
				if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
					//enemy attacking this.player
					if(forwards){
						this.player.takeDamage();
						this.hud.update();
						return 'attack';
					}
					return 'blocked';
				}
			}

			//check for any monster collisions;
			for(let i = 0; i < this.enemies.length; i++){
				if(object != this.enemies[i]){
					let pos = this.enemies[i].spacesOccupied();
					if((pos[0].x == x && pos[0].z == z) || (pos[1].x == x && pos[1].z == z)){
						if(object == this.player){
							if(this.enemies[i].isAlive()){
								if(forwards){
									// this.player attacking enemy;
									this.enemies[i].takeDamage();
									this.hud.update();
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

// export default GameController;