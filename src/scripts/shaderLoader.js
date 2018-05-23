
class ShaderLoader{

	constructor () {
		this.shaders = {};
		this.loadingCount = 0;
		this.loadedCount = 0;

		this.loadShader('disp_vertex');
		this.loadShader('disp_fragment');
		this.loadShader('noise_vertex');
		this.loadShader('noise_fragment');
		this.loadShader('fire_vertex');
		this.loadShader('fire_fragment');
	}

	loadShader (file) {
		this.loadingCount ++;

		var client = new XMLHttpRequest();
		client.open('GET', './shaders/' + file + '.js');
		client.onreadystatechange = (e) => {
			if(e.target.readyState == 4){
				this.loadedCount ++;
				this.shaders[file] = client.responseText;
				// console.log(shaders[file]);
			}
		}
		client.send();
	}

	getShader (name) {
		if(this.shaders[name])
			return this.shaders[name];
		return '';
	}

	ready () {
		if(this.loadingCount == this.loadedCount){
			return true;
		}
		return false;
	}
}
