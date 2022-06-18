const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter')

module.exports = class command extends Command {
    constructor() {
        super('emoji', {
            description: 'Gives the sticker of the given emoji',
            category: 'utils',
            usage: 'emoji [emoji]',
            aliases: ['emoj', 'ejs'],
            exp: 20,
            cooldown: 10
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        const { context } = args
        if (!context) return void M.reply('Provide the Emoji you want as sticker, Baka!')
        const code = context.trim()
        const ent = code
        const hex = ent.codePointAt(0).toString(16)
        try {
            const buffer = await this.helper.utils.getBuffer(`https://emojiapi.dev/api/v1/${hex}/512.webp`)
            const sticker = new Sticker(buffer, {
                pack: 'Emoji Sticker By',
                author: `${this.helper.config.name} 🌟`,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                quality: 100,
                background: 'transparent'
            })
            return void (await M.reply(await sticker.build(), 'sticker'))
        } catch (err) {
            return void (await M.reply(`*Invalid Input, Baka!*`))
        }
    }
}
