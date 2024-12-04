import Editor from "../editor/editor"
import { initProgram, loadTexture, setupAttribute } from "./program"
import { vsSample1 } from "../shader/vertex"
import { fsSample1 } from "../shader/fragment"

export default class FengScene {
    gl: WebGLRenderingContext
    vsEditor: Editor | null = null
    fsEditor: Editor | null = null
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
        const gl = canvas.getContext('webgl') as WebGLRenderingContext
        gl.viewport(0, 0, canvas.width, canvas.height)
        this.gl = gl
        this.setup(vsEditorSelector, fsEditorSelector)
    }
    private setup(vsEditorSelector: string, fsEditorSelector: string) {
        this.setupEditor(vsEditorSelector, fsEditorSelector)
        this.currentProgram = this.setupProgram()
        this.gl.useProgram(this.currentProgram)
        this.setupVertex()
        this.setupTexture(this.currentProgram)
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
        const program = initProgram(gl, vsCode, fsCode)
        return program
    }
    private setupVertex() {
        const vertexPosition = new Float32Array([
            0.5, 0.5,
            -0.5, 0.5,
            0.5, -0.5,
            -0.5, -0.5,
        ]);
        setupAttribute(this.gl, vertexPosition, 'aVertexPosition', 2)
    }
    private async setupTexture(program: WebGLProgram) {
        const gl = this.gl
        const textureCoords = new Float32Array([
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ])
        setupAttribute(gl, textureCoords, 'aTextureCoord', 2)
        loadTexture(gl, 'fox.png').then(() => {
            this.gameLoop(performance.now())
        })
        // 2d 图形贴图不需要翻转 Y 轴
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.activeTexture(gl.TEXTURE0)
        const samplerLocation = gl.getUniformLocation(program, 'uSampler')
        gl.uniform1i(samplerLocation, 0)
    }
    private update(now: number) {
        const gl = this.gl
        const vsCode = this.vsEditor!.getValue()
        const fsCode = this.fsEditor!.getValue()
        if (vsCode !== this.lastVsCode || fsCode !== this.lastFsCode) {
            this.currentProgram = initProgram(gl, vsCode, fsCode)
            this.lastVsCode = vsCode
            this.lastFsCode = fsCode
        }
        gl.useProgram(this.currentProgram)
        const timeLocation = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'uTime')
        gl.uniform1f(timeLocation, now / 1000)
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