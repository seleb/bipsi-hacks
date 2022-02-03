/**
😴
@file canvas replacement
@summary WebGLazy bipsi integration
@license MIT
@author Sean S. LeBlanc

@description
Replaces bipsi canvas with a responsive WebGL canvas

HOW TO USE:
1. Copy-paste this script into a bipsi plugin's javascript field
2. Edit the hackOptions object passed to the `new WebGLazy` call as needed

The shader used to render the canvas can be overridden via hack options:
e.g.
var hackOptions = {
	glazyOptions = {
		fragment: `
// uv-wave fragment shader
precision mediump float;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float time;
uniform vec2 resolution;

void main(){
	vec2 coord = gl_FragCoord.xy;
	vec2 uv = coord.xy / resolution.xy;
	uv.x += sin(uv.y * 10.0 + time / 200.0) / 60.0;
	uv.y += cos(uv.x * 10.0 + time / 200.0) / 60.0;
	vec3 col = texture2D(tex0,uv).rgb;
	gl_FragColor = vec4(col, 1.0);
}
		`,
	},
};
*/
import WebGLazy from 'webglazy';

export var hackOptions = {
	glazyOptions: {
		background: 'black',
		scaleMode: 'MULTIPLES', // use "FIT" if you prefer size to pixel accuracy
		allowDownscaling: true,
		disableFeedbackTexture: true, // set this to false if you want to use the feedback texture
		fragment: ``, // set this to use a fragment shader
	},
	init: function (glazy) {
		// you can set up any custom uniforms you have here if needed
		// e.g. glazy.glLocations.myUniform = glazy.gl.getUniformLocation(glazy.shader.program, 'myUniform');
	},
	update: function (glazy) {
		// you can update any custom uniforms you have here if needed
		// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);
	},
};

var glazy;
wrap.before(BipsiPlayback.prototype, 'start', function () {
	glazy = new WebGLazy(hackOptions.glazyOptions);
	if (hackOptions.init) {
		hackOptions.init(glazy);
	}
});

wrap.after(BipsiPlayback.prototype, 'update', function () {
	if (hackOptions.update) {
		hackOptions.update(glazy);
	}
});
