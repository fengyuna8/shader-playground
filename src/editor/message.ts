const ensure = function(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(message)
    }
}

export enum MessageType {
    // ui控件更新值
    UIControlChange
}

export default class Message {
    private static type: typeof MessageType = MessageType
    private static _instance: Message | null = null
    private eventActions: Map<MessageType, Function[]>

    static instance(): Message {
        if (this._instance === null) {
            this._instance = new Message()
        }
        return this._instance
    }
    static register<T>(messageType: MessageType, action: (messageType: MessageType, data: T) => void) {
        Message.instance()._registerEventListener(messageType, action)
    }
    static unregister(messageType: MessageType, action: (messageType: MessageType, data: T) => void) {
        Message.instance()._unregisterEventListener(messageType, action)
    }
    static send<T>(messageType: MessageType, data: T | null = null) {
        Message.instance()._emitEvent(messageType, data)
    }
    constructor() {
        this.eventActions = new Map<MessageType, Function[]>()
        for (const key of Object.keys(Message.type)) {
            const messageType = MessageType[key as keyof typeof MessageType]
            this.eventActions.set(messageType, [])
        }
    }
    private _registerEventListener<T>(messageType: MessageType, action: (messageType: MessageType, data: T) => void) {
        if (this.eventActions.has(messageType)) {
            const actions = this.eventActions.get(messageType)!
            actions.push(action)
        } else {
            ensure(false, `注册消息<${messageType}>不存在`)
        }
    }
    private _unregisterEventListener<T>(messageType: MessageType, action: (messageType: MessageType, data: T) => void) {
        if (this.eventActions.has(messageType)) {
            const actions = this.eventActions.get(messageType)!
            this.eventActions.set(messageType, [])
        } else {
            ensure(false, `注销消息<${messageType}>不存在`)
        }
    }
    private _emitEvent<T>(messageType: MessageType, data: T | null) {
        if (this.eventActions.has(messageType)) {
            const actions = this.eventActions.get(messageType)!
            for (const action of actions) {
                action(messageType, data)
            }
        } else {
            ensure(false, `发送消息<${messageType}>不存在`)
        }
    }
}