uniform vec3 uColor;
varying float height;
varying vec2 vUv;

void main( void ) {
	//smoke
	// gl_FragColor = vec4(uColor*(height/2.0+0.5), 1.0);
	vec3 gradient2 = uColor/(vUv.y*0.4);
	vec3 fireSumColor = gradient2*(max(0.0, height));
	gl_FragColor = vec4(mix( fireSumColor, vec3(0.5), clamp(vUv.y-0.5, 0.0, 1.0)), 2.0-vUv.y*2.0);
	// gl_FragColor = vec4(mix( uColor*(height), vec3(1.0), (vUv.y/5.0) ),1.0);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( 200.0, 400.0, depth );

	gl_FragColor = mix( gl_FragColor, vec4( vec3(0.0,0.0,0.0), gl_FragColor.w ), fogFactor )*1.0;
}