
class World{

	constructor (params) {
		var params = params || {};
		this.length = params.length || 100;
		this.width = params.width || 20;

		this.world = new THREE.Object3D();
		this.content = [];
		for(var i = 0; i < this.width+2; i++){
			this.content[i] = [];
		}
		this.dustSystems = [];
		this.fireflies = [];
		this.torches = [];

		this.wallMat = new THREE.MeshLambertMaterial({
			color: 0xcb6e00,
			map: LD32.textures.getTexture('wall'),
			// normalMap: LD32.textures.getTexture('noiseNorm')
		});
		this.ceilMat = this.wallMat;
		this.floorMat = this.wallMat;

		this.dustMaterial = new THREE.PointsMaterial({
			color: 0x743f00,
			size: 0.1,
			map: LD32.textures.getTexture('dust'),
			blending: THREE.AdditiveBlending,
			transparent: true
		});

		this.fireflyMaterial = new THREE.PointsMaterial({
			color: 0x00aadd,
			size: 0.1,
			map: LD32.textures.getTexture('firefly'),
			blending: THREE.AdditiveBlending,
			transparent: true
		});

		this.fireUniforms = {
			tHeightMap:  { type: "t",  value: LD32.textures.getTexture('cloud') },
			uColor: { type: "c", value: new THREE.Color( 0xff4800 ) },
			time: { type: "f", value: 0.0 },
		};

		this.displacementMaterial = new THREE.ShaderMaterial({
			transparent:	true,
			uniforms: this.fireUniforms,
			vertexShader:	LD32.shaderLoader.getShader('fire_vertex'),
			fragmentShader: LD32.shaderLoader.getShader('fire_fragment')
		});
	}

	reset () {
		this.content = [];
		for(var i = 0; i < this.width+2; i++){
			this.content[i] = [];
		}
		this.dustSystems = [];
		this.fireflies = [];
		this.torches = [];
	}

