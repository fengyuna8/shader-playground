import * as mat4 from '../math/mat4'

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    }
    return shader
}

export function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        // throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`)
    }

    return program
}

export function createBuffer(gl: WebGLRenderingContext, data: ArrayBuffer) {
    const buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    return buffer
}

export function setupAttribute(gl: WebGLRenderingContext, data: Float32Array, attributeName: string, size: number) {
    createBuffer(gl, data)
    const program = gl.getParameter(gl.CURRENT_PROGRAM)
    const location = gl.getAttribLocation(program, attributeName)
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset)
    gl.enableVertexAttribArray(location)
}

function loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = path
        img.onload = () => {
            resolve(img)
        }
        img.onerror = () => {
            reject(`image ${path} load failed`)
        }
    })
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0
}

export async function loadTexture(gl: WebGLRenderingContext, path: string) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const level = 0
    const internalFormat = gl.RGBA
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel)

    {
        const image = await loadImage(path)
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // 图片的宽高如果是 2 的幂，webgl1 可以直接使用贴图
            gl.generateMipmap(gl.TEXTURE_2D)
        } else {
            // 如果宽高不是 2 的幂，webgl1 只能处理 NEAREST 和 LINEAR 过滤，并且不会生成贴图
            // 需要手动设置平铺模式
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        }
    }
    return texture
}

export function createProjectionMatrix(aspectRatio: number) {
    const fieldOfView = (45 * Math.PI) / 180
    const aspect = aspectRatio
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()
  
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
    return projectionMatrix
}

export function createModelViewMatrix(rotation: number) {
    const modelViewMatrix = mat4.create()
  
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -6.0]
    )
    mat4.rotate(
        modelViewMatrix, 
        modelViewMatrix,
        rotation,
        [0, 1, 1],
    )
    return modelViewMatrix
}