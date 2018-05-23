
class TextureLoader{
	constructor(){
		this.textures = {};
		this.textureSettings = {};
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = this.canvas.height = 128;
		this.isReady = false;

		this.generate();

		console.time('Loading Textures');
		this.loadingCount = 0;
		this.loadedCount = 0;

		this.loadImage('dust');
		this.loadImage('firefly');
		this.loadImage('blood');
		this.loadImage('newspaper');
	}

	ready(){
		return this.isReady && this.loadedCount == this.loadingCount;
	}

	generate(){
		console.time('Generating Textures');
		var frame = CLARITY.ctx.createImageData(this.canvas.width, this.canvas.height);

		var cloud = new CLARITY.Cloud({red:255, green:255, blue:255}).process(frame);
		// cloud = new CLARITY.Blur({}).process(cloud);
		var icloud = new CLARITY.Invert({}).process(cloud);
		this.generateTexture('cloud', cloud);
		this.generateTexture('wall', cloud);
		this.generateTexture('dirtCeil', cloud);

		var cloudNorm = new CLARITY.NormalGenerator({intensity: 0.0075}).process(cloud);
		this.generateTexture('wallNorm', cloudNorm);

		var noiseNorm = new CLARITY.FillRGB({red: 128, green: 128, blue: 255}).process(frame);
		// noiseNorm = new CLARITY.Noise({intensity:30, monochromatic: false}).process(noiseNorm);
		// noiseNorm = new CLARITY.Blur({radius:2}).process(noiseNorm);
		this.generateTexture('noiseNorm', noiseNorm);
		this.generateTexture('dirtCeilNorm', noiseNorm);

		this.isReady = true;
		console.timeEnd('Generating Textures');
	}

	generateTexture(name, frame){
		this.ctx.putImageData(frame, 0, 0);

		var img = this.canvas.toDataURL('image/png');
		var imageSrc = document.createElement('img');

		imageSrc.src = img;

		if(!this.textures[name]){
			this.textures[name] = new THREE.Texture();
		}

		this.textures[name].image = imageSrc;
		if(this.textureSettings[name]){
			if(this.textureSettings[name].wrap){
				this.textures[name].wrapS = THREE.RepeatWrapping;
				this.textures[name].wrapT = THREE.RepeatWrapping;
				this.textures[name].repeat.x = this.textureSettings[name].x;
				this.textures[name].repeat.y = this.textureSettings[name].y;
			}
		}

		this.textures[name].needsUpdate = true;
		setTimeout(() => {
			this.textures[name].needsUpdate = true;
		}, 1000);
	}

	loadImage(name){
		this.loadingCount ++;
		var image = document.createElement('img');
		image.src = '../images/' + name + '.png';
		image.onload = () => {
			// this.images[name] = image;

			this.addTexture(name, image);
			this.loadedCount ++;

			if(this.loadingCount == this.loadedCount){
				console.timeEnd('Loading Textures');
			}
		}
	}

	addTexture(name, image){
		if(!this.textures[name]){
			this.textures[name] = new THREE.Texture();
		}
		this.textures[name].image = image;

		if(this.textureSettings[name]){
			if(this.textureSettings[name].wrap){
				this.textures[name].wrapS = THREE.RepeatWrapping;
				this.textures[name].wrapT = THREE.RepeatWrapping;
				this.textures[name].repeat.x = this.textureSettings[name].x;
				this.textures[name].repeat.y = this.textureSettings[name].y;
			}
		}

		this.textures[name].needsUpdate = true;
	}

	getTexture(name){
		if(!this.textures[name]){
			this.textures[name] = new THREE.Texture();
		}
		return this.textures[name];
	}

	setOptions(params){
		var params = params || {};
		this.canvas.width = this.canvas.height = params.resolution || this.canvas.width || 512;

		this.textureSettings['tiles'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};
		this.textureSettings['tilesNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		/*this.textureSettings['dirtCeil'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};*/
		this.textureSettings['dirtCeilNorm'] = {
			wrap: true,
			x: params.width/2,
			y: params.length/2
		};

		this.textureSettings['wall'] = {
			wrap: true,
			x: 1,
			y: 1
		};
		this.textureSettings['wallNorm'] = {
			wrap: true,
			x: 1,
			y: 1
		};
	}
}
