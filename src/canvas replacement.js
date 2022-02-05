/**
😴
@file canvas replacement
@summary WebGLazy bipsi integration
@license MIT
@author Sean S. LeBlanc

@description
Replaces bipsi canvas with a responsive WebGL canvas


HOW TO USE:
1. Import plugin in bipsi
2. Customize options in bipsi as needed

See https://github.com/seleb/WebGLazy#configuration for documentation on `glazy-options`

//!CONFIG glazy-options (json) { "background": "black", "scaleMode": "MULTIPLES", "allowDownscaling": true, "disableFeedbackTexture": true }
//!CONFIG init (javascript) "// you can set up any custom uniforms you have here if needed\n// e.g. glazy.glLocations.myUniform = glazy.gl.getUniformLocation(glazy.shader.program, 'myUniform');"
//!CONFIG update (javascript) "// you can update any custom uniforms you have here if needed\n// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);"
//!CONFIG fragment (text) "// uv-wave fragment shader\nprecision mediump float;\nuniform sampler2D tex0;\nuniform sampler2D tex1;\nuniform float time;\nuniform vec2 resolution;\n\nvoid main(){\n    vec2 coord = gl_FragCoord.xy;\n    vec2 uv = coord.xy / resolution.xy;\n    uv.x += sin(uv.y * 10.0 + time / 200.0) / 60.0;\n    uv.y += cos(uv.x * 10.0 + time / 200.0) / 60.0;\n    vec3 col = texture2D(tex0,uv).rgb;\n    gl_FragColor = vec4(col, 1.0);\n}"
*/
import WebGLazy from 'webglazy';

export const hackOptions = {};

hackOptions.glazyOptions = FIELD(CONFIG, 'glazyOptions', 'json') ?? {};
hackOptions.init = Function('glazy', FIELD(CONFIG, 'init', 'javascript') ?? '');
hackOptions.update = Function('glazy', FIELD(CONFIG, 'update', 'javascript') ?? '');
hackOptions.glazyOptions.fragment = FIELD(CONFIG, 'fragment', 'text') ?? undefined;

let glazy;
wrap.before(BipsiPlayback.prototype, 'start', () => {
	glazy = new WebGLazy(hackOptions.glazyOptions);
	if (hackOptions.init) {
		hackOptions.init(glazy);
	}
});

wrap.after(BipsiPlayback.prototype, 'update', () => {
	if (hackOptions.update) {
		hackOptions.update(glazy);
	}
});
