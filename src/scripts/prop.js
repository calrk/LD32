
class Prop{

	constructor(params){
		params = params || {};
		this.scene = params.scene;
		this.sceneObject = undefined;
		this.gameController = params.gameController;

		// add to props array in gameController
		// add this to scene
	}

	update (dt) {

	}

	destroy () {
		// this.scene.remove(this.sceneObject);
	}
}

module.exports = Prop;
