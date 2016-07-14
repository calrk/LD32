
function World(params){
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

	var dustMaterial = new THREE.PointsMaterial({
		color: 0x743f00, 
		size: 0.1,
		map: textures.getTexture('dust'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	var fireflyMaterial = new THREE.PointsMaterial({
		color: 0x00aadd, 
		size: 0.1,
		map: textures.getTexture('firefly'),
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	var fireEmberMaterial = new THREE.PointsMaterial({
		color: 0xff8800, 
		size: 0.01,
		map: textures.getTexture('firefly'),
		blending: THREE.AdditiveBlending,
		opacity: 0.5,
		transparent: true
	});

	var sceneRenderTarget = new THREE.Scene();
	var cameraOrtho = new THREE.OrthographicCamera(512 / - 2, 512 / 2, 512 / 2, 512 / - 2, -10000, 10000);
	cameraOrtho.position.z = 100;
	var quadTarget = new THREE.Mesh( new THREE.PlaneGeometry( 512, 512 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
	quadTarget.position.z = -500;
	sceneRenderTarget.add( quadTarget );

	var renderer2 = new THREE.WebGLRenderer({ antialias: false});
	renderer2.setSize(512, 512);
	renderer2.autoClear = false;
	renderer2.sortObjects = false;
	

	var uniforms = {
		time:  { type: "f", value: 1.0 },
		uSpeed:  { type: "f", value: 1.0 },
		scale: { type: "v2", value: new THREE.Vector2( 1, 1 ) }
	};

	var noiseMaterial = new THREE.ShaderMaterial({
		uniforms:		uniforms,
		vertexShader:   shaderLoader.getShader('noise_vertex'),
		fragmentShader: shaderLoader.getShader('noise_fragment'),
		// lights: false
	});
	quadTarget.material = noiseMaterial;

	var noiseMap = new THREE.WebGLRenderTarget( 512, 512, {
		minFilter: THREE.LinearMipMapLinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	});

	var displacementUniforms = {
		time:  { type: "f", value: 1.0 },
		tHeightMap:  { type: "t",  value: noiseMap.texture },
		uDisplacementBias: { type: "f", value: 0.09 },
		uDisplacementScale: { type: "f", value: 0.04 },
		uColor1: { type: "c", value: new THREE.Color( 0xffff00 ) },
		uColor2: { type: "c", value: new THREE.Color( 0xff8800 ) },
		uSmoke: { type: "f", value: 0.8 },
		uShapeBias: { type: "v2", value: new THREE.Vector2(0.23, 0.88) },
		uTurbulence: { type: "f", value: 5 }
	};

	var displacementMaterial = new THREE.ShaderMaterial({
		transparent:	true,
		uniforms:		displacementUniforms,
		vertexShader:	shaderLoader.getShader('disp_vertex'),
		fragmentShader: shaderLoader.getShader('disp_fragment'),
		// lights:			false
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
			dustSystems[i].position.y = Math.sin(clock.elapsedTime/10+dustSystems[i].offset);
		}

		for(var i = 0; i < fireflies.length; i++){
			fireflies[i].light.intensity = Math.sin(clock.elapsedTime*4)*0.2+0.9;

			fireflies[i].geometry.vertices.forEach(function(vertex){
				vertex.x = Math.sin(clock.elapsedTime/2 + vertex.offsetx)*vertex.offsetxdist;
				vertex.y = Math.sin(clock.elapsedTime/2 + vertex.offsety)*vertex.offsetydist;
				vertex.z = Math.sin(clock.elapsedTime/2 + vertex.offsetz)*vertex.offsetzdist;
			});
			fireflies[i].geometry.verticesNeedUpdate = true;
		}

		for(var i = 0; i < torches.length; i++){
			torches[i].light.intensity = Math.sin(clock.elapsedTime*16)*0.2+0.9;
		}

		fireEmbers.geometry.vertices.forEach(function(vertex){
			vertex.y += dt*0.5;
			vertex.x = vertex.initial.x+Math.sin(clock.elapsedTime*2+vertex.offsetxdist)/20;
			vertex.z = vertex.initial.z+Math.sin(clock.elapsedTime*2+vertex.offsetzdist)/20;
			if(vertex.y > 1.5/*vertex.initial.y+0.5*/){
				vertex.y = vertex.initial.y;
			}
		});
		fireEmbers.geometry.verticesNeedUpdate = true;

		displacementUniforms.time.value += dt*0.3;
		uniforms.uSpeed.value += dt*3;
		uniforms.time.value += dt*0.3;

		renderer.clear();
		renderer.render( sceneRenderTarget, cameraOrtho, noiseMap, true );
	}

	this.createWorld = function(){
		world = new THREE.Object3D();
		
		/*var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(params.width*2, params.length*2, params.width/10, params.length/10), floorMat);
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
		world.add(ceil);*/

		//add outside walls
		for(var i = 0; i < params.width+2; i++){
			for(var j = 0; j < params.length+2; j++){
				// if(i == 0 || i == params.width+1 || j == 0 || j == params.length+1){
					/*var wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2, 10, 10, 10), wallMat);
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);*/
					// content[i][j] = 1;
					var wall = this.createEmpty();
					wall.position.x = 2*i;
					wall.position.z = 2*j;
					world.add(wall);

					// var val = simplex.noise3D(geometry.vertices[i].x/2, geometry.vertices[i].y/2, geometry.vertices[i].z/2);
				// }
			}
		}

		//add inside walls
		/*for(var i = 0; i < params.width+1; i+=2){
			for(var j = 0; j < params.length+1; j+=2){
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
		}*/

		var str = '';
		content.forEach(function(arr){
			for(var i = 0; i < arr.length; i++){
				if(arr[i] == 1){
					str += 'X';
				}
				else{
					str += ' ';
				}
			}
			str += '\n';
		});
		console.log(str);

		for(var j = 0; j < 5; j++){
			var dusts = new THREE.Geometry();
			for(var i = 0; i < 50; i++){
				dusts.vertices.push(new THREE.Vector3(Math.random()*params.width*2, Math.random()*2-1, Math.random()*params.length*2));
			}

			dustSystems[j] = new THREE.Points(dusts, dustMaterial);
			dustSystems[j].offset = Math.random()*Math.PI*2;
			world.add(dustSystems[j]);
		}

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

		fireParticles = new THREE.Geometry();
		for(var j = 0; j < 5; j++){
			var torchHolder = new THREE.Object3D();
			var torch = loader.getModel('torch');

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
			torchHolder.position.y = -0.25;
			torchHolder.rotation.y = Math.random()*Math.PI*2;

			torch.scale.set(0.15,0.25,0.15);

			world.add(torchHolder);
			torchHolder.add(torch);
			var light = new THREE.PointLight(0xff8800, 0.5, 3);
			light.position.y = 0.5;
			torchHolder.add(light);
			torchHolder.light = light;

			var fire = this.createFire();
			fire.position.x = -0.01;
			fire.position.y = 0.23;
			fire.position.z = -0.01;
			torchHolder.add(fire);

			for(var i = j*20; i < j*20+20; i++){
				fireParticles.vertices.push( new THREE.Vector3(
					torchHolder.position.x + Math.random()*0.15-0.126,
					torchHolder.position.y + 0.2,
					torchHolder.position.z + Math.random()*0.15-0.126)
				);
				fireParticles.vertices[i].initial = {};
				fireParticles.vertices[i].initial.x = fireParticles.vertices[i].x;
				fireParticles.vertices[i].initial.y = fireParticles.vertices[i].y;
				fireParticles.vertices[i].initial.z = fireParticles.vertices[i].z;
				
				fireParticles.vertices[i].y -= Math.random()*5;

				fireParticles.vertices[i].offsetxdist = Math.random()*4-2;
				// fireParticles.vertices[i].offsetydist = Math.random()*4-2;
				fireParticles.vertices[i].offsetzdist = Math.random()*4-2;
			}

			torches.push(torchHolder);
		}
		fireEmbers = new THREE.Points(fireParticles, fireEmberMaterial);
		world.add(fireEmbers);
	}

	this.createStalagmite = function(){
		var mergeGeometry = new THREE.Geometry();
		var scale = Math.random()*0.4+0.8;

		var mite = new THREE.Mesh(new THREE.CylinderGeometry( 0, 0.25*scale, 1.5*scale, 32, 1, true), wallMat);
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

	this.createFire = function(){
		var geometrySphere = new THREE.SphereGeometry( 0.1, 140, 100 );
		mesh = new THREE.Mesh(geometrySphere, displacementMaterial);
		mesh.scale.set(0.01,0.01,0.01);
		return mesh;
	}

	this.createEmpty = function(){
		var geo = new THREE.Geometry();

		geo.vertices.push(new THREE.Vector3( 1, 0,  1))
		geo.vertices.push(new THREE.Vector3( 1, 0, -1))
		geo.vertices.push(new THREE.Vector3(-1, 0, -1))
		geo.vertices.push(new THREE.Vector3(-1, 0,  1))

		geo.faces.push(new THREE.Face3(0, 1, 2));
		geo.faces.push(new THREE.Face3(0, 2, 3));
		geo.faces.push(new THREE.Face3(2, 1, 0));
		geo.faces.push(new THREE.Face3(3, 2, 0));

		geo.computeFaceNormals();
		// var floor = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({wireframe:true}));
		var floor = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({wireframe:true}));
		console.log(floor)
		floor.position.y = -1;
		return floor;
		/*for(var i = -4.5; i < 5.5; i++){
			for(var j = -4.5; j < 5.5; j++){
				geo.vertices.push(new THREE.Vector3(i, 0, j));
			}
		}
		for(var i = 1; i < 9; i++){
			for(var j = 1; j < 9; j++){
				var a = j + 11 * i;
				var b = j + 11 * ( i + 1 );
				var c = ( j + 1 ) + 11 * ( i + 1 );
				var d = ( j + 1 ) + 11 * i;

				geo.faces.push(new THREE.Face3(a, b, d));
			}
		}
		geo.computeFaceNormals();
		var floor = new THREE.Mesh(geo, floorMat);
		floor.position.y = -1;
		return floor;*/
		/*for(var i = 0; i < 10; i++){
			for(var j = 0; j < 10; j++){
				geo.vertices.push(new THREE.Vector3(i, 1, j));
				if(i > 1 && j > 1){
					var x = i*10;
					var y = x + j;
					geo.faces.push(new THREE.Face3(x, x+1, y));
					geo.faces.push(new THREE.Face3(x, y, y+1));
				}
			}
		}
		geo.computeFaceNormals();
		return new THREE.Mesh(geo, wallMat);*/
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 10, 10), floorMat);
		floor.position.y = -1;
		return floor;
	}
}
