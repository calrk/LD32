varying vec2 vUv;

uniform sampler2D tHeightMap;
uniform float uSmoke;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uScreenHeight;

void main( void ) {


	vec4 heightColor = texture2D( tHeightMap, vUv);

	// vec3 gradient1 = uColor1/(vUv.y);
	vec3 gradient2 = uColor2/(vUv.y);
	vec3 fireSumColor = gradient2*(1.25-max(0.2, heightColor.r)*1.25);

	//smoke
	gl_FragColor = vec4(mix( fireSumColor, vec3(1.0), (vUv.y/1.5)*uSmoke ),1.0);
	// gl_FragColor = vec4(1.0,0.0,0.0,1.0);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( 7.0, 10.0, depth );

	gl_FragColor = mix( gl_FragColor, vec4( vec3(0.0,0.0,0.0), gl_FragColor.w ), fogFactor )*1.0;
	gl_FragColor.a = 2.0-(vUv.y*2.0);
}