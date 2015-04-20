
function World(params){
	var world = new THREE.Object3D();
	var content = [];
	for(var i = 0; i < params.width+2; i++){
		content[i] = [];
	}
	var dustSystems = [];

	var params = params || {};
	var length = params.length || 100;
	var width = params.width || 20;

	var floorMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('dirtCeil'),
		normalMap: textures.getTexture('dirtCeilNorm')
	});
	var ceilMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('dirtCeil'),
		normalMap: textures.getTexture('dirtCeilNorm')
	});

	var wallMat = new THREE.MeshPhongMaterial({
		shininess: 1, 
		color: 0xcb6e00, 
		specular: 0x444444, 
		map: textures.getTexture('wall'),
		normalMap: textures.getTexture('noiseNorm')
	});

	var dustMaterial = new THREE.PointCloudMaterial({
		color: 0x743f00, 
		size: 0.1,
		map: textures.getTexture('dust'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	this.reset = function(){
		content = [];
		for(var i = 0; i < params.width+2; i++){
			content[i] = [];
		}
		dustSystems = [];
	}

	this.update = function(dt){
		for(var i = 0; i < dustSystems.length; i++){
			dustSystems[i].position.y = Math.sin(clock.elapsedTime/10+dustSystems[i].offset);
		}
	}

	this.createWorld = function(){
		world = new THREE.Object3D();
		
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(params.width*2, params.length*2, params.width/10, params.length/10), floorMat);
		floor.rotation.x = -Math.PI/2;
		floor.position.x = params.width+1;
		floor.position.z = params.length+1;
		floor.position.y = -1;
		world.add(floor);

		var ceil = new THREE.Mesh(new THREE.PlaneBufferGeometry(params.width*2, params.length*2, params.width/5, params.length/5), ceilMat);
		ceil.rotation.x = Math.PI/2;
		ceil.position.x = params.width+1;
		ceil.position.z = params.length+1;
		ceil.position.y = 1;
		world.add(ceil);

		//add outside walls
		for(var i = 0; i < params.width+2; i++){
			for(var j = 0; j < params.length+2; j++){
				if(i == 0 || i == params.width+1 || j == 0 || j == params.length+1){
					var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 1;
				}
			}
		}

		//add inside walls
		for(var i = 1; i < params.width+1; i+=2){
			for(var j = 1; j < params.length+1; j+=2){
				if(i == 1 && j == 1){
					continue;
				}
				var x = Math.floor(Math.random()*2);
				var y = Math.floor(Math.random()*2);

				var type = Math.floor(Math.random()*3);
				var wall;
				if(type == 0){
					wall = this.createStalagtite();
				}
				else if(type == 1){
					wall = this.createStalagmite();
				}
				else{
					wall = this.createWall();
				}
				// var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
				wall.position.x = 2*(i + x);
				wall.position.z = 2*(j + y);
				world.add(wall);
				content[i+x][j+y] = 1;
			}
		}

		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*params.width*2, Math.random()*2-1, Math.random()*params.length*2));
			}

			dustSystems[j] = new THREE.PointCloud(dusts, dustMaterial);
			dustSystems[j].offset = Math.random()*Math.PI*2;
			world.add(dustSystems[j]);
		}
	}

	this.createStalagmite = function(){
		var mergeGeometry = new THREE.Geometry();
		var scale = Math.random()*0.4+0.8;

		var mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.25*scale, 1.5*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.25*scale, 1.5*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.125*scale, 0.25*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.25*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.SphereGeometry( 1, 16, 16 ), wallMat);
		mite.position.x = Math.random()*0.5-0.25;
		mite.position.y = -1.75;
		mite.position.z = Math.random()*0.5-0.25;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		object = new THREE.Mesh(mergeGeometry, wallMat);
		object.rotation.y = Math.PI*Math.random()*2;
		return object;
	}

	this.createStalagtite = function(){
		var object = this.createStalagmite();
		object.rotation.x = Math.PI;

		var scale = Math.random()*0.2+0.9;
		var mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.5*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.125*scale, 0.75*scale, 32 ), wallMat);
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.75*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		return object;
	}

	this.createWall = function(){
		var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMat);
		return wall;
	}

	this.canMove = function(i, j){
		if(i < 0 || j < 0){
			return false;
		}
		if(!content[i][j]){
			return true;
		}
	}

	this.World = function(){
		return world;
	}
	// createWorld();
}
