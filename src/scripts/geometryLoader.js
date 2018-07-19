const THREE = require('three');

class GeometryLoader{

	constructor (params) {
		this.geometry = [];
		this.diamondMesh = undefined;
	}

	createDiamond(size, mat){
		if(this.diamondMesh){
			var mesh = new THREE.Mesh(this.diamondMesh.geometry, mat);
			mesh.scale.set(size[0], size[1], size[2]);
			return mesh;
		}
		var geo = new THREE.Geometry();
		var mat = mat || new THREE.MeshLambertMaterial({color: 0x800000});

		geo.vertices.push(new THREE.Vector3(1, 0, 0));
		geo.vertices.push(new THREE.Vector3(-1, 0, 0));
		geo.vertices.push(new THREE.Vector3(0, 1, 0));
		geo.vertices.push(new THREE.Vector3(0, -1, 0));
		geo.vertices.push(new THREE.Vector3(0, 0, 1));
		geo.vertices.push(new THREE.Vector3(0, 0, -1));

		geo.faces.push(new THREE.Face3(0, 2, 4));
		geo.faces.push(new THREE.Face3(0, 4, 3));
		geo.faces.push(new THREE.Face3(0, 3, 5));
		geo.faces.push(new THREE.Face3(0, 5, 2));

		geo.faces.push(new THREE.Face3(1, 2, 5));
		geo.faces.push(new THREE.Face3(1, 5, 3));
		geo.faces.push(new THREE.Face3(1, 3, 4));
		geo.faces.push(new THREE.Face3(1, 4, 2));

		var uva = new THREE.Vector2(0, 0);
		var uvb = new THREE.Vector2(0, 1);
		var uvc = new THREE.Vector2(1, 1);
		var uvd = new THREE.Vector2(1, 0);
		var uve = new THREE.Vector2(0.5, 0.5);

		geo.faceVertexUvs[ 0 ].push( [ uvc, uve, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uvb, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uve, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );

		geo.faceVertexUvs[ 0 ].push( [ uva, uve, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uve, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uve ] );

		geo.computeFaceNormals();

		var buffer = new THREE.BufferGeometry();
		buffer = buffer.fromGeometry(geo);

		var diamond = new THREE.Mesh(buffer, mat);
		this.diamondMesh = diamond.clone();
		diamond.scale.set(size[0], size[1], size[2]);
		return diamond;
	}

	createBody(){
		if(this.geometry['body']){
			return this.geometry['body'];
		}
		var geo = new THREE.Geometry();

		geo.vertices.push(new THREE.Vector3(0, -1, 0));

		geo.vertices.push(new THREE.Vector3(0.5,  -0.5, 0));
		geo.vertices.push(new THREE.Vector3(0,    -0.5, -0.5));
		geo.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
		geo.vertices.push(new THREE.Vector3(0,    -0.5, 0.5));

		geo.vertices.push(new THREE.Vector3(0.5,  0.5, 0));
		geo.vertices.push(new THREE.Vector3(0,    0.5, -0.5));
		geo.vertices.push(new THREE.Vector3(-0.5, 0.5, 0));
		geo.vertices.push(new THREE.Vector3(0,    0.5, 0.5));

		geo.vertices.push(new THREE.Vector3(0, 1, 0));

		geo.faces.push(new THREE.Face3(0, 1, 4));
		geo.faces.push(new THREE.Face3(0, 2, 1));
		geo.faces.push(new THREE.Face3(0, 3, 2));
		geo.faces.push(new THREE.Face3(0, 4, 3));

		geo.faces.push(new THREE.Face3(1, 2, 6));
		geo.faces.push(new THREE.Face3(1, 6, 5));
		geo.faces.push(new THREE.Face3(2, 3, 7));
		geo.faces.push(new THREE.Face3(2, 7, 6));
		geo.faces.push(new THREE.Face3(3, 4, 8));
		geo.faces.push(new THREE.Face3(3, 8, 7));
		geo.faces.push(new THREE.Face3(4, 1, 5));
		geo.faces.push(new THREE.Face3(4, 5, 8));

		geo.faces.push(new THREE.Face3(8, 5, 9));
		geo.faces.push(new THREE.Face3(5, 6, 9));
		geo.faces.push(new THREE.Face3(6, 7, 9));
		geo.faces.push(new THREE.Face3(7, 8, 9));

		geo.computeFaceNormals();

		var uva = new THREE.Vector2(0, 0);
		var uvb = new THREE.Vector2(0, 1);
		var uvc = new THREE.Vector2(1, 1);
		var uvd = new THREE.Vector2(1, 0);
		var uve = new THREE.Vector2(0.5, 0.5);

		geo.faceVertexUvs[ 0 ].push( [ uve, uva, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uve, uvb, uva ] );
		geo.faceVertexUvs[ 0 ].push( [ uve, uva, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uve, uvb, uva ] );

		geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvc, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uvd, uvc ] );

