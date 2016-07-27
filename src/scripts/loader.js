
LD32.Loader = function(params){
	var models = {};
	var images = {};
	var objectloader = new THREE.ObjectLoader();
	var gltfLoader = new THREE.glTFLoader;

	// objectloader.texturePath = '../textures/';
	var loadingCount = 0;
	var loadedCount = 0;

	// objectloader.load("models/test.js", modelToScene);

	loadImage('dust', true);
	loadImage('firefly', true);
	loadImage('blood', true);
	loadImage('newspaper', true);

	loadModel('torch');

	function loadModel(name){
		loadingCount ++;
		//load a model and add it to the model object
		/*objectloader.load('../models/' + name + '.json', function(object){
			loadedCount ++;
			// var material = new THREE.MultiMaterial( materials );
			models[name] = object;
			// models[name].rotation.x = Math.PI/2;
		}, function(e){//progress

		}, function(){//error
			loadedCount ++;
		});*/
		gltfLoader.load('../models/' + name + '.gltf', function(data){
			loadedCount ++;
			models[name] = data.scene;

			models[name].traverse(function(part){
				if(part.material){
					var col = new THREE.Color(part.material.uniforms.u_diffuse.value.x, part.material.uniforms.u_diffuse.value.y, part.material.uniforms.u_diffuse.value.z);
					part.material = new THREE.MeshLambertMaterial({color: col.getHex()});
				}
			});		
		});
	}

	function loadImage(name, asTexture){
		loadingCount ++;
		var image = document.createElement('img');
		image.src = '../images/' + name + '.png';
		image.onload = function(){
			images[name] = image;

			if(asTexture){
				LD32.textures.addTexture(name, image);
			}
			loadedCount ++;
		}
	}

	this.getModel = function(name){
		if(models[name])
			return models[name].clone();
		return new THREE.Object3D();
	}

	this.getImage = function(name){
		if(images[name])
			return images[name];
		console.log("Image not found.");
		return new Image();
	}

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
}
