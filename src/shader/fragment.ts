// export const fsSample1 = `precision mediump float;
// varying highp vec2 vTextureCoord;
// uniform sampler2D uSampler;
// uniform float uTime;

// void main() {
//     vec2 coord = vTextureCoord;
//     float size = 0.05;
//     coord = floor(coord / size) * size;
//     gl_FragColor = texture2D(uSampler, coord);
// }`

export const fsSample1 = `precision mediump float;
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;

void main() {
    vec2 coord = vTextureCoord;
    float size = 0.05;
    float offset = sin(coord.x * 10.0 + uTime) * size;
    coord.x += offset;

    gl_FragColor = texture2D(uSampler, coord);
}`