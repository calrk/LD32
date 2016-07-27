uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 uShapeBias;
uniform float uTurbulence;
	
#ifdef VERTEX_TEXTURES
	uniform sampler2D tHeightMap;
	uniform float uDisplacementScale;
	uniform float uDisplacementBias;
#endif

void main( void ) {

	vUv = uv;
	vNormal = normalize( normalMatrix * normal );

	//change matrix
	vec4 mPosition = vec4( position, 1.0 );

	// mPosition.x *= 1.0 - uShapeBias.x*(1.0-vUv.y);
	mPosition.y *= 1.0 - (0.5-vUv.y)*uShapeBias.y*200.0;

	float turbFactor = uTurbulence*(vUv.y-0.5);

	//shape turbulance
	mPosition.x += sin(mPosition.y/100.0 + time*20.0)*turbFactor;
	mPosition.z += cos(mPosition.y/100.0 + time*20.0)*turbFactor;
	
	mPosition = modelViewMatrix * mPosition;

	//change matrix
	vec4 mvPosition = viewMatrix * mPosition;

	#ifdef VERTEX_TEXTURES
		vec3 dv = texture2D( tHeightMap, vUv ).xyz;
		float df = uDisplacementScale * dv.x + uDisplacementBias;
		vec4 displacedPosition = vec4( vNormal.xyz * df, 0.0 ) + mPosition;
		gl_Position = projectionMatrix * displacedPosition;
	#else
		gl_Position = projectionMatrix * mvPosition;
	#endif
}