class Token {
    type: string
    value: number
    start: number
    end: number
    constructor(type: string, value: number, start: number, end: number) {
        this.type = type
        this.value = value
        this.start = start
        this.end = end
    }
    isNumberType() {
        return this.type === 'number'
    }
}

export default class Tokenizer {
    private code: string
    private index: number = 0
    constructor(code: string) {
        this.code = code
    }
    parse(): Token[] {
        let ts: Token[] = []
        while (this.hasNext()) {
            const c = this.peek()
            if (this.isNumber(c) || c === '-' || c === '.') {
                const start = this.getIndex()
                const [value, end] = this.readNumber(this.getIndex())
                if (value !== null) {
                    // value 处于 [start, end]，左闭右闭，所以 end - 1
                    const t = new Token('number', value, start, end - 1)
                    ts.push(t)
                }
            } else {
                this.read()
            }
        }
        return ts
    }
    private isNumber(char: string) {
        const digits = '0123456789'
        return digits.includes(char)
    }
    private readNumber(start: number): [number | null, number] {
        let i = start
        let s = ''
        
        // 处理负号
        if (this.hasNext() && this.peek() === '-') {
            s += this.read()
            i += 1
        }
        
        // 处理整数
        while (this.hasNext() && this.isNumber(this.peek())) {
            s += this.read()
            i += 1
        }

        // 处理 .
        if (this.hasNext() && this.peek() === '.') {
            // 先把 . 加起来
            s += this.read()
            i += 1
            // 再看看 . 后面的内容
            while (this.hasNext() && this.isNumber(this.peek())) {
                s += this.read()
                i += 1
            }
        }

        // 这两种是有效的
        // -0.1
        // -.1

        // - 后面跟其他内容都是无效的
        // -.
        // .
        // . 后面可以不跟数字，比如 0.，但是这样不会进入 if
        if (s === '-' || s === '-.' || s === '.') {
            return [null, i]
        } else {
            return [parseFloat(s), i]
        }
    }
    private peek(offset: number = 0) {
        return this.code[this.index + offset]
    }
    private hasNext() {
        return this.index < this.code.length
    }
    private read() {
        const c = this.code[this.index]
        this.index += 1
        return c
    }
    private getIndex() {
        return this.index
    }
}