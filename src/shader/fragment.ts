export const fsSample1 = `precision mediump float;
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
    vec2 coord = vTextureCoord;
    gl_FragColor = texture2D(uSampler, coord);
}`