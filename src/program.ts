import * as mat4 from './mat4'

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    }
    return shader
}

export function initProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`)
    }

    return program
}

export function initBuffer(gl: WebGLRenderingContext, data: ArrayBuffer) {
    const buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    return buffer
}

export function createProjectionMatrix(aspectRatio: number) {
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = aspectRatio
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix
}

export function createModelViewMatrix() {
    const modelViewMatrix = mat4.create();
  
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -6.0]
    )
    return modelViewMatrix
}