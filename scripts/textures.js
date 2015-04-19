
function Textures(params){
	var textures = {};
	var textureSettings = {};
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = canvas.height = 512;

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

		/*var green = new CLARITY.FillRGB({red: 0, green: 150, blue: 0}).process(frame);
		green = new CLARITY.Multiply().process([cloud, green]);
		var brown = new CLARITY.FillRGB({red: 88, green: 62, blue: 44}).process(frame);
		brown = new CLARITY.Multiply().process([icloud, brown]);
		var grass = new CLARITY.Blend({ratio:0.75}).process([green, brown]);
		grass = new CLARITY.hsvShifter({lightness:2}).process(grass);
		generateTexture('grass', grass);
		generateTexture('dirt', brown);*/

		/*brown = new CLARITY.FillRGB({red: 87, green: 39, blue: 0}).process(frame);
		brown = new CLARITY.Multiply().process([icloud, brown]);
		generateTexture('dirtPath', brown);*/

		/*var tilesNorm = new CLARITY.Brickulate({horizontalSegs:8, verticalSegs: 8, grooveSize: 2}).process(frame);
		brown = new CLARITY.FillRGB({red: 40, green: 40, blue: 40}).process(frame);
		var moss = new CLARITY.FillRGB({red: 0, green: 150, blue: 0}).process(frame);
		moss = new CLARITY.Multiply().process([cloud, moss]);
		var tiles = new CLARITY.Puzzler({horizontalSegs:8, verticalSegs: 8}).process(cloud);
		// tiles = new CLARITY.AddSub().process([tiles, moss]);
		tiles = new CLARITY.AddSub({subtractive:true}).process([tiles, tilesNorm]);
		tiles = new CLARITY.AddSub({}).process([tiles, brown]);
		generateTexture('tiles', tiles);

		tilesNorm = new CLARITY.Brickulate({horizontalSegs:8, verticalSegs: 8, grooveSize: 2}).process(frame);
		tilesNorm = new CLARITY.Invert().process(tilesNorm);
		tilesNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(tilesNorm);
		tilesNorm = new CLARITY.NormalFlip({green: true}).process(tilesNorm);
		tilesNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(tilesNorm);
		tilesNorm = new CLARITY.Blur({radius:1}).process(tilesNorm);
		generateTexture('tilesNorm', tilesNorm);*/

		var noiseNorm = new CLARITY.FillRGB({red: 128, green: 128, blue: 255}).process(frame);
		noiseNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(noiseNorm);
		noiseNorm = new CLARITY.Blur({radius:2}).process(noiseNorm);
		generateTexture('noiseNorm', noiseNorm);
		generateTexture('dirtCeilNorm', noiseNorm);

		/*ctx.drawImage(loader.getImage('dust'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		generateTexture('dust', frame);*/

		/*ctx.drawImage(loader.getImage('tombstone2'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		var normal = new CLARITY.NormalGenerator({intensity: 0.01}).process(frame);
		normal = new CLARITY.Noise({intensity:30, monochromatic: false}).process(normal);
		generateTexture('tombstone2Norm', normal);


		var frame1, frame2;
		frame2 = new CLARITY.FillRGB({red: 208, green: 186, blue: 137}).process(frame);
		frame1 = new CLARITY.Blend().process([cloud, frame2]);

		frame2 = new CLARITY.FillRGB({red: 163, green: 133, blue: 87}).process(frame2);
		frame2 = new CLARITY.Blend().process([icloud, frame2]);

		ctx.drawImage(loader.getImage('grass'), 0, 0, canvas.width, canvas.height);
		yellow = new CLARITY.FillRGB({red: 208, green: 186, blue: 137}).process(frame);
		frame = ctx.getImageData(0,0,width,height);
		var hay = new CLARITY.Blend().process([frame, yellow]);
		// hay = new CLARITY.Multiply().process([cloud, hay]);
		// hay = new CLARITY.hsvShifter({value:3}).process(hay);
		generateTexture('hay', hay);

		ctx.drawImage(loader.getImage('grass'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		normal = new CLARITY.NormalGenerator({intensity: 0.02}).process(frame);
		normal = new CLARITY.Noise({intensity:30, monochromatic: false}).process(normal);
		generateTexture('hayNorm', normal);
		// normal = new CLARITY.NormalIntensity({intensity: 0.5}).process(normal);
		// generateTexture('hayNormBig', normal);


		ctx.drawImage(loader.getImage('wood'), 0, 0, canvas.width, canvas.height);
		frame = ctx.getImageData(0,0,width,height);
		generateTexture('wood', frame);*/
		
		console.log("Textures Generated.");
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