		geo.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvc, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uvd, uvc ] );

		geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uvd, uvc, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uvc, uvd, uve ] );
		geo.faceVertexUvs[ 0 ].push( [ uvd, uvc, uve ] );

		var buffer = new THREE.BufferGeometry();
		buffer = buffer.fromGeometry(geo);

		this.geometry['body'] = buffer;
		return buffer;
	}

	createWing(){
		if(this.geometry['wing']){
			return this.geometry['wing'];
		}
		var geo = new THREE.Geometry();

		geo.vertices.push(new THREE.Vector3(0.75, 0, 0.75));
		geo.vertices.push(new THREE.Vector3(-0.75, 0, 0.75));
		geo.vertices.push(new THREE.Vector3(0, 0.1, 0));
		geo.vertices.push(new THREE.Vector3(0, -0.1, 0));
		geo.vertices.push(new THREE.Vector3(0, 0, 1.5));
		geo.vertices.push(new THREE.Vector3(0, 0, -0.5));

		geo.faces.push(new THREE.Face3(0, 2, 4));
		geo.faces.push(new THREE.Face3(0, 4, 3));
		geo.faces.push(new THREE.Face3(0, 3, 5));
		geo.faces.push(new THREE.Face3(0, 5, 2));

		geo.faces.push(new THREE.Face3(1, 2, 5));
		geo.faces.push(new THREE.Face3(1, 5, 3));
		geo.faces.push(new THREE.Face3(1, 3, 4));
		geo.faces.push(new THREE.Face3(1, 4, 2));

		var uva = new THREE.Vector2(0, 0);
		var uvb = new THREE.Vector2(0, 1);
		var uvc = new THREE.Vector2(1, 1);
		var uvd = new THREE.Vector2(1, 0);

		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under
		geo.faceVertexUvs[ 0 ].push( [ uvb, uva, uvd ] );//under

		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under
		geo.faceVertexUvs[ 0 ].push( [ uva, uvd, uvb ] );//under

		geo.computeFaceNormals();
		this.geometry['wing'] = geo;
		return geo;
	}

	createFloorCeil(){
		if(this.geometry['floorceil']){
			return this.geometry['floorceil'];
		}

		var geo = new THREE.BufferGeometry();
		var vertices = Float32Array.from([
						 1, -1,  1,
						 1, -1, -1,
						-1, -1, -1,
						-1, -1,  1,

						 1, 1,  1,
						 1, 1, -1,
						-1, 1, -1,
						-1, 1,  1]);
		geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

		var indices = Uint16Array.from([
						0, 1, 2,
						0, 2, 3,
						4, 6, 5,
						4, 7, 6]);
		geo.setIndex(new THREE.BufferAttribute(indices, 1));

		var uvs = Float32Array.from([
						0, 0,
						0, 1,
						1, 1,
						1, 0,
						0, 0,
						0, 1,
						1, 1,
						1, 0]);
		geo.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		geo.computeVertexNormals();

		this.geometry['floorceil'] = geo;
		return geo;
	}

	createWall(){
		if(this.geometry['wall']){
			return this.geometry['wall'];
		}
		this.geometry['wall'] = new THREE.BoxBufferGeometry(2, 2, 2);
		return this.geometry['wall'];
	}
}

module.exports = new GeometryLoader();
