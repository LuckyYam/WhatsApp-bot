const { default: Baileys, proto, downloadContentFromMessage } = require('@adiwajshing/baileys')
const { Utils } = require('../lib')
const Contact = require('./Contact')

module.exports = class Message {
    /**
     *
     * @param {proto.IWebMessageInfo} M
     * @param {client} client
     */
    constructor(M, client) {
        /**
         * @type {client}
         */
        this.client = client
        /**
         * @type {string}
         */
        this.from = M.key.remoteJid || ''
        /**
         * @type {'dm' | 'group'}
         */
        this.chat = this.from.endsWith('@s.whatsapp.net') ? 'dm' : 'group'
        /**
         * @type {{username: string, jid: string}}
         */
        this.sender = this.contact.getContact(this.chat === 'dm' ? M.key.remoteJid || '' : M.key.participant || '')
        /**
         * @type {proto.IWebMessageInfo}
         */
        this.message = M
        /**
         * @type {keyof proto.Message}
         */
        this.type = Object.keys(M.message || 0)[0]
        /**
         * @type {('videoMessage' | 'imageMessage')[]}
         */
        const supportedMediaType = ['videoMessage', 'imageMessage']
        /**
         * @type {boolean}
         */
        this.hasSupportedMediaMessage =
            this.type !== 'buttonsMessage'
                ? supportedMediaType.includes(this.type)
                : supportedMediaType.includes(Object.keys(M.message?.buttonsMessage)[0])
        const getContent = () => {
            if (M.message?.buttonsResponseMessage) return M.message?.buttonsResponseMessage?.selectedDisplayText || ''
            if (M.message?.listResponseMessage)
                return M.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ''
            return M.message?.conversation
                ? M.message.conversation
                : this.hasSupportedMediaMessage
                ? supportedMediaType.map((type) => M.message?.[type]?.caption).filter((caption) => caption)[0] || ''
                : M.message?.extendedTextMessage?.text
                ? M.message?.extendedTextMessage.text
                : ''
        }
        /**
         * @type {string}
         */
        this.content = getContent()
        /**
         * @type {string[]}
         */
        this.mentioned = []
        /**
         * @type {'extendedTextMessage'}
         */
        const type = this.type
        /**
         * @type {string[]}
         */
        const array =
            (M?.message?.[type]?.contextInfo?.mentionedJid ? M?.message[type]?.contextInfo?.mentionedJid : []) || []
        array.filter((x) => x !== null && x !== undefined).forEach((user) => this.mentioned.push(user))
        let text = this.content
        for (const mention of this.mentioned) text = text.replace(mention.split('@')[0], '')
        /**
         * @type {number[]}
         */
        this.numbers = this.utils.extractNumbers(text)
        if (M.message?.[type]?.contextInfo?.quotedMessage) {
            const { quotedMessage, participant, stanzaId } = M.message?.[type]?.contextInfo ?? {}
            if (quotedMessage && participant) {
                /**
                 * @type {keyof proto.Message}
                 */
                const Type = Object.keys(quotedMessage)[0]
                const getQuotedContent = () => {
                    if (quotedMessage?.buttonsResponseMessage)
                        return quotedMessage?.buttonsResponseMessage?.selectedDisplayText || ''
                    if (quotedMessage?.listResponseMessage)
                        return quotedMessage?.listResponseMessage?.singleSelectReply?.selectedRowId || ''
                    return quotedMessage?.conversation
                        ? quotedMessage.conversation
                        : supportedMediaType.includes(Type)
                        ? supportedMediaType
                              .map((type) => quotedMessage?.[type]?.caption)
                              .filter((caption) => caption)[0] || ''
                        : quotedMessage?.extendedTextMessage?.text
                        ? quotedMessage?.extendedTextMessage.text
                        : ''
                }
                /**
                 * @type {quoted}
                 */
                this.quoted = {
                    sender: this.contact.getContact(`${participant.split('@')[0].split(':')[0]}@s.whatsapp.net`) ?? {
                        username: 'User',
                        jid: `${participant.split('@')[0].split(':')[0]}@s.whatsapp.net}`
                    },
                    message: quotedMessage,
                    type: Type,
                    hasSupportedMediaMessage:
                        Type !== 'buttonsMessage'
                            ? supportedMediaType.includes(Type)
                            : supportedMediaType.includes(Object.keys(quotedMessage.buttonsMessage)[1]),
                    content: getQuotedContent(),
                    key: {
                        remoteJid: this.from,
                        fromMe:
                            `${participant.split('@')[0].split(':')[0]}@s.whatsapp.net}` ===
                            `${this.client.user.id.split('@')[0].split(':')[0]}@s.whatsapp.net}`,
                        id: stanzaId,
                        participant
                    }
                }
            }
        }
    }

    /**
     * @returns {Promise<Message>}
     */

    simplifyMessage = async () => {
        if (this.message.pushName) this.sender.username = this.message.pushName
        this.sender.jid = `${this.sender.jid.split('@')[0].split(':')[0]}@s.whatsapp.net`
        return this
    }

    /**
     * @param {string | Buffer} content
     * @param {'text' | 'image' | 'audio' | 'video' | 'sticker' | 'document'} type
     * @param {boolean} gif
     * @param {string} mimetype
     * @param {string} caption
     * @param {string[]} mentions
     * @param {Buffer} thumbnail
     * @param {string} fileName
     */

    reply = async (content, type = 'text', gif = false, mimetype, caption, mentions, thumbnail, fileName) => {
        if (type === 'text' && Buffer.isBuffer(content)) throw new Error('Cannot send a Buffer as a text message')
        return this.client.sendMessage(
            this.from,
            {
                [type]: content,
                caption,
                gifPlayback: gif,
                mimetype,
                mentions,
                jpegThumbnail: thumbnail,
                fileName
            },
            {
                quoted: this.message
            }
        )
    }

    /**
     * @param {string} emoji
     * @param {proto.IMessageKey} key
     */

    react = async (emoji, key = this.message.key) =>
        await this.client.sendMessage(this.from, {
            react: {
                text: emoji,
                key
            }
        })

    /**
     * @param {proto.IMessage} message
     * @returns {Promise<Buffer>}
     */

    downloadMediaMessage = async (message) => {
        /**@type {keyof proto.IMessage} */
        let type = Object.keys(message)[0]
        let msg = message[type]
        if (type === 'buttonsMessage' || type === 'viewOnceMessage') {
            if (type === 'viewOnceMessage') msg = msg.message
            if (type === 'viewOnceMessage') type = Object.keys(msg)[0]
            else type = Object.keys(msg)[1]
            msg = msg[type]
        }
        const stream = await downloadContentFromMessage(msg, type.replace('Message', ''))
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    /**
     * @private
     */

    utils = new Utils()

    /**
     * @private
     */

    contact = new Contact()

    /**
     * @private
     * @type {client}
     */

    client
}

/**
 * @typedef {ReturnType<typeof Baileys>} client
 */

/**
 * @typedef {{sender: {username: string, jid: string}, message: proto.IMessage, type: keyof proto.Message, hasSupportedMediaMessage: boolean, content: string, id: string}} quoted
 */
