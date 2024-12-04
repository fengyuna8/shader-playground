import Message, { MessageType } from "../message"

export default class UISlider {
    private value: number
    private container: HTMLDivElement | null = null
    private canvas: HTMLCanvasElement | null = null
    private style: HTMLStyleElement | null = null
    private readonly width: number = 200
    private readonly height: number = 40
    private prevOffset: number = 0
    private offset: number
    private scale: number = 2
    onDestroy: () => void = () => {}
    
    // event
    private mousedown: boolean = false
    constructor(value: number) {
        this.value = value
        this.offset = value * (this.width / this.scale)
        this.setup()
        this.bindEvents()
    }
    showAt(x: number, y: number) {
        const x1 = x - this.width / 2
        const y1 = y + 35
        this.container!.style.left = `${x1}px`
        this.container!.style.top = `${y1}px`
    }
    private setup() {
        this.container = document.createElement('div')
        this.container.className = 'feng-plugin-control-slider'
        this.style = document.createElement('style')
        this.style.textContent = `.feng-plugin-control-slider { 
            position: absolute; top: 0; left: 0; 
            height: ${this.height}px;
            box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.25); 
            z-index: 1000; 
            background: rgba(255, 255, 255);
            &::before {
                content: '';
                position: absolute;
                top: -25px;
                /* 100px - 10px(三角形宽 20 的一半) */
                left: 90px;
                width: 0;
                height: 0;
                border: 10px solid transparent;
                border-bottom-color: rgba(0, 0, 0, 0.2);
            }
        }`
        document.head.appendChild(this.style)
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.cursor = 'crosshair'
        this.container.appendChild(this.canvas)
        document.body.appendChild(this.container)
        this.drawScale()
    }
    private drawScale() {
        const context = this.canvas!.getContext('2d') as CanvasRenderingContext2D
        context.clearRect(0, 0, this.width, this.height)

        const color = 'rgb(127, 127, 127)'
        {
            // 画横线
            context.beginPath()
            context.strokeStyle = color
            context.lineWidth = 1
            const x1 = 0
            const x2 = x1 + this.width
            const y1 = this.height * 0.5
            const y2 = y1
            context.moveTo(x1, y1 + 0.5)
            context.lineTo(x2, y2 + 0.5)
            context.stroke()
        }

        {
            // 画竖线
            context.beginPath()
            context.strokeStyle = color
            context.lineWidth = 1
            const x1 = this.width * 0.5
            const x2 = x1
            const y1 = 0
            const y2 = this.height
            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.stroke()
        }

        {
            let offset = this.offset
            const halfOfWidth = this.width * 0.5
            const distance = Math.abs(this.offset - halfOfWidth)
            if (distance > halfOfWidth) {
                offset = (this.offset - halfOfWidth) % halfOfWidth + this.width
            }
            // 画刻度
            const unit = 40
            const step = this.width / unit
            context.beginPath()
            context.strokeStyle = color
            context.lineWidth = 1
            for (let i = 0; i < unit * 3; i += 1) {
                let l
                if (i % (unit / 2) === 0) {
                    l = this.height * 0.35
                } else {
                    if (i % (unit / 4) === 0) {
                        l = this.height * 0.2
                    } else {
                        l = this.height * 0.1
                    }
                }
                const x1 = i * step - offset
                const x2 = x1
                const y1 = this.height * 0.5 - l
                const y2 = this.height * 0.5 + l
                context.moveTo(x1, y1)
                context.lineTo(x2, y2)
            }
            context.stroke()
        }
    }
    private onMousedown = (event: MouseEvent) => {
        this.mousedown = true
        this.prevOffset = event.offsetX
    }
    private onMousemove = (event: MouseEvent) => {
        if (this.mousedown) {
            const offsetX = event.offsetX
            const delta = offsetX - this.prevOffset
            this.offset += delta
            const center = this.width / this.scale
            this.value = this.offset / center
            this.prevOffset = offsetX
            this.drawScale()
            Message.send(MessageType.UIControlChange, this.value)
        }
    }
    private onMouseup = () => {
        this.mousedown = false
    }
    private onClick = (event: MouseEvent) => {
        let element = event.target as HTMLElement
        if (element !== this.canvas) {
            if (this.container !== null) {
                this.container.remove()
                this.style!.remove()
                this.destroyEvents()
                if (this.onDestroy) {
                    this.onDestroy()
                }
            }
        }
    }
    private bindEvents() {
        this.canvas!.addEventListener('mousedown', this.onMousedown)
        this.canvas!.addEventListener('mousemove', this.onMousemove)
        this.canvas!.addEventListener('mouseup', this.onMouseup)
        // hack
        // 相当于把 click 事件延后监听，这样在点击其他区域的时候，就不会把 container 销毁
        setTimeout(() => {
            document.body.addEventListener('click', this.onClick)
        }, 0)
    }
    private destroyEvents() {
        this.canvas!.removeEventListener('mousedown', this.onMousedown)
        this.canvas!.removeEventListener('mousemove', this.onMousedown)
        this.canvas!.removeEventListener('mouseup', this.onMousedown)
        document.body.removeEventListener('click', this.onClick)
    }
}