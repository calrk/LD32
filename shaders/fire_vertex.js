uniform sampler2D tHeightMap;
uniform float time;
varying float height;
varying vec2 vUv;

void main(){
	vUv = uv;
	vUv.x = mod(vUv.x, 1.0);
	height = texture2D( tHeightMap, vec2(vUv.x, mod(vUv.y-time, 1.0)) ).x;

	vec3 pos = position * (height + 0.5);
	pos.y *= 1.0 - (0.5-vUv.y);

	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}