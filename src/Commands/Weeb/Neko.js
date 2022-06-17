const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('neko', {
            description: 'Sends random neko image',
            category: 'weeb',
            usage: 'neko',
            exp: 20,
            cooldown: 5
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        const { url } = await this.helper.utils.fetch('https://nekos.life/api/v2/img/neko')
        return void (await M.reply(await this.helper.utils.getBuffer(url), 'image'))
    }
}
