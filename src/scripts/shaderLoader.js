
LD32.Shader = function(params){
	var shaders = {};
	loadingCount = 0;
	loadedCount = 0;

	loadShader('disp_vertex');
	loadShader('disp_fragment');
	loadShader('noise_vertex');
	loadShader('noise_fragment');
	loadShader('fire_vertex');
	loadShader('fire_fragment');

	function loadShader(file){
		loadingCount ++;

		var client = new XMLHttpRequest();
		client.open('GET', './shaders/' + file + '.js');
		client.onreadystatechange = function(e) {
			if(e.target.readyState == 4){
				loadedCount ++;
				shaders[file] = client.responseText;
				// console.log(shaders[file]);
			}
		}
		client.send();
	}

	this.getShader = function(name){
		if(shaders[name])
			return shaders[name];
		return '';
	}

	this.ready = function(){
		if(loadingCount == loadedCount){
			return true;
		}
		return false;
	}
}
