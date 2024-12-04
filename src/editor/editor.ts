import Message, { MessageType } from "../message"
import Tokenizer from "../token"
import UISlider from "./ui-plugin"

export default class Editor {
    editor: AceAjax.Editor
    private ui: UISlider | null = null
    constructor(idSelector: string) {
        const editor = ace.edit(idSelector)
        editor.setTheme('ace/theme/xcode')
        editor.session.setMode('ace/mode/glsl')
        this.editor = editor
        this.bindEvents()
    }
    getValue() {
        return this.editor.getValue()
    }
    setValue(value: string) {
        // cursorPos Where to set the new value. 
        // `undefined` or 0 is selectAll, -1 is at the document start, and 1 is at the end
        this.editor.setValue(value, 1)
    }
    private bindEvents() {
        this.editor.on('click', () => {
            // 文档给了两个 api
            // 这个 api 简单，也能实现效果（源码里面是实现了的），但是 @types/ace 里面没有声明，ts 会给警告
            // editor.getSelectedText()
            // 所以换成下面这个长的
            const range = this.editor.getSelectionRange()
            const text = this.editor.session.getTextRange(range)
            if (text.length > 0) {
                return
            }
            const cursor = this.editor.getCursorPosition()
            const token = this.getLineToken(cursor.row, cursor.column)
            if (token === null) {
                return
            }
            if (token.isNumberType()) {
                this.ui = new UISlider(token.value)
                const coord = this.editor.renderer.textToScreenCoordinates(cursor.row, cursor.column)
                this.ui.showAt(coord.pageX, coord.pageY)

                const Range = ace.require('ace/range').Range
                const line = this.editor.getSession().getLine(cursor.row)
                const updateLine = (messsageType: MessageType, data: number) => {
                    // editor 不会处理替换前后文本不一致的情况
                    // 所以直接在原来旧行内容的情况下拼出一个新行，然后一行整体替换
                    // ace.js 不太行，还是得考虑换成 codemirror
                    const s1 = line.slice(0, token.start)
                    const s2 = line.slice(token.end + 1)
                    const s = s1 + String(data) + s2
                    const range = new Range(cursor.row, 0, cursor.row, Math.max(line.length, s.length))
                    this.editor.session.replace(range, s)
                }
                Message.register(MessageType.UIControlChange, updateLine)
                this.ui.onDestroy = () => {
                    Message.unregister(MessageType.UIControlChange, updateLine)
                }
            }
        })
    }
    private getLineToken(row: number, column: number) {
        const line = this.editor.getSession().getLine(row)
        const tn = new Tokenizer(line)
        const ts = tn.parse()
        for (const t of ts) {
            if (t.isNumberType() && t.start <= column && column <= t.end) {
                return t
            }
        }
        return null
    }
}