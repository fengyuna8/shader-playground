export default class Editor {
    editor: AceAjax.Editor
    constructor(idSelector: string) {
        const editor = ace.edit(idSelector)
        editor.setTheme('ace/theme/xcode')
        editor.session.setMode('ace/mode/glsl')
        this.editor = editor
    }
    getValue() {
        return this.editor.getValue()
    }
    setValue(value: string) {
        // cursorPos Where to set the new value. `undefined` or 0 is selectAll, -1 is at the document start, and 1 is at the end
        this.editor.setValue(value, 1)
    }
}