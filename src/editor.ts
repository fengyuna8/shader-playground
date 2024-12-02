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
}