import Baileys from '@adiwajshing/baileys'

export * from './Config'
export * from './Command'
export * from './Message'

export interface IContact {
    jid: string
    username: string
}

export interface ICall {
    content: {
        attrs: {
            'call-creator': string
        }
        tag: string
    }[]
}

export type client = ReturnType<typeof Baileys>
