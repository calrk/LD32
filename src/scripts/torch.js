class Torch extends Prop{
	constructor (params) {
		super(params);

		var sceneObject = new THREE.Object3D();
		var torch = LD32.loader.getModel('torch');
		torch.scale.set(25,25,25);
		sceneObject.add(torch);
		sceneObject.position.x = params.position.x;
		sceneObject.position.y = -1;
		sceneObject.position.z = params.position.z;
		sceneObject.rotation.y = Math.random()*Math.PI*2;

		this.light = new THREE.PointLight(0xff8800, 0.5, 3);
		this.light.position.y = 0.7;
		sceneObject.add(this.light);

		this.fireUniforms = {
			tHeightMap:  { type: "t",  value: LD32.textures.getTexture('cloud') },
			uColor: { type: "c", value: new THREE.Color( 0xff4800 ) },
			time: { type: "f", value: 0.0 },
		};

		this.displacementMaterial = new THREE.ShaderMaterial({
			transparent:	true,
			uniforms: this.fireUniforms,
			vertexShader:	LD32.shaderLoader.getShader('fire_vertex'),
			fragmentShader: LD32.shaderLoader.getShader('fire_fragment')
		});

		var fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 3), this.displacementMaterial);
		fire.position.y = 1.05;
		sceneObject.add(fire);

		this.scene.add(sceneObject);
		this.sceneObject = sceneObject;
	}

	update (dt) {
		this.light.intensity = Math.sin(LD32.clock.elapsedTime*16)*0.2+0.9;
		this.fireUniforms.time.value += dt;
	}
}