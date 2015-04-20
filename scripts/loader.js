
function Loader(params){
	var models = {};
	var images = {};
	var jsonloader = new THREE.JSONLoader();
	var loadingCount = 0;
	var loadedCount = 0;

	// jsonloader.load("models/test.js", modelToScene);

	loadImage('dust', true);
	loadImage('blood', true);
	loadImage('newspaper', true);

	function loadModel(name){
		loadingCount ++;
		//load a model and add it to the model object
		jsonloader.load('../models/' + name, function(geometry, materials){
			loadedCount ++;
			var mat = new THREE.MeshLambertMaterial({color:0xffffff});
			geometry.computeTangents();
			models[name] = new THREE.Mesh(geometry, mat);
			// models[name].rotation.x = Math.PI/2;
		});
	}

	function loadImage(name, asTexture){
		loadingCount ++;
		var image = document.createElement('img');
		image.src = '../images/' + name + '.png';
		image.onload = function(){
			images[name] = image;

			if(asTexture){
				textures.addTexture(name, image);
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
