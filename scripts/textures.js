
function Textures(params){
	var textures = {};
	var textureSettings = {};
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = canvas.height = 512;
	var isReady = false;

	this.ready = function(){
		return isReady;
	}

	this.generate = function(){
		console.log("Generating Textures...");
		var frame = CLARITY.ctx.createImageData(canvas.width, canvas.height);
		
		var cloud = new CLARITY.Cloud({red:255, green:255, blue:255}).process(frame);
		cloud = new CLARITY.Blur({}).process(cloud);
		var icloud = new CLARITY.Invert({}).process(cloud);
		generateTexture('cloud', cloud);
		generateTexture('wall', cloud);
		generateTexture('dirtCeil', cloud);

		var cloudNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(cloud);
		generateTexture('wallNorm', cloudNorm);

		var noiseNorm = new CLARITY.FillRGB({red: 128, green: 128, blue: 255}).process(frame);
		noiseNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(noiseNorm);
		noiseNorm = new CLARITY.Blur({radius:2}).process(noiseNorm);
		generateTexture('noiseNorm', noiseNorm);
		generateTexture('dirtCeilNorm', noiseNorm);

		console.log("Textures Generated.");
		isReady = true;
	}

	function generateTexture(name, frame){
		ctx.putImageData(frame, 0, 0);
		
		var img = canvas.toDataURL('image/png');
		var imageSrc = document.createElement('img');

		// document.body.appendChild(imageSrc);

		imageSrc.src = img;

		textures[name] = new THREE.Texture();
		textures[name].image = imageSrc;
		if(textureSettings[name]){
			if(textureSettings[name].wrap){
				textures[name].wrapS = THREE.RepeatWrapping;
				textures[name].wrapT = THREE.RepeatWrapping;
				textures[name].repeat.x = textureSettings[name].x;
				textures[name].repeat.y = textureSettings[name].y;
			}
		}

		textures[name].needsUpdate = true;
		setTimeout(function(){
			textures[name].needsUpdate = true;
		}, 1000);
	}

	this.addTexture = function(name, image){
		textures[name] = new THREE.Texture();
		textures[name].image = image;

		if(textureSettings[name]){
			if(textureSettings[name].wrap){
				textures[name].wrapS = THREE.RepeatWrapping;
				textures[name].wrapT = THREE.RepeatWrapping;
				textures[name].repeat.x = textureSettings[name].x;
				textures[name].repeat.y = textureSettings[name].y;
			}
		}

		textures[name].needsUpdate = true;
	}

	this.getTexture = function(name){
		return textures[name];
	}

	// this.generate();

	this.setOptions = function(params){
		var params = params || {};
		canvas.width = canvas.height = params.resolution || 512;


		/*textureSettings['grass'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};
		textureSettings['hayNormBig'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};
		textureSettings['dirt'] = {
			wrap: true,
			x: params.width/4,
			y: params.length/4
		};*/

		textureSettings['tiles'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};
		textureSettings['tilesNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		textureSettings['dirtCeil'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};
		textureSettings['dirtCeilNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		textureSettings['wall'] = {
			wrap: true,
			x: 1,
			y: 1
		};
		textureSettings['wallNorm'] = {
			wrap: true,
			x: 1,
			y: 1
		};
	}

}
