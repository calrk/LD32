window.AudioContext = window.AudioContext || window.webkitAudioContext;

function Sounds(params){
	var self = this;
	var loadingCount = 0;
	var loadedCount = 0;
	this.sounds = {};
	this.loops = {};
	// this.soundSettings = {};

	this.audio = new AudioContext();
	this.audioGain = this.audio.createGain();
	this.volume = 0.15;
	// this.audioGain.gain.value = 0.15;
	this.audioCompressor = this.audio.createDynamicsCompressor();

	this.atmosAudio = new AudioContext();
	this.atmosGain = this.atmosAudio.createGain();
	this.atmosGainValue = 0.25;

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
	
	this.setVolume = function(val) {
		var val = val;
		if(val < 0){
			val = 0;
		}
		if(val > 2){
			val = 2;
		}
		this.volume = val;
	}
	
	this.play = function(sound) {
		if(!this.sounds[sound]){
			console.log("Sound not loaded: " + sound);
			return;
		}
		this.audioGain.gain.value = this.volume;
		var source = this.audio.createBufferSource();
		source.buffer = this.sounds[sound];
		source.connect(this.audioCompressor);
		this.audioCompressor.connect(this.audioGain);
		this.audioGain.connect(this.audio.destination);
		source.start(0);
	}

	this.playFootstep = function() {
		var rand = Math.floor(Math.random()*3.99)+1;
		this.play('dirt_step_'+rand);
	}


	this.loadSound = function(url) {
		loadingCount ++;
		var ctx = this;
		var request = new XMLHttpRequest();
		request.open('GET', './sounds/' + url + '.ogg', true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			ctx.audio.decodeAudioData(request.response, function(buffer) {
				ctx.sounds[url] = buffer;
			}, onError);
			loadedCount ++;
		}
		request.send();
	};

	function onError(err){
		console.log(err);
	}

	this.playLoop = function(sound) {
		if(!this.sounds[sound]){
			console.log("Sound not loaded: " + sound);
			return;
		}
		if(this.loops[sound]){
			console.log("Sound already looping: " + sound);
			return;
		}
		var source = this.audio.createBufferSource();
		source.loop = true;
		source.buffer = this.sounds[sound];
		source.connect(this.audioGain);
		this.audioGain.connect(this.audio.destination);
		source.start(0);

		this.loops[sound] = source;
	}

	this.stopLoop = function(sound) {
		if(!this.loops[sound]){
			console.log("Sound not Playing: " + sound);
			return;
		}
		this.loops[sound].stop(0);
		delete this.loops[sound];
	}

	this.playAtmospheric = function() {
		// setTimeout(self.playAtmospheric, Math.random()*2000+3500);

		var atmos = ['insect_1', 'insect_2', 'insect_3', 'insect_4'];
		var pos = Math.floor(Math.random()*atmos.length);

		if(!self.sounds[atmos[pos]]){
			console.log("Sound not loaded: " + sound);
			return;
		}

		self.atmosGain.gain.value = self.atmosGainValue*self.volume;

		var source = self.atmosAudio.createBufferSource();
		source.buffer = self.sounds[atmos[pos]];
		source.connect(self.atmosGain);
		self.atmosGain.connect(self.atmosAudio.destination);
		source.start(0);
	}

	this.loadSound('dirt_step_1');
	this.loadSound('dirt_step_2');
	this.loadSound('dirt_step_3');
	this.loadSound('dirt_step_4');
	this.loadSound('swing');
	this.loadSound('thud');
	this.loadSound('fly_damage');
	this.loadSound('fly_die');
	this.loadSound('ant_damage');
	this.loadSound('ant_die');
	this.loadSound('insect_1');
	this.loadSound('insect_2');
	this.loadSound('insect_3');
	this.loadSound('insect_4');
	this.loadSound('pain_1');
	this.loadSound('pain_2');
}
