const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('waifu', {
            description: 'Sends a random waifu image',
            category: 'weeb',
            usage: 'waifu',
            exp: 10,
            cooldown: 5
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        const { images } = await this.helper.utils.fetch('https://api.waifu.im/random/?selected_tags=waifu')
        return void (await M.reply(await this.helper.utils.getBuffer(images[0].url), 'image'))
    }
}
