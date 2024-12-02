import Editor from './editor'
import { initBuffer, initProgram } from './program'

const vsEditor = new Editor('id-shader-vertex')
const fsEditor = new Editor('id-shader-fragment')

const initGL = () => {
    const canvas = document.querySelector('#game-webgl') as HTMLCanvasElement
    const gl = canvas.getContext('webgl') as WebGLRenderingContext
    gl.viewport(0, 0, canvas.width, canvas.height)
    return gl
}

function main() {
    const gl = initGL()
    run(gl)
    bindEvents(gl)
}

function run(gl: WebGLRenderingContext) {
    const vsSource = vsEditor.getValue()
    const fsSource = fsEditor.getValue()

    const program = initProgram(gl, vsSource, fsSource)
    gl.useProgram(program)
    const vertexPosition = new Float32Array([
        0.5, 0.5,
        -0.5, 0.5,
        0.5, -0.5,
        -0.5, -0.5,
    ]);
    
    {
        initBuffer(gl, vertexPosition)
        const vertexLocation = gl.getAttribLocation(program, 'aVertexPosition')
        const size = 2
        const normalized = false
        const stride = 0
        const offset = 0
        gl.vertexAttribPointer(vertexLocation, size, gl.FLOAT, normalized, stride, offset)
        gl.enableVertexAttribArray(vertexLocation)    
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    const offset = 0
    const count = 4
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, count)
}


function bindEvents(gl: WebGLRenderingContext) {
    const button = document.querySelector('#id-button-run') as HTMLButtonElement
    button.addEventListener('click', (event) => {
        event.preventDefault()
        run(gl)
    })
}

main()
