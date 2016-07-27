
LD32.World = function(params){
	var world = new THREE.Object3D();
	var content = [];
	for(var i = 0; i < params.width+2; i++){
		content[i] = [];
	}
	var dustSystems = [];
	var fireflies = [];
	var torches = [];
	var fireEmbers = undefined;

	var params = params || {};
	var length = params.length || 100;
	var width = params.width || 20;

	var wallMat = new THREE.MeshLambertMaterial({
		// shininess: 1,
		color: 0xcb6e00, 
		// specular: 0x444444,
		map: LD32.textures.getTexture('wall'),
		// normalMap: LD32.textures.getTexture('noiseNorm')
	});
	var ceilMat = wallMat;
	var floorMat = wallMat;

	var dustMaterial = new THREE.PointsMaterial({
		color: 0x743f00, 
		size: 0.1,
		map: LD32.textures.getTexture('dust'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	var fireflyMaterial = new THREE.PointsMaterial({
		color: 0x00aadd, 
		size: 0.1,
		map: LD32.textures.getTexture('firefly'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	var fireUniforms = {
		tHeightMap:  { type: "t",  value: LD32.textures.getTexture('cloud') },
		uColor: { type: "c", value: new THREE.Color( 0xff4800 ) },
		time: { type: "f", value: 0.0 },
	};

	var displacementMaterial = new THREE.ShaderMaterial({
		transparent:	true,
		uniforms: fireUniforms,
		vertexShader:	LD32.shaderLoader.getShader('fire_vertex'),
		fragmentShader: LD32.shaderLoader.getShader('fire_fragment')
	});

	this.reset = function(){
		content = [];
		for(var i = 0; i < params.width+2; i++){
			content[i] = [];
		}
		dustSystems = [];
		fireflies = [];
		torches = [];
	}

	this.update = function(dt){
		for(var i = 0; i < dustSystems.length; i++){
			dustSystems[i].position.y = Math.sin(LD32.clock.elapsedTime/10+dustSystems[i].offset);
		}

		for(var i = 0; i < fireflies.length; i++){
			fireflies[i].light.intensity = Math.sin(LD32.clock.elapsedTime*4)*0.2+0.9;

			fireflies[i].geometry.vertices.forEach(function(vertex){
				vertex.x = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetx)*vertex.offsetxdist;
				vertex.y = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsety)*vertex.offsetydist;
				vertex.z = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetz)*vertex.offsetzdist;
			});
			fireflies[i].geometry.verticesNeedUpdate = true;
		}

		for(var i = 0; i < torches.length; i++){
			torches[i].light.intensity = Math.sin(LD32.clock.elapsedTime*16)*0.2+0.9;
		}
		fireUniforms.time.value += dt;
	}

	this.createWorld = function(){
		world = new THREE.Object3D();
		
		//add outside walls
		for(var i = 0; i < params.width+2; i++){
			for(var j = 0; j < params.length+2; j++){
				if(i == 0 || i == params.width+1 || j == 0 || j == params.length+1){
					var wall = this.createWall();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 1;
				}
				else{
					var wall = this.createEmpty();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);
					content[i][j] = 0;
				}
				// var val = simplex.noise3D(geometry.vertices[i].x/2, geometry.vertices[i].y/2, geometry.vertices[i].z/2);
			}
		}

		//add inside walls
		for(var i = 0; i < params.width+1; i+=2){
			for(var j = 0; j < params.length+1; j+=2){
				if(i < 3 && j < 3){
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
				wall.position.x = 2*(i + x);
				wall.position.z = 2*(j + y);
				world.add(wall);
				content[i+x][j+y] = 1;
			}
		}

		//add dust particles
		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*params.width*2, Math.random()*2-1, Math.random()*params.length*2));
			}

			dustSystems[j] = new THREE.Points(dusts, dustMaterial);
			dustSystems[j].offset = Math.random()*Math.PI*2;
			world.add(dustSystems[j]);
		}

		//add fireflies
		for(var j = 0; j < 5; j++){
			var fireflyParticles = new THREE.Geometry();
			for(var i = 0; i < 10; i++){
				fireflyParticles.vertices.push(new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1));
				fireflyParticles.vertices[i].offsetx = Math.random()*100;
				fireflyParticles.vertices[i].offsety = Math.random()*100;
				fireflyParticles.vertices[i].offsetz = Math.random()*100;
				fireflyParticles.vertices[i].offsetxdist = Math.random()*2-1;
				fireflyParticles.vertices[i].offsetydist = Math.random()*2-1;
				fireflyParticles.vertices[i].offsetzdist = Math.random()*2-1;
			}
			var firefly = new THREE.Points(fireflyParticles, fireflyMaterial);

			firefly.position.x = Math.floor(Math.random()*params.width);
			firefly.position.z = Math.floor(Math.random()*params.length);
			while(!this.canMove(firefly.position.x, firefly.position.z)){
				firefly.position.x = Math.floor(Math.random()*params.width);
				firefly.position.z = Math.floor(Math.random()*params.length);
			}
			firefly.position.x *= 2;
			firefly.position.z *= 2;
			world.add(firefly);

			var light = new THREE.PointLight(0x00ddff, 0.5, 3);
			light.position.y = 0.5;
			firefly.add(light);
			firefly.light = light;
			fireflies.push(firefly);
		}

		//add torches
		for(var j = 0; j < 5; j++){
			var torchHolder = new THREE.Object3D();
			var torch = LD32.loader.getModel('torch');

			torchHolder.position.x = Math.floor(Math.random()*params.width);
			torchHolder.position.z = Math.floor(Math.random()*params.length);
			while(!this.canMove(torchHolder.position.x, torchHolder.position.z)){
				torchHolder.position.x = Math.floor(Math.random()*params.width);
				torchHolder.position.z = Math.floor(Math.random()*params.length);
			}
			torchHolder.position.x *= 2;
			torchHolder.position.z *= 2;
			torchHolder.position.z += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.x += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.y = -1;
			torchHolder.rotation.y = Math.random()*Math.PI*2;

			torch.scale.set(25,25,25);

			world.add(torchHolder);
			torchHolder.add(torch);
			var light = new THREE.PointLight(0xff8800, 0.5, 3);
			light.position.y = 0.7;
			torchHolder.add(light);
			torchHolder.light = light;

			var fire = this.createFire();
			fire.position.y = 1.05;
			torchHolder.add(fire);

			torches.push(torchHolder);
		}
	}

	this.createStalagmite = function(){
		var mergeGeometry = new THREE.Geometry();
		var scale = Math.random()*0.4+0.8;

		var mite = new THREE.Mesh(new THREE.ConeGeometry( 0.25*scale, 1.5*scale, 32), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.25*scale, 1.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.25*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.25*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.SphereGeometry( 1, 16, 16 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
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
		var mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.5*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.75*scale, 32 ), wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
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

	this.createFire = function(){
		// mesh = new THREE.Mesh(new THREE.SphereGeometry( 0.1, 32, 32 ), displacementMaterial);
		mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 3), displacementMaterial);
		return mesh;
	}

	this.createEmpty = function(){
		var geo = new THREE.BufferGeometry();

		var vertexCount = 8;
		var vertices = new Float32Array(vertexCount * 3);
		vertices = Float32Array.from([
						 1, -1,  1,
						 1, -1, -1,
						-1, -1, -1,
						-1, -1,  1,
				
						 1, 1,  1,
						 1, 1, -1,
						-1, 1, -1,
						-1, 1,  1]);
		geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

		var indices = new Uint16Array(vertexCount * 3);
		indices = Uint16Array.from([
						0, 1, 2,
						0, 2, 3,
						4, 6, 5,
						4, 7, 6]);
		geo.setIndex(new THREE.BufferAttribute(indices, 1));

		var uvs = new Float32Array(vertexCount * 2);
		uvs = Float32Array.from([
						0, 0,
						0, 1,
						1, 1,
						1, 0,
						0, 0,
						0, 1,
						1, 1,
						1, 0]);
		geo.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

		geo.computeVertexNormals();
		var floor = new THREE.Mesh(geo, floorMat);
		return floor;
	}
}