	update (dt){
		for(var i = 0; i < this.dustSystems.length; i++){
			this.dustSystems[i].position.y = Math.sin(LD32.clock.elapsedTime/10+this.dustSystems[i].offset);
		}

		for(var i = 0; i < this.fireflies.length; i++){
			this.fireflies[i].light.intensity = Math.sin(LD32.clock.elapsedTime*4)*0.2+0.9;

			this.fireflies[i].geometry.vertices.forEach(vertex => {
				vertex.x = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetx)*vertex.offsetxdist;
				vertex.y = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsety)*vertex.offsetydist;
				vertex.z = Math.sin(LD32.clock.elapsedTime/2 + vertex.offsetz)*vertex.offsetzdist;
			});
			this.fireflies[i].geometry.verticesNeedUpdate = true;
		}

		for(var i = 0; i < this.torches.length; i++){
			this.torches[i].light.intensity = Math.sin(LD32.clock.elapsedTime*16)*0.2+0.9;
		}
		this.fireUniforms.time.value += dt;
	}

	createWorld () {
		this.world = new THREE.Object3D();

		//add outside walls
		for(var i = 0; i < this.width+2; i++){
			for(var j = 0; j < this.length+2; j++){
				if(i == 0 || i == this.width+1 || j == 0 || j == this.length+1){
					var wall = this.createWall();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					this.world.add(wall);
					this.content[i][j] = 1;
				}
				else{
					var wall = this.createEmpty();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					this.world.add(wall);
					this.content[i][j] = 0;
				}
				// var val = simplex.noise3D(geometry.vertices[i].x/2, geometry.vertices[i].y/2, geometry.vertices[i].z/2);
			}
		}

		//add inside walls
		for(var i = 0; i < this.width+1; i+=2){
			for(var j = 0; j < this.length+1; j+=2){
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
				this.world.add(wall);
				this.content[i+x][j+y] = 1;
			}
		}

		//add dust particles
		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*this.width*2, Math.random()*2-1, Math.random()*this.length*2));
			}

			this.dustSystems[j] = new THREE.Points(dusts, this.dustMaterial);
			this.dustSystems[j].offset = Math.random()*Math.PI*2;
			this.world.add(this.dustSystems[j]);
		}

		//add this.fireflies
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
			var firefly = new THREE.Points(fireflyParticles, this.fireflyMaterial);

			firefly.position.x = Math.floor(Math.random()*this.width);
			firefly.position.z = Math.floor(Math.random()*this.length);
			while(!this.canMove(firefly.position.x, firefly.position.z)){
				firefly.position.x = Math.floor(Math.random()*this.width);
				firefly.position.z = Math.floor(Math.random()*this.length);
			}
			firefly.position.x *= 2;
			firefly.position.z *= 2;
			this.world.add(firefly);

			var light = new THREE.PointLight(0x00ddff, 0.5, 3);
			light.position.y = 0.5;
			firefly.add(light);
			firefly.light = light;
			this.fireflies.push(firefly);
		}

		//add this.torches
		for(var j = 0; j < 5; j++){
			var torchHolder = new THREE.Object3D();
			var torch = LD32.loader.getModel('torch');

			torchHolder.position.x = Math.floor(Math.random()*this.width);
			torchHolder.position.z = Math.floor(Math.random()*this.length);
			while(!this.canMove(torchHolder.position.x, torchHolder.position.z)){
				torchHolder.position.x = Math.floor(Math.random()*this.width);
				torchHolder.position.z = Math.floor(Math.random()*this.length);
			}
			torchHolder.position.x *= 2;
			torchHolder.position.z *= 2;
			torchHolder.position.z += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.x += Math.random() < 0.5 ? -0.9 : 0.9;
			torchHolder.position.y = -1;
			torchHolder.rotation.y = Math.random()*Math.PI*2;

			torch.scale.set(25,25,25);

			this.world.add(torchHolder);
			torchHolder.add(torch);
			var light = new THREE.PointLight(0xff8800, 0.5, 3);
			light.position.y = 0.7;
			torchHolder.add(light);
			torchHolder.light = light;

			var fire = this.createFire();
			fire.position.y = 1.05;
			torchHolder.add(fire);

			this.torches.push(torchHolder);
		}
	}

	createStalagmite () {
		var mergeGeometry = new THREE.Geometry();
		var scale = Math.random()*0.4+0.8;

		var mite = new THREE.Mesh(new THREE.ConeGeometry( 0.25*scale, 1.5*scale, 32), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		var matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.25*scale, 1.5*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-1.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.5*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.25*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1.5-0.75;
		mite.position.y = -(2-0.25*scale)/2;
		mite.position.z = Math.random()*1.5-0.75;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		mite = new THREE.Mesh(new THREE.SphereGeometry( 1, 16, 16 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*0.5-0.25;
		mite.position.y = -1.75;
		mite.position.z = Math.random()*0.5-0.25;
		mite.matrixAutoUpdate && mite.updateMatrix();
		matrix = mite.matrix;
		mergeGeometry.merge(mite.geometry, matrix);

		var buffer = new THREE.BufferGeometry();
		buffer = buffer.fromGeometry(mergeGeometry);

		var object = new THREE.Mesh(buffer, this.wallMat);
		object.rotation.y = Math.PI*Math.random()*2;
		return object;
	}

	createStalagtite () {
		var object = this.createStalagmite();
		object.rotation.x = Math.PI;

		var scale = Math.random()*0.2+0.9;
		var mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.5*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.5*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		scale = Math.random()*0.2+0.9;
		mite = new THREE.Mesh(new THREE.ConeGeometry(0.125*scale, 0.75*scale, 32 ), this.wallMat);
		mite.rotation.y = Math.PI*Math.random()*2;
		mite.position.x = Math.random()*1-0.5;
		mite.position.y = (2-0.75*scale)/2;
		mite.position.z = Math.random()*1-0.5;
		mite.rotation.x = Math.PI;
		object.add(mite);

		return object;
	}

	createWall () {
		var wall = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), this.wallMat);
		return wall;
	}

	canMove (i , j){
		if(i < 0 || j < 0){
			return false;
		}
		if(!this.content[i][j]){
			return true;
		}
	}

	World () {
		return this.world;
	}

	createFire () {
		// mesh = new THREE.Mesh(new THREE.SphereGeometry( 0.1, 32, 32 ), this.displacementMaterial);
		var mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 3), this.displacementMaterial);
		return mesh;
	}

	createEmpty () {
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
		var floor = new THREE.Mesh(geo, this.floorMat);
		return floor;
	}
}