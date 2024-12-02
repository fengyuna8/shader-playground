import Editor from "./editor"
import { initBuffer, initProgram } from "./program"

export default class FengScene {
    gl: WebGLRenderingContext
    vsEditor: Editor
    fsEditor: Editor
    private currentProgram: WebGLProgram | null = null
    private lastVsCode: string | null = null
    private lastFsCode: string | null = null
    /**
     * @param canvasSelector canvas元素的选择器
     * @param vsEditorSelector vertex shader 元素的 id 选择器，不需要带 #
     * <div id="id-shader-vertex"></div> 传入 'id-shader-vertex'，ace 这么设计的
     * @param fsEditorSelector  fragment shader 元素的 id 选择期，不需要带 #
     */
    constructor(canvasSelector: string, vsEditorSelector: string, fsEditorSelector: string) {
        const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement
        if (canvas === null) {
            throw new Error(`canvas is null, ${canvasSelector} is error`)
        }
        this.vsEditor = new Editor(vsEditorSelector)
        this.fsEditor = new Editor(fsEditorSelector)
        const gl = canvas.getContext('webgl') as WebGLRenderingContext
        gl.viewport(0, 0, canvas.width, canvas.height)
        this.gl = gl
        this.setup()
    }
    private setup() {
        this.currentProgram = this.setupProgram()
        this.setupVertex(this.currentProgram)
    }
    private setupProgram() {
        const gl = this.gl
        const vsCode = this.vsEditor.getValue()
        const fsCode = this.fsEditor.getValue()
        const program = initProgram(gl, vsCode, fsCode)
        return program
    }
    private setupVertex(program: WebGLProgram) {
        const gl = this.gl
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
    }
    private update() {
        const gl = this.gl
        const vsCode = this.vsEditor.getValue()
        const fsCode = this.fsEditor.getValue()
        if (vsCode !== this.lastVsCode || fsCode !== this.lastFsCode) {
            this.currentProgram = initProgram(gl, vsCode, fsCode)
            this.lastVsCode = vsCode
            this.lastFsCode = fsCode
        }
        gl.useProgram(this.currentProgram)
    }
    private clear() {
        const gl = this.gl
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    private draw() {
        const gl = this.gl
        const offset = 0
        const count = 4
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, count)
    }
    gameLoop() {
        this.update()
        this.clear()
        this.draw()
        // 暂时不做成每帧更新
        // requestAnimationFrame(() => {
        //     this.gameLoop()
        // })
    }
}