import Editor from "../editor/editor"
import { createModelViewMatrix, createProgram, createProjectionMatrix, loadTexture, setupAttribute } from "./program"
import { vsSample1 } from "../shader/vertex"
import { fsSample1 } from "../shader/fragment"

export default class FengScene {
    private gl: WebGLRenderingContext
    private program: WebGLProgram
    private vsEditor: Editor | null = null
    private fsEditor: Editor | null = null
    private lastVsCode: string | null = null
    private lastFsCode: string | null = null
    private rotation: number = 0
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
        this.setupEditor(vsEditorSelector, fsEditorSelector)
        const gl = canvas.getContext('webgl') as WebGLRenderingContext
        gl.viewport(0, 0, canvas.width, canvas.height)
        this.gl = gl
        this.program = this.setupProgram()
        this.gl.useProgram(this.program)
        this.setup()
    }
    private setup() {
        this.setupVertex()
        this.setupIndex()
        this.setupTexture()
        this.setupMatrix()
    }
    private setupEditor(vsEditorSelector: string, fsEditorSelector: string) {
        this.vsEditor = new Editor(vsEditorSelector)
        this.vsEditor.setValue(vsSample1)
        this.fsEditor = new Editor(fsEditorSelector)
        this.fsEditor.setValue(fsSample1)
    }
    private setupProgram() {
        const gl = this.gl
        const vsCode = this.vsEditor!.getValue()
        const fsCode = this.fsEditor!.getValue()
        const program = createProgram(gl, vsCode, fsCode)
        return program
    }
    private setupVertex() {
        const gl = this.gl
        const vertexPosition = new Float32Array([
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ]);
        setupAttribute(gl, vertexPosition, 'aVertexPosition', 3)
        const textureCoords = new Float32Array([
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ])
        setupAttribute(gl, textureCoords, 'aTextureCoord', 2)
    }
    private async setupTexture() {
        const gl = this.gl
        loadTexture(gl, 'fox.png').then(() => {
            this.gameLoop(performance.now())
        })
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.activeTexture(gl.TEXTURE0)
        const samplerLocation = gl.getUniformLocation(this.program, 'uSampler')
        gl.uniform1i(samplerLocation, 0)
    }
    private setupIndex() {
        const gl = this.gl
        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22,23,
        ])
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    }
    private setupMatrix() {
        const gl = this.gl
        {
            const projection = createProjectionMatrix(gl.canvas.width / gl.canvas.height)
            const location = gl.getUniformLocation(this.program, 'uProjectionMatrix')
            gl.uniformMatrix4fv(location, false, projection)
        }
        {
            const modelView = createModelViewMatrix(this.rotation)
            const location = gl.getUniformLocation(this.program, 'uModelViewMatrix')
            gl.uniformMatrix4fv(location, false, modelView)
        }
    }
    private update(now: number) {
        const gl = this.gl
        const vsCode = this.vsEditor!.getValue()
        const fsCode = this.fsEditor!.getValue()
        if (vsCode !== this.lastVsCode || fsCode !== this.lastFsCode) {
            this.program = createProgram(gl, vsCode, fsCode)
            gl.useProgram(this.program)
            this.lastVsCode = vsCode
            this.lastFsCode = fsCode
        }
        this.rotation += 0.005
        this.setupMatrix()
        const timeLocation = gl.getUniformLocation(this.program, 'uTime')
        gl.uniform1f(timeLocation, now / 1000)
    }
    private clear() {
        const gl = this.gl
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    private draw() {
        const gl = this.gl
        const offset = 0
        const count = 36
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset)
    }
    gameLoop(now: number) {
        this.update(now)
        this.clear()
        this.draw()
        // 暂时不做成每帧更新
        // requestAnimationFrame(() => {
        //     this.gameLoop(now)
        // })
    }
}